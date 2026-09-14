"use client";

import { Controller, useFormState, type UseFormReturn } from "react-hook-form";
import { Building2, Sofa } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field";
import { AMENITIES, type PropertyFormValues } from "../../schema";
import {
  AMENITY_VALUES,
  BUILDING_FACILITY_VALUES,
  UNIT_AMENITY_VALUES,
  type Amenity,
} from "../../types";

/**
 * Step 4 — split into what the building provides and what is inside the unit.
 *
 * Both halves persist to `properties.amenities`, so a listing describes itself even with no
 * condo linked. The building half additionally seeds `condos.facilities`, which is what lets
 * the next listing in the same block inherit them instead of being asked again.
 */
export function AmenitiesSection({
  form,
}: {
  form: UseFormReturn<PropertyFormValues>;
}) {
  const { control } = form;
  // See basics-section.tsx: `form.formState` off a stable prop does not re-render.
  const { errors } = useFormState({ control });

  return (
    <Controller
      control={control}
      name="amenities"
      render={({ field }) => {
        const selected = new Set(field.value ?? []);

        const toggle = (amenity: Amenity, checked: boolean) => {
          const next = new Set(selected);
          if (checked) next.add(amenity);
          else next.delete(amenity);
          // Kept in AMENITY_VALUES order so the preview and the saved row do not
          // reshuffle as boxes are ticked.
          field.onChange(
            AMENITY_VALUES.filter((value) => next.has(value)) as Amenity[]
          );
        };

        return (
          <div className="space-y-6">
            <AmenityGroup
              icon={<Building2 className="size-4" />}
              title="Building facilities"
              hint="Shared with every unit in the building."
              values={BUILDING_FACILITY_VALUES}
              selected={selected}
              onToggle={toggle}
            />

            <AmenityGroup
              icon={<Sofa className="size-4" />}
              title="In the unit"
              hint="What comes with this apartment specifically."
              values={UNIT_AMENITY_VALUES}
              selected={selected}
              onToggle={toggle}
            />

            <FieldError
              errors={errors.amenities ? [errors.amenities] : undefined}
            />
          </div>
        );
      }}
    />
  );
}

function AmenityGroup({
  icon,
  title,
  hint,
  values,
  selected,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  values: readonly Amenity[];
  selected: Set<Amenity>;
  onToggle: (amenity: Amenity, checked: boolean) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="flex items-center gap-2">
        <span className="text-primary" aria-hidden>
          {icon}
        </span>
        <span className="text-sm font-semibold">{title}</span>
      </legend>
      <p className="text-muted-foreground text-xs">{hint}</p>

      <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
        {values.map((amenity) => (
          <Label
            key={amenity}
            className="hover:bg-accent flex cursor-pointer items-center gap-3 rounded-lg border p-3 font-normal"
          >
            <Checkbox
              checked={selected.has(amenity)}
              onCheckedChange={(checked) => onToggle(amenity, checked === true)}
            />
            {AMENITIES[amenity]}
          </Label>
        ))}
      </div>
    </fieldset>
  );
}
