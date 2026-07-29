"use client";

import { ListingRoleToggle } from "@/features/properties/components/listing-role-toggle";
import { PropertyTypeCards } from "@/features/properties/components/property-type-cards";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FieldErrors } from "react-hook-form";
import type { ListPropertyFormData } from "@/features/properties/schema";

export function Step1PropertyDetails({
  formData,
  onChange,
  disabled,
  errors,
}: {
  formData: {
    listingRole: "owner" | "agent";
    propertyType: "apartment" | "condo" | "house" | "townhouse";
    location: string;
    rentAmount: number;
    description: string;
  };
  onChange: (name: string, value: string | number) => void;
  disabled?: boolean;
  errors?: FieldErrors<ListPropertyFormData>;
}) {
  return (
    <div className="space-y-[var(--sp-xl)]">
      {/* Field 1: Listing As */}
      <div>
        <label className="font-title-md text-nav-link text-ink mb-[var(--sp-base)] block">
          Listing As <span className="text-destructive">*</span>
        </label>
        <ListingRoleToggle
          value={formData.listingRole}
          onChange={(v) => onChange("listingRole", v)}
          disabled={disabled}
        />
        {errors?.listingRole && (
          <p className="text-destructive mt-1 text-sm">
            {errors.listingRole.message}
          </p>
        )}
      </div>

      {/* Field 2: Property Type */}
      <div>
        <label className="font-title-md text-nav-link text-ink mb-[var(--sp-base)] block">
          Property Type <span className="text-destructive">*</span>
        </label>
        <PropertyTypeCards
          value={formData.propertyType}
          onChange={(v) => onChange("propertyType", v)}
          disabled={disabled}
        />
        {errors?.propertyType && (
          <p className="text-destructive mt-1 text-sm">
            {errors.propertyType.message}
          </p>
        )}
      </div>

      {/* Field 3: Property Location */}
      <div>
        <label
          htmlFor="location"
          className="font-title-md text-nav-link text-ink mb-[var(--sp-xs)] block"
        >
          Property Location <span className="text-destructive">*</span>
        </label>
        <div className="group relative">
          <div className="text-muted-foreground group-focus-within:text-primary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[var(--sp-base)] transition-colors">
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: '"FILL" 0, "wght" 400' }}
            >
              location_on
            </span>
          </div>
          <Input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => onChange("location", e.target.value)}
            placeholder="Search area, landmark or neighborhood"
            required
            minLength={5}
            maxLength={200}
            disabled={disabled}
            aria-invalid={errors?.location ? "true" : "false"}
            aria-describedby={errors?.location ? "location-error" : undefined}
            className="border-hairline bg-surface-card focus-visible:ring-primary/20 focus-visible:border-primary placeholder:text-muted-soft h-10 rounded-[var(--radius-sm)] border pl-12 text-base focus-visible:ring-2"
          />
        </div>
        {errors?.location && (
          <p id="location-error" className="text-destructive mt-1 text-sm">
            {errors.location.message}
          </p>
        )}
      </div>

      {/* Field 4: Monthly Rent */}
      <div className="md:w-1/2">
        <label
          htmlFor="rentAmount"
          className="font-title-md text-nav-link text-ink mb-[var(--sp-xs)] block"
        >
          Monthly Rent (THB) <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[var(--sp-base)]">
            <span className="text-muted text-sm font-bold">฿</span>
          </div>
          <Input
            id="rentAmount"
            type="number"
            value={formData.rentAmount === 0 ? "" : formData.rentAmount}
            onChange={(e) =>
              onChange("rentAmount", parseInt(e.target.value) || 0)
            }
            placeholder="0.00"
            required
            min="1"
            max="10000000"
            disabled={disabled}
            aria-invalid={errors?.rentAmount ? "true" : "false"}
            aria-describedby={errors?.rentAmount ? "rent-error" : undefined}
            className="border-hairline bg-surface-card focus-visible:ring-primary/20 focus-visible:border-primary placeholder:text-muted-soft h-10 rounded-[var(--radius-sm)] border pl-10 text-base focus-visible:ring-2"
          />
        </div>
        {errors?.rentAmount && (
          <p id="rent-error" className="text-destructive mt-1 text-sm">
            {errors.rentAmount.message}
          </p>
        )}
      </div>

      {/* Field 5: Description (optional) */}
      <div>
        <label
          htmlFor="description"
          className="font-title-md text-nav-link text-ink mb-[var(--sp-xs)] block"
        >
          Description{" "}
          <span className="text-muted-foreground text-sm font-normal">
            (optional)
          </span>
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Tell potential tenants what makes your property special..."
          maxLength={2000}
          disabled={disabled}
          aria-invalid={errors?.description ? "true" : "false"}
          aria-describedby={
            errors?.description ? "description-error" : undefined
          }
          className="border-hairline bg-surface-card focus-visible:ring-primary/20 focus-visible:border-primary placeholder:text-muted-soft min-h-[100px] rounded-[var(--radius-sm)] border px-[var(--sp-base)] py-[var(--sp-sm)] text-base focus-visible:ring-2"
        />
        <div className="text-caption-sm text-muted-foreground mt-1 flex justify-between">
          <span>
            {errors?.description && (
              <span id="description-error" className="text-destructive">
                {errors.description.message}
              </span>
            )}
          </span>
          <span>{formData.description.length}/2000</span>
        </div>
      </div>
    </div>
  );
}
