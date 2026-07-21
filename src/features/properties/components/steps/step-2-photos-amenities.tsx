"use client";

import { AmenitiesCheckboxGrid } from "@/features/properties/components/amenities-checkbox-grid";
import { BookingStepper } from "@/components/ui/booking-stepper";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { FieldErrors } from "react-hook-form";
import type { ListPropertyFormData } from "@/features/properties/schema";

const FURNISHING_LABELS: Record<string, string> = {
  fully: "Fully Furnished",
  partial: "Partially Furnished",
  none: "Unfurnished",
};

const FURNISHING_DESCRIPTIONS: Record<string, string> = {
  fully: "All furniture and appliances included",
  partial: "Basic furniture included (wardrobe, curtains)",
  none: "No furniture or appliances included",
};

const FURNISHING_ICONS: Record<string, string> = {
  fully: "chair",
  partial: "weekend",
  none: "square_foot",
};

interface Step2PhotosAmenitiesProps {
  formData: {
    propertyType: "apartment" | "condo" | "house" | "townhouse";
    furnishing: "fully" | "partial" | "none";
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
  };
  onChange: (name: string, value: string | number | string[]) => void;
  disabled?: boolean;
  errors?: FieldErrors<ListPropertyFormData>;
}

export function Step2PhotosAmenities({
  formData,
  onChange,
  disabled,
  errors,
}: Step2PhotosAmenitiesProps) {
  return (
    <div className="space-y-[var(--sp-xl)]">
      {/* Bedrooms & Bathrooms */}
      <div>
        <label className="font-title-md text-nav-link text-ink mb-[var(--sp-base)] block">
          Bedrooms & Bathrooms <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-1 gap-[var(--sp-base)] md:grid-cols-2">
          <div className="border-hairline bg-surface-card rounded-lg border p-[var(--sp-base)]">
            <div className="flex items-center justify-between">
              <label
                htmlFor="bedrooms"
                className="font-title-md text-nav-link text-ink"
              >
                Bedrooms
              </label>
              <BookingStepper
                value={formData.bedrooms}
                onChange={(v) => onChange("bedrooms", v)}
                min={0}
                max={20}
                disabled={disabled}
              />
            </div>
          </div>
          <div className="border-hairline bg-surface-card rounded-lg border p-[var(--sp-base)]">
            <div className="flex items-center justify-between">
              <label
                htmlFor="bathrooms"
                className="font-title-md text-nav-link text-ink"
              >
                Bathrooms
              </label>
              <BookingStepper
                value={formData.bathrooms}
                onChange={(v) => onChange("bathrooms", v)}
                min={0}
                max={20}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        {(errors?.bedrooms || errors?.bathrooms) && (
          <p className="text-destructive mt-1 text-sm">
            {errors.bedrooms?.message ?? errors.bathrooms?.message}
          </p>
        )}
      </div>

      {/* Furnishing - Radio Cards with Icons */}
      <div>
        <label className="font-title-md text-nav-link text-ink mb-[var(--sp-base)] block">
          Furnishing <span className="text-destructive">*</span>
        </label>
        <RadioGroup
          name="furnishing"
          value={formData.furnishing}
          onValueChange={(v) => onChange("furnishing", v)}
          disabled={disabled}
        >
          <div className="grid grid-cols-1 gap-[var(--sp-sm)] md:grid-cols-3">
            {(["fully", "partial", "none"] as const).map((type) => {
              const selected = formData.furnishing === type;
              return (
                <label
                  key={type}
                  className={cn(
                    "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border p-[var(--sp-base)] transition-all",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-hairline bg-surface-card text-ink hover:border-primary"
                  )}
                >
                  <RadioGroupItem
                    value={type}
                    className="sr-only"
                    disabled={disabled}
                  />
                  <span
                    className="material-symbols-outlined text-display-md mb-[var(--sp-xs)]"
                    style={{
                      fontVariationSettings: selected
                        ? '"FILL" 1, "wght" 500'
                        : '"FILL" 0, "wght" 400',
                    }}
                  >
                    {FURNISHING_ICONS[type]}
                  </span>
                  <div className="text-center">
                    <span className="text-sm font-medium">
                      {FURNISHING_LABELS[type]}
                    </span>
                    <p className="text-caption-sm text-muted-foreground mt-1 text-center">
                      {FURNISHING_DESCRIPTIONS[type]}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </RadioGroup>
        {errors?.furnishing && (
          <p className="text-destructive mt-1 text-sm">
            {errors.furnishing.message}
          </p>
        )}
      </div>

      {/* Amenities Checkbox Grid */}
      <AmenitiesCheckboxGrid
        amenities={formData.amenities}
        onChange={(amenities) => onChange("amenities", amenities)}
        disabled={disabled}
      />
    </div>
  );
}
