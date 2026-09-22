"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import type { z } from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

import {
  requirementsFormSchema,
  PROPERTY_TYPES,
  BEDROOMS_LABELS,
  BATHROOMS_LABELS,
  FURNISHING_LABELS,
  LEASE_LENGTH_LABELS,
  INTENDED_DURATION_LABELS,
  AMENITY_WISHLIST_LABELS,
} from "../schema";
import {
  PROPERTY_TYPE_VALUES,
  BEDROOMS_VALUES,
  BATHROOMS_VALUES,
  FURNISHING_VALUES,
  LEASE_LENGTH_VALUES,
  INTENDED_DURATION_VALUES,
  AMENITY_WISHLIST_VALUES,
} from "../types";
import type { TenantProfile, TenantRequirements, Amenity } from "../types";

export type RequirementsFormValues = z.input<typeof requirementsFormSchema>;

/** Shared default values for the requirements form, used by both the full-page
 * create form and the edit drawer so prefill logic never drifts between them. */
export function buildRequirementsDefaults(
  profile: TenantProfile | null,
  requirements: TenantRequirements | null
): RequirementsFormValues {
  return {
    firstName: profile?.firstName ?? "",
    occupation: profile?.occupation ?? "",
    employer: profile?.employer ?? "",
    reasonForMoving: profile?.reasonForMoving ?? "",
    intendedDuration: profile?.intendedDuration ?? "1_year",
    numberOfOccupants: profile?.numberOfOccupants ?? 1,
    hasPets: profile?.hasPets ?? false,
    isSmoker: profile?.isSmoker ?? false,
    bio: profile?.bio ?? "",
    propertyType: requirements?.propertyType ?? "apartment",
    preferredLocation: requirements?.preferredLocation ?? "",
    monthlyBudget: requirements?.monthlyBudget,
    moveInDate: requirements?.moveInDate ?? "",
    bedrooms: requirements?.bedrooms ?? "studio",
    bathrooms: requirements?.bathrooms ?? "1",
    minSizeSqm: requirements?.minSizeSqm ?? undefined,
    furnishing: requirements?.furnishing ?? "furnished",
    preferredNeighborhoods: requirements?.preferredNeighborhoods ?? [],
    petFriendly: requirements?.petFriendly ?? false,
    parkingNeeded: requirements?.parkingNeeded ?? false,
    amenitiesWishlist:
      (requirements?.amenitiesWishlist as Amenity[] | undefined) ?? [],
    additionalNotes: requirements?.additionalNotes ?? "",
    preferredLeaseLength: requirements?.preferredLeaseLength ?? "",
  };
}

interface SectionProps {
  form: UseFormReturn<RequirementsFormValues>;
  disabled: boolean;
}

/** "About you" — shown to owners when the tenant requests one of their properties. */
export function AboutYouSection({ form, disabled }: SectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-foreground text-lg font-semibold">About you</h3>
        <p className="text-muted-foreground text-sm">
          Shown to owners when you request one of their properties.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="firstName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                First Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="e.g. Alex"
                aria-invalid={fieldState.invalid}
                disabled={disabled}
                onChange={(e) => {
                  field.onChange(e);
                  form.clearErrors("firstName");
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="occupation"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Occupation <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="e.g. Software Engineer"
                aria-invalid={fieldState.invalid}
                disabled={disabled}
                onChange={(e) => {
                  field.onChange(e);
                  form.clearErrors("occupation");
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="employer"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Employer (optional)</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="e.g. Beer Co"
                aria-invalid={fieldState.invalid}
                disabled={disabled}
                onChange={(e) => {
                  field.onChange(e);
                  form.clearErrors("employer");
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="intendedDuration"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                How long do you plan to stay?{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <select
                {...field}
                id={field.name}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:ring-3 md:text-sm"
                disabled={disabled}
                onChange={(e) => {
                  field.onChange(e);
                  form.clearErrors("intendedDuration");
                }}
              >
                {INTENDED_DURATION_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {INTENDED_DURATION_LABELS[value]}
                  </option>
                ))}
              </select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="numberOfOccupants"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Number of Occupants <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="number"
                min={1}
                aria-invalid={fieldState.invalid}
                disabled={disabled}
                value={(field.value as string | number | undefined) ?? 1}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  form.clearErrors("numberOfOccupants");
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        name="reasonForMoving"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Why are you moving? <span className="text-destructive">*</span>
            </FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              placeholder="e.g. Relocating for a new job, need more space, closer to family..."
              disabled={disabled}
              onChange={(e) => {
                field.onChange(e);
                form.clearErrors("reasonForMoving");
              }}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="hasPets"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal" className="items-center gap-2">
              <Checkbox
                id="hasPets"
                name="hasPets"
                disabled={disabled}
                defaultChecked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <FieldLabel htmlFor="hasPets" className="font-normal">
                I have pets
              </FieldLabel>
            </Field>
          )}
        />

        <Controller
          name="isSmoker"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal" className="items-center gap-2">
              <Checkbox
                id="isSmoker"
                name="isSmoker"
                disabled={disabled}
                defaultChecked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <FieldLabel htmlFor="isSmoker" className="font-normal">
                I smoke
              </FieldLabel>
            </Field>
          )}
        />
      </div>

      <Controller
        name="bio"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              A short intro (optional)
            </FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              placeholder="Anything else that helps an owner get to know you..."
              disabled={disabled}
              onChange={(e) => {
                field.onChange(e);
                form.clearErrors("bio");
              }}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </div>
  );
}

/** "What you're looking for" — property criteria used to curate matches. */
export function LookingForSection({ form, disabled }: SectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-foreground text-lg font-semibold">
          What you&apos;re looking for
        </h3>
        <p className="text-muted-foreground text-sm">
          Help us narrow down the best matches for you.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="propertyType"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Property Type <span className="text-destructive">*</span>
              </FieldLabel>
              <select
                {...field}
                id={field.name}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:ring-3 md:text-sm"
                disabled={disabled}
                onChange={(e) => {
                  field.onChange(e);
                  form.clearErrors("propertyType");
                }}
              >
                {PROPERTY_TYPE_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {PROPERTY_TYPES[value]}
                  </option>
                ))}
              </select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="preferredLocation"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Preferred Location <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                placeholder="e.g. Sukhumvit, Bangkok"
                aria-invalid={fieldState.invalid}
                disabled={disabled}
                onChange={(e) => {
                  field.onChange(e);
                  form.clearErrors("preferredLocation");
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="monthlyBudget"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Monthly Budget (THB) <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="text-on-surface-variant font-bold">฿</span>
                </div>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  className="pl-10"
                  placeholder="e.g. 18000"
                  aria-invalid={fieldState.invalid}
                  disabled={disabled}
                  value={(field.value as string | number | undefined) ?? ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    form.clearErrors("monthlyBudget");
                  }}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="moveInDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Move-in Date <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="date"
                aria-invalid={fieldState.invalid}
                disabled={disabled}
                onChange={(e) => {
                  field.onChange(e);
                  form.clearErrors("moveInDate");
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="bedrooms"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Bedrooms <span className="text-destructive">*</span>
              </FieldLabel>
              <select
                {...field}
                id={field.name}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:ring-3 md:text-sm"
                disabled={disabled}
                onChange={(e) => {
                  field.onChange(e);
                  form.clearErrors("bedrooms");
                }}
              >
                {BEDROOMS_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {BEDROOMS_LABELS[value]}
                  </option>
                ))}
              </select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="bathrooms"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Bathrooms <span className="text-destructive">*</span>
              </FieldLabel>
              <select
                {...field}
                id={field.name}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:ring-3 md:text-sm"
                disabled={disabled}
                onChange={(e) => {
                  field.onChange(e);
                  form.clearErrors("bathrooms");
                }}
              >
                {BATHROOMS_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {BATHROOMS_LABELS[value]}
                  </option>
                ))}
              </select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="minSizeSqm"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Min Size (sqm) Optional
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="number"
                placeholder="e.g. 35"
                aria-invalid={fieldState.invalid}
                disabled={disabled}
                value={(field.value as string | number | undefined) ?? ""}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  form.clearErrors("minSizeSqm");
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="furnishing"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Furnishing <span className="text-destructive">*</span>
              </FieldLabel>
              <select
                {...field}
                id={field.name}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:ring-3 md:text-sm"
                disabled={disabled}
                onChange={(e) => {
                  field.onChange(e);
                  form.clearErrors("furnishing");
                }}
              >
                {FURNISHING_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {FURNISHING_LABELS[value]}
                  </option>
                ))}
              </select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
    </div>
  );
}

/** "Additional Preferences" — optional, helps owners understand fit. */
export function PreferencesSection({ form, disabled }: SectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-foreground text-lg font-semibold">
          Additional Preferences
        </h3>
        <p className="text-muted-foreground text-sm">
          Optional, but it helps owners understand your fit.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="preferredNeighborhoods"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
              <FieldLabel htmlFor="preferredNeighborhoods">
                Preferred Neighborhoods
              </FieldLabel>
              <Input
                id="preferredNeighborhoods"
                name="preferredNeighborhoods"
                type="text"
                placeholder="e.g. Thonglor, Ekkamai, Ari (comma separated)"
                disabled={disabled}
                defaultValue={field.value?.join(", ") ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean)
                  )
                }
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="preferredLeaseLength"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Preferred Lease Length
              </FieldLabel>
              <select
                {...field}
                id={field.name}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:ring-3 md:text-sm"
                disabled={disabled}
                onChange={(e) => {
                  field.onChange(e);
                  form.clearErrors("preferredLeaseLength");
                }}
              >
                <option value="">No preference</option>
                {LEASE_LENGTH_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {LEASE_LENGTH_LABELS[value]}
                  </option>
                ))}
              </select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="petFriendly"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal" className="items-center gap-2">
              <Checkbox
                id="petFriendly"
                name="petFriendly"
                disabled={disabled}
                defaultChecked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <FieldLabel htmlFor="petFriendly" className="font-normal">
                Must be pet-friendly
              </FieldLabel>
            </Field>
          )}
        />

        <Controller
          name="parkingNeeded"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal" className="items-center gap-2">
              <Checkbox
                id="parkingNeeded"
                name="parkingNeeded"
                disabled={disabled}
                defaultChecked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <FieldLabel htmlFor="parkingNeeded" className="font-normal">
                Parking required
              </FieldLabel>
            </Field>
          )}
        />
      </div>

      <Controller
        name="amenitiesWishlist"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Amenities Wishlist</FieldLabel>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {AMENITY_WISHLIST_VALUES.map((value) => {
                const checked = field.value?.includes(value) ?? false;
                return (
                  <div key={value} className="flex items-center gap-2">
                    <Checkbox
                      id={`amenity-${value}`}
                      name="amenitiesWishlist"
                      value={value}
                      disabled={disabled}
                      defaultChecked={checked}
                      onCheckedChange={(next) => {
                        const current = field.value ?? [];
                        field.onChange(
                          next === true
                            ? [...current, value]
                            : current.filter((v) => v !== value)
                        );
                      }}
                    />
                    <FieldLabel
                      htmlFor={`amenity-${value}`}
                      className="text-sm font-normal"
                    >
                      {AMENITY_WISHLIST_LABELS[value]}
                    </FieldLabel>
                  </div>
                );
              })}
            </div>
          </Field>
        )}
      />

      <Controller
        name="additionalNotes"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Additional Notes</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              placeholder="Anything else we should know? e.g. pet size, noise sensitivity, accessibility needs..."
              disabled={disabled}
              onChange={(e) => {
                field.onChange(e);
                form.clearErrors("additionalNotes");
              }}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </div>
  );
}
