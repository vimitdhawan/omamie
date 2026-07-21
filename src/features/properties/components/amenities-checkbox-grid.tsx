"use client";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const AMENITIES = [
  { id: "air_conditioning", label: "Air Conditioning", icon: "ac_unit" },
  { id: "wifi", label: "WiFi", icon: "wifi" },
  { id: "parking", label: "Parking", icon: "local_parking" },
  { id: "balcony", label: "Balcony", icon: "balcony" },
  {
    id: "washing_machine",
    label: "Washing Machine",
    icon: "local_laundry_service",
  },
  { id: "refrigerator", label: "Refrigerator", icon: "kitchen" },
  { id: "microwave", label: "Microwave", icon: "microwave" },
  { id: "tv", label: "TV", icon: "tv" },
  { id: "gym_access", label: "Gym Access", icon: "fitness_center" },
  { id: "pool_access", label: "Pool Access", icon: "pool" },
  { id: "security", label: "Security", icon: "security" },
  { id: "pet_friendly", label: "Pet Friendly", icon: "pets" },
] as const;

interface AmenitiesCheckboxGridProps {
  amenities: string[];
  onChange: (amenities: string[]) => void;
  disabled?: boolean;
}

export function AmenitiesCheckboxGrid({
  amenities,
  onChange,
  disabled,
}: AmenitiesCheckboxGridProps) {
  const handleToggle = (amenityId: string) => {
    if (disabled) return;
    const newAmenities = amenities.includes(amenityId)
      ? amenities.filter((a) => a !== amenityId)
      : [...amenities, amenityId];
    onChange(newAmenities);
  };

  return (
    <div className="space-y-2">
      <label className="text-ink text-sm font-medium">Amenities</label>
      <p className="text-caption-sm text-muted-soft">Select all that apply</p>
      <div className="grid grid-cols-2 gap-3">
        {AMENITIES.map((amenity) => (
          <label
            key={amenity.id}
            className={cn(
              "relative flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all",
              amenities.includes(amenity.id)
                ? "border-primary bg-primary/5 text-primary"
                : "border-hairline text-ink hover:border-primary/50 hover:bg-surface-soft bg-white"
            )}
          >
            <Checkbox
              id={`amenity-${amenity.id}`}
              checked={amenities.includes(amenity.id)}
              onChange={() => handleToggle(amenity.id)}
              disabled={disabled}
              className="sr-only"
            />
            <span
              className={cn(
                "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border-2 transition-all",
                amenities.includes(amenity.id)
                  ? "border-primary bg-primary"
                  : "border-hairline"
              )}
            >
              {amenities.includes(amenity.id) && (
                <span
                  className="material-symbols-outlined text-on-primary text-sm"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  check
                </span>
              )}
              {!amenities.includes(amenity.id) && (
                <span
                  className="material-symbols-outlined text-muted-foreground text-base"
                  style={{ fontVariationSettings: '"FILL" 0' }}
                >
                  {amenity.icon}
                </span>
              )}
            </span>
            <span className="text-body-sm font-medium">{amenity.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
