"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { Loader2, Map, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getPublishedPropertiesAction } from "@/features/properties/actions";
import { PropertyExploreCard } from "@/features/properties/components/property-list/property-explore-card";
import { LocationAutocomplete } from "@/features/properties/components/property-form/location-autocomplete";
import {
  PROPERTY_TYPE_VALUES,
  AMENITY_VALUES,
} from "@/features/properties/types";
import { PROPERTY_TYPES, AMENITIES } from "@/features/properties/schema";
import type {
  Property,
  PropertyType,
  Amenity,
  Location,
} from "@/features/properties/types";

interface ExploreClientProps {
  initialProperties: Property[];
  matchedPropertyIds: string[];
}

const TOLERANCE_OPTIONS = [0, 2, 4] as const;

/** "YYYY-MM-DD" + N weeks, without reintroducing a timezone shift. */
function addWeeks(dateStr: string, weeks: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + weeks * 7);
  return date.toISOString().slice(0, 10);
}

export function ExploreClient({
  initialProperties,
  matchedPropertyIds,
}: ExploreClientProps) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [location, setLocation] = useState("");
  const [locationDetails, setLocationDetails] = useState<Location | null>(null);
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [toleranceWeeks, setToleranceWeeks] = useState<number>(0);
  const [propertyTypes, setPropertyTypes] = useState<Set<PropertyType>>(
    new Set()
  );
  const [amenities, setAmenities] = useState<Set<Amenity>>(new Set());
  const [isPending, startTransition] = useTransition();

  const matchedSet = useMemo(
    () => new Set(matchedPropertyIds),
    [matchedPropertyIds]
  );

  const refetch = useCallback(
    (overrides?: {
      location?: string;
      minRent?: string;
      maxRent?: string;
      moveInDate?: string;
      toleranceWeeks?: number;
      propertyTypes?: Set<PropertyType>;
      amenities?: Set<Amenity>;
    }) => {
      const nextLocation = overrides?.location ?? location;
      const nextMinRent = overrides?.minRent ?? minRent;
      const nextMaxRent = overrides?.maxRent ?? maxRent;
      const nextMoveInDate = overrides?.moveInDate ?? moveInDate;
      const nextToleranceWeeks = overrides?.toleranceWeeks ?? toleranceWeeks;
      const nextPropertyTypes = overrides?.propertyTypes ?? propertyTypes;
      const nextAmenities = overrides?.amenities ?? amenities;

      startTransition(async () => {
        // The service only takes one property type filter today; the sidebar lets a tenant
        // check several, so we filter client-side on the fetched result for the extras.
        const [firstType] = nextPropertyTypes;

        const result = await getPublishedPropertiesAction({
          location: nextLocation || undefined,
          minMonthlyRent: nextMinRent ? Number(nextMinRent) : undefined,
          maxMonthlyRent: nextMaxRent ? Number(nextMaxRent) : undefined,
          propertyType: nextPropertyTypes.size === 1 ? firstType : undefined,
          fromDate: nextMoveInDate
            ? addWeeks(nextMoveInDate, -nextToleranceWeeks)
            : undefined,
          toDate: nextMoveInDate
            ? addWeeks(nextMoveInDate, nextToleranceWeeks)
            : undefined,
        });

        const filtered = result.filter((property) => {
          if (
            nextPropertyTypes.size > 1 &&
            (!property.propertyType ||
              !nextPropertyTypes.has(property.propertyType))
          ) {
            return false;
          }
          if (nextAmenities.size > 0) {
            const propertyAmenities = new Set(property.amenities);
            for (const amenity of nextAmenities) {
              if (!propertyAmenities.has(amenity)) return false;
            }
          }
          return true;
        });

        setProperties(filtered);
      });
    },
    [
      location,
      minRent,
      maxRent,
      moveInDate,
      toleranceWeeks,
      propertyTypes,
      amenities,
    ]
  );

  const handleLocationChange = (value: string, details?: Location) => {
    setLocation(value);
    setLocationDetails(details ?? null);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      refetch({ location: value });
    }, 400);
  };

  const handleRentBlur = () => refetch();

  const handleMoveInDateChange = (value: string) => {
    setMoveInDate(value);
    refetch({ moveInDate: value });
  };

  const handleToleranceChange = (weeks: number) => {
    setToleranceWeeks(weeks);
    refetch({ toleranceWeeks: weeks });
  };

  const togglePropertyType = (type: PropertyType) => {
    const next = new Set(propertyTypes);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    setPropertyTypes(next);
    refetch({ propertyTypes: next });
  };

  const toggleAmenity = (amenity: Amenity) => {
    const next = new Set(amenities);
    if (next.has(amenity)) {
      next.delete(amenity);
    } else {
      next.add(amenity);
    }
    setAmenities(next);
    refetch({ amenities: next });
  };

  const handleReset = () => {
    setLocation("");
    setLocationDetails(null);
    setMinRent("");
    setMaxRent("");
    setMoveInDate("");
    setToleranceWeeks(0);
    setPropertyTypes(new Set());
    setAmenities(new Set());
    startTransition(async () => {
      const result = await getPublishedPropertiesAction();
      setProperties(result);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            {filtersOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
            Filters
          </Button>
          <p className="text-muted-foreground text-sm">
            Showing {properties.length}{" "}
            {properties.length === 1 ? "property" : "properties"}
            {isPending && (
              <Loader2 className="text-primary ml-2 inline size-4 animate-spin align-middle" />
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" disabled className="gap-2">
          <Map className="size-4" />
          Show Map
        </Button>
      </div>

      <div
        className={
          filtersOpen
            ? "grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]"
            : "grid grid-cols-1 gap-6"
        }
      >
        {/* Filters sidebar */}
        {filtersOpen && (
          <Card className="h-fit space-y-6 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-sm font-semibold">Filters</h3>
              <button
                type="button"
                onClick={handleReset}
                className="text-primary text-xs font-medium hover:underline"
              >
                Clear all
              </button>
            </div>

            <div>
              <Label className="text-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                Location
              </Label>
              <LocationAutocomplete
                value={location}
                onChange={handleLocationChange}
                placeholder="Search by neighbourhood"
              />
              {locationDetails && (
                <p className="text-muted-foreground mt-1 text-xs">
                  Pinned at {locationDetails.latitude.toFixed(4)},{" "}
                  {locationDetails.longitude.toFixed(4)}
                </p>
              )}
            </div>

            <div>
              <h4 className="text-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                Rent Range
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  inputMode="numeric"
                  value={minRent}
                  onChange={(e) => setMinRent(e.target.value)}
                  onBlur={handleRentBlur}
                />
                <Input
                  placeholder="Max"
                  type="number"
                  inputMode="numeric"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  onBlur={handleRentBlur}
                />
              </div>
            </div>

            <div>
              <h4 className="text-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                Move-in Date
              </h4>
              <Input
                type="date"
                aria-label="Move-in date"
                value={moveInDate}
                onChange={(e) => handleMoveInDateChange(e.target.value)}
              />
              <div className="mt-2 flex gap-1">
                {TOLERANCE_OPTIONS.map((weeks) => (
                  <button
                    key={weeks}
                    type="button"
                    onClick={() => handleToleranceChange(weeks)}
                    className={`flex-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                      toleranceWeeks === weeks
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-hairline-soft text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    ±{weeks}w
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                Property Type
              </h4>
              <div className="space-y-2">
                {PROPERTY_TYPE_VALUES.map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={propertyTypes.has(type)}
                      onCheckedChange={() => togglePropertyType(type)}
                    />
                    {PROPERTY_TYPES[type]}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                Amenities
              </h4>
              <div className="space-y-2">
                {AMENITY_VALUES.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={amenities.has(amenity)}
                      onCheckedChange={() => toggleAmenity(amenity)}
                    />
                    {AMENITIES[amenity]}
                  </label>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Property grid */}
        <div className={isPending ? "opacity-60 transition-opacity" : ""}>
          {properties.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-lg border">
              <p className="text-muted-foreground text-sm">
                No properties match your filters.
              </p>
            </div>
          ) : (
            <div
              className={
                filtersOpen
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
                  : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }
            >
              {properties.map((property) => (
                <PropertyExploreCard
                  key={property.id}
                  property={property}
                  isInterested={matchedSet.has(property.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
