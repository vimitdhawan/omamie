"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PROPERTY_TYPES, FURNISHED_STATUS, AMENITIES } from "../schema";
import type { PropertySearchFilters } from "../types";

interface PropertyFiltersProps {
  filters: PropertySearchFilters;
  onFilterChange: (filters: PropertySearchFilters) => void;
}

export function PropertyFilters({
  filters,
  onFilterChange,
}: PropertyFiltersProps) {
  const [localFilters, setLocalFilters] =
    useState<PropertySearchFilters>(filters);

  const handlePropertyTypeToggle = (type: string) => {
    const current = localFilters.propertyTypes || [];
    const updated = current.some((t) => t === type)
      ? current.filter((t) => t !== type)
      : ([...current, type] as typeof localFilters.propertyTypes);

    const newFilters = { ...localFilters, propertyTypes: updated };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAmenityToggle = (amenity: string) => {
    const current = localFilters.amenities || [];
    const updated = current.some((a) => a === amenity)
      ? current.filter((a) => a !== amenity)
      : ([...current, amenity] as typeof localFilters.amenities);

    const newFilters = { ...localFilters, amenities: updated };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFurnishedToggle = (status: string) => {
    const current = localFilters.furnishedStatus || [];
    const updated = current.some((s) => s === status)
      ? current.filter((s) => s !== status)
      : ([...current, status] as typeof localFilters.furnishedStatus);

    const newFilters = { ...localFilters, furnishedStatus: updated };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: PropertySearchFilters = {};
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <aside className="w-full shrink-0 md:w-64">
      <div className="sticky top-24 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="font-semibold text-gray-900">Filters</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-primary text-xs"
          >
            Reset
          </Button>
        </div>

        <ScrollArea className="max-h-[calc(100vh-200px)]">
          <div className="space-y-6 pr-4">
            {/* Property Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium tracking-wider text-gray-600 uppercase">
                Property Type
              </Label>
              <div className="space-y-2">
                {Object.entries(PROPERTY_TYPES).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${key}`}
                      checked={localFilters.propertyTypes?.some(
                        (t) => t === key
                      )}
                      onCheckedChange={() => handlePropertyTypeToggle(key)}
                    />
                    <Label
                      htmlFor={`type-${key}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Furnished Status */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-medium tracking-wider text-gray-600 uppercase">
                Furnishing
              </Label>
              <div className="space-y-2">
                {Object.entries(FURNISHED_STATUS).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`furnished-${key}`}
                      checked={localFilters.furnishedStatus?.some(
                        (s) => s === key
                      )}
                      onCheckedChange={() => handleFurnishedToggle(key)}
                    />
                    <Label
                      htmlFor={`furnished-${key}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-medium tracking-wider text-gray-600 uppercase">
                Amenities
              </Label>
              <div className="space-y-2">
                {Object.entries(AMENITIES)
                  .slice(0, 8)
                  .map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${key}`}
                        checked={localFilters.amenities?.some((a) => a === key)}
                        onCheckedChange={() => handleAmenityToggle(key)}
                      />
                      <Label
                        htmlFor={`amenity-${key}`}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
