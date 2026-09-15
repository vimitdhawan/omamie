"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  fetchLocationSuggestionsAction,
  fetchLocationEnrichmentAction,
} from "../../actions";
import type { Location } from "../../types";

export type LocationSuggestion = {
  place_name: string;
  place_id: string;
  center: [longitude: number, latitude: number];
  context: Array<{ id: string; text: string; short_code?: string }>;
};

export type LocationAutocompleteProps = {
  id?: string;
  value: string;
  onChange: (value: string, locationDetails?: Location) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
};

export function LocationAutocomplete({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "e.g., Khlong Toei",
  disabled = false,
}: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || !query.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await fetchLocationSuggestionsAction(query);
      setSuggestions(results);
      setOpen(results.length > 0);
    } catch (error) {
      console.error("Failed to fetch location suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    const { place_name, center, context } = suggestion;
    const [longitude, latitude] = center;

    const contextMap = context.reduce(
      (acc, item) => {
        const [key] = item.id.split(".");
        acc[key] = item;
        return acc;
      },
      {} as Record<string, (typeof context)[0]>
    );

    const locationDetails: Location = {
      addressLine1: place_name.split(",")[0]?.trim(),
      city: contextMap.locality?.text || undefined,
      district: contextMap.district?.text || undefined,
      state: contextMap.place?.text || contextMap.region?.text,
      postalCode: contextMap.postcode?.text,
      country: contextMap.country?.text,
      countryCode: contextMap.country?.short_code,
      latitude,
      longitude,
      provider: "mapbox",
      providerPlaceId: suggestion.place_id,
    };

    setInputValue(place_name);
    onChange(place_name, locationDetails);
    setOpen(false);

    // Enrich with postal code and district via reverse geocoding
    (async () => {
      try {
        const enrichment = await fetchLocationEnrichmentAction(
          longitude,
          latitude
        );
        if (enrichment.postalCode || enrichment.district) {
          onChange(place_name, {
            ...locationDetails,
            postalCode: enrichment.postalCode || locationDetails.postalCode,
            district: enrichment.district || locationDetails.district,
          });
        }
      } catch (err) {
        console.error("Failed to enrich location:", err);
      }
    })();
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <MapPin
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => {
            setTimeout(() => setOpen(false), 150);
            onBlur?.();
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("pl-9", disabled && "cursor-not-allowed")}
        />
        {isLoading && (
          <div className="border-primary pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-t-transparent" />
        )}
      </div>

      {open && (
        <div className="border-hairline-soft bg-popover absolute top-full right-0 left-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border shadow-lg">
          {!isLoading && suggestions.length === 0 && (
            <div className="text-muted-foreground px-3 py-4 text-sm">
              No neighbourhoods found in Bangkok.
            </div>
          )}
          {suggestions.map((suggestion) => {
            const contextMap = suggestion.context.reduce(
              (acc, item) => {
                const [key] = item.id.split(".");
                acc[key] = item;
                return acc;
              },
              {} as Record<string, (typeof suggestion.context)[0]>
            );

            const neighborhood =
              suggestion.place_name.split(",")[0]?.trim() ||
              suggestion.place_name;
            const district = contextMap.district?.text || "";
            const province =
              contextMap.region?.text || contextMap.place?.text || "";
            const postalCode = contextMap.postcode?.text || "";

            const secondaryText = [district, province, postalCode]
              .filter(Boolean)
              .join(", ");

            return (
              <button
                key={suggestion.place_id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionSelect(suggestion)}
                className="hover:bg-accent flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors"
              >
                <span className="text-foreground text-sm font-medium">
                  {neighborhood}
                </span>
                {secondaryText && (
                  <span className="text-muted-foreground text-xs">
                    {secondaryText}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
