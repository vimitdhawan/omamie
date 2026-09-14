"use client";

import { Controller, useFormState, type UseFormReturn } from "react-hook-form";
import { Bath, BedDouble, Building, Ruler } from "lucide-react";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { ChipRadio } from "./field-parts";
import { IconInput } from "./icon-input";
import {
  FURNISHED_STATUS,
  countFieldOptions,
  numericFieldOptions,
  type PropertyFormValues,
} from "../../schema";
import { FURNISHED_STATUS_VALUES, type FurnishedStatus } from "../../types";

const FURNISHING_OPTIONS = FURNISHED_STATUS_VALUES.map((value) => ({
  value,
  label: FURNISHED_STATUS[value],
}));

/** Step 2 — the physical unit: rooms, size, height in the building, furnishing. */
export function SpecsSection({
  form,
}: {
  form: UseFormReturn<PropertyFormValues>;
}) {
  const { register, control } = form;
  // See basics-section.tsx: `form.formState` off a stable prop does not re-render.
  const { errors } = useFormState({ control });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <IconInput
            id="bedrooms"
            icon={<BedDouble className="size-4" />}
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            {...register("bedrooms", countFieldOptions)}
          />
          <FieldError
            errors={errors.bedrooms ? [errors.bedrooms] : undefined}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <IconInput
            id="bathrooms"
            icon={<Bath className="size-4" />}
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            {...register("bathrooms", countFieldOptions)}
          />
          <FieldError
            errors={errors.bathrooms ? [errors.bathrooms] : undefined}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="areaSqm">Usable floor area (m²)</Label>
        <IconInput
          id="areaSqm"
          icon={<Ruler className="size-4" />}
          type="number"
          inputMode="decimal"
          step="0.5"
          min={1}
          placeholder="85"
          {...register("areaSqm", numericFieldOptions)}
        />
        <FieldError errors={errors.areaSqm ? [errors.areaSqm] : undefined} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="floorNumber">Floor</Label>
          <IconInput
            id="floorNumber"
            icon={<Building className="size-4" />}
            type="number"
            inputMode="numeric"
            placeholder="18"
            {...register("floorNumber", numericFieldOptions)}
          />
          <FieldError
            errors={errors.floorNumber ? [errors.floorNumber] : undefined}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="totalFloors">Floors in building</Label>
          <IconInput
            id="totalFloors"
            icon={<Building className="size-4" />}
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="34"
            {...register("totalFloors", numericFieldOptions)}
          />
          <FieldError
            errors={errors.totalFloors ? [errors.totalFloors] : undefined}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Furnishing</Label>
        <Controller
          control={control}
          name="furnishedStatus"
          render={({ field }) => (
            <ChipRadio
              label="Furnishing"
              options={FURNISHING_OPTIONS}
              value={field.value}
              onValueChange={(value: FurnishedStatus) => field.onChange(value)}
            />
          )}
        />
        <FieldError
          errors={errors.furnishedStatus ? [errors.furnishedStatus] : undefined}
        />
      </div>
    </div>
  );
}
