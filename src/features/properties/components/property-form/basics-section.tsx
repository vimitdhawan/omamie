"use client";

import { useMemo, useState } from "react";
import { Controller, useFormState, type UseFormReturn } from "react-hook-form";
import {
  Building2,
  CalendarClock,
  CalendarDays,
  Coins,
  Wallet,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { LocationAutocomplete } from "./location-autocomplete";
import { ChipRadio } from "./field-parts";
import { IconInput } from "./icon-input";
import {
  LEASE_PRESET_MONTHS,
  PROPERTY_TYPES,
  numericFieldOptions,
  type PropertyFormValues,
} from "../../schema";
import { cn } from "@/lib/utils";
import { PROPERTY_TYPE_VALUES, type PropertyType } from "../../types";

const PROPERTY_TYPE_OPTIONS = PROPERTY_TYPE_VALUES.map((value) => ({
  value,
  label: PROPERTY_TYPES[value],
}));

/** Step 1 — what the place is, where it is, and the commercial terms. */
export function BasicsSection({
  form,
}: {
  form: UseFormReturn<PropertyFormValues>;
}) {
  const { register, control, setValue } = form;
  // Subscribed via the hook rather than read off `form.formState`: `form` is a stable
  // object, so a memoizing compiler would skip re-rendering this section and the
  // validation errors would never appear.
  const { errors } = useFormState({ control });

  // While the owner is still typing in the box, "Location is required" or "Select a
  // neighbourhood..." reads as a false accusation -- they haven't finished yet. Hold the
  // message back until they leave the field.
  const [locationFocused, setLocationFocused] = useState(false);

  // Bounds for "Available from": today through 3 months out, kept as the same
  // "YYYY-MM-DD" strings the field stores end to end, so no timezone shift can move the
  // boundary. Computed once per mount rather than per keystroke.
  const { minAvailableFrom, maxAvailableFrom } = useMemo(() => {
    const today = new Date();
    const toIso = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
    return {
      minAvailableFrom: toIso(today),
      maxAvailableFrom: toIso(
        new Date(today.getFullYear(), today.getMonth() + 3, today.getDate())
      ),
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>
          Property type <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="propertyType"
          render={({ field }) => (
            <ChipRadio
              label="Property type"
              options={PROPERTY_TYPE_OPTIONS}
              value={field.value}
              onValueChange={(value: PropertyType) => field.onChange(value)}
            />
          )}
        />
        <FieldError
          errors={errors.propertyType ? [errors.propertyType] : undefined}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="buildingName">Building / condo name</Label>
        <IconInput
          id="buildingName"
          icon={<Building2 className="size-4" />}
          placeholder="e.g., The Estelle Phrom Phong"
          {...register("buildingName")}
        />
        <p className="text-muted-foreground text-xs">
          Saved to a shared building directory, so listings in the same block
          can reuse its details later.
        </p>
        <FieldError
          errors={errors.buildingName ? [errors.buildingName] : undefined}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location">
          Neighbourhood / district <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="location"
          render={({ field }) => (
            <LocationAutocomplete
              id="location"
              value={field.value ?? ""}
              onFocus={() => setLocationFocused(true)}
              onBlur={() => {
                setLocationFocused(false);
                field.onBlur();
              }}
              onChange={(value, details) => {
                field.onChange(value);
                // Coordinates only exist once a suggestion is picked; clearing them when the
                // owner edits the text again is what stops a stale pin being published.
                setValue("latitude", details?.latitude, {
                  shouldValidate: false,
                });
                setValue("longitude", details?.longitude, {
                  shouldValidate: false,
                });
                setValue(
                  "locationContext",
                  details
                    ? JSON.stringify({
                        city: details.city ?? undefined,
                        district: details.district ?? undefined,
                        state: details.state ?? undefined,
                        postalCode: details.postalCode ?? undefined,
                        country: details.country ?? undefined,
                        countryCode: details.countryCode ?? undefined,
                        provider: details.provider ?? undefined,
                        providerPlaceId: details.providerPlaceId ?? undefined,
                      })
                    : undefined,
                  { shouldValidate: false }
                );
              }}
            />
          )}
        />
        {/* One message, not two: an empty box needs "Location is required"; typed text
            that hasn't been picked from the dropdown needs "Select a neighbourhood..." --
            never both at once for what is, to the owner, a single field. */}
        <FieldError
          errors={
            locationFocused
              ? undefined
              : errors.location
                ? [errors.location]
                : errors.latitude
                  ? [errors.latitude]
                  : undefined
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="monthlyRent">
            Monthly rent (THB) <span className="text-destructive">*</span>
          </Label>
          <IconInput
            id="monthlyRent"
            icon={<Coins className="size-4" />}
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="45000"
            {...register("monthlyRent", {
              setValueAs: (value) =>
                value === "" || value === null ? undefined : Number(value),
            })}
          />
          <FieldError
            errors={errors.monthlyRent ? [errors.monthlyRent] : undefined}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="securityDepositMonths">
            Security deposit (months){" "}
            <span className="text-destructive">*</span>
          </Label>
          <IconInput
            id="securityDepositMonths"
            icon={<Wallet className="size-4" />}
            type="number"
            inputMode="numeric"
            min={0}
            max={24}
            placeholder="2"
            {...register("securityDepositMonths", numericFieldOptions)}
          />
          <FieldError
            errors={
              errors.securityDepositMonths
                ? [errors.securityDepositMonths]
                : undefined
            }
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="availableFrom">
          Available from <span className="text-destructive">*</span>
        </Label>
        <IconInput
          id="availableFrom"
          icon={<CalendarDays className="size-4" />}
          type="date"
          min={minAvailableFrom}
          max={maxAvailableFrom}
          {...register("availableFrom", {
            // "" must become null, not undefined: null is what clears a saved date.
            setValueAs: (value) => (value === "" ? null : value),
          })}
        />
        <FieldError
          errors={errors.availableFrom ? [errors.availableFrom] : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label>
          Minimum lease period <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="minimumLeaseMonths"
          render={({ field }) => (
            <LeasePeriodPicker
              value={field.value ?? null}
              onChange={field.onChange}
            />
          )}
        />
        <p className="text-muted-foreground text-xs">
          Most relocating tenants in Bangkok search for 12 months.
        </p>
        <FieldError
          errors={
            errors.minimumLeaseMonths ? [errors.minimumLeaseMonths] : undefined
          }
        />
      </div>
    </div>
  );
}

/**
 * Presets for the terms landlords actually offer, plus a custom box for anything else.
 * The custom input opens when the stored value is not one of the presets, so reopening the
 * drawer on a 24-month lease shows it rather than silently looking unset.
 */
function LeasePeriodPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const isPreset =
    value !== null &&
    (LEASE_PRESET_MONTHS as readonly number[]).includes(value);
  const [custom, setCustom] = useState(value !== null && !isPreset);

  return (
    <div className="space-y-2">
      <div
        role="radiogroup"
        aria-label="Minimum lease period"
        className="flex flex-wrap gap-2"
      >
        {LEASE_PRESET_MONTHS.map((months) => {
          const selected = !custom && value === months;
          return (
            <button
              key={months}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setCustom(false);
                onChange(months);
              }}
              className={cn(
                "focus-visible:ring-ring rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-soft text-foreground hover:bg-surface-strong"
              )}
            >
              {months} {months === 1 ? "month" : "months"}
            </button>
          );
        })}
        <button
          type="button"
          role="radio"
          aria-checked={custom}
          onClick={() => {
            setCustom(true);
            onChange(null);
          }}
          className={cn(
            "focus-visible:ring-ring rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
            custom
              ? "bg-primary text-primary-foreground"
              : "bg-surface-soft text-foreground hover:bg-surface-strong"
          )}
        >
          Other
        </button>
      </div>

      {custom && (
        <IconInput
          aria-label="Minimum lease in months"
          icon={<CalendarClock className="size-4" />}
          type="number"
          inputMode="numeric"
          min={1}
          max={60}
          placeholder="Months, e.g. 24"
          value={value ?? ""}
          onChange={(event) => {
            const next = event.target.value;
            onChange(next === "" ? null : Number(next));
          }}
        />
      )}
    </div>
  );
}
