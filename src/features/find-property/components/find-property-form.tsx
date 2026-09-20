"use client";

import { useActionState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  findPropertyFormSchema,
  PROPERTY_TYPES,
  BEDROOMS_LABELS,
  BATHROOMS_LABELS,
  FURNISHING_LABELS,
  LEASE_LENGTH_LABELS,
  AMENITY_WISHLIST_LABELS,
  type FindPropertyFormData,
  type FindPropertyActionState,
} from "../schema";
import {
  PROPERTY_TYPE_VALUES,
  BEDROOMS_VALUES,
  BATHROOMS_VALUES,
  FURNISHING_VALUES,
  LEASE_LENGTH_VALUES,
  AMENITY_WISHLIST_VALUES,
} from "../types";
import { handleFindProperty } from "../actions";
import { FindPropertySuccess } from "./find-property-success";

export function FindPropertyForm() {
  const [state, formAction, isPending] = useActionState(
    handleFindProperty,
    {} as FindPropertyActionState
  );

  const form = useForm<z.input<typeof findPropertyFormSchema>>({
    resolver: zodResolver(findPropertyFormSchema),
    mode: "onBlur",
    defaultValues: {
      propertyType: "apartment",
      preferredLocation: "",
      monthlyBudget: undefined,
      moveInDate: "",
      bedrooms: "studio",
      bathrooms: "1",
      minSizeSqm: undefined,
      furnishing: "furnished",
      preferredNeighborhoods: [],
      petFriendly: false,
      parkingNeeded: false,
      amenitiesWishlist: [],
      additionalNotes: "",
      preferredLeaseLength: "",
    },
  });

  useEffect(() => {
    if (state?.errorMessage) {
      toast.error(state.errorMessage);
    }
    if (state?.errors) {
      Object.entries(state.errors).forEach(([key, messages]) => {
        form.setError(key as keyof FindPropertyFormData, {
          type: "manual",
          message: messages?.join(", "),
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state?.success) {
    return <FindPropertySuccess />;
  }

  return (
    <Card className="bg-surface-soft/50 border-gray-200">
      <CardHeader>
        <CardTitle className="text-2xl">Find Property</CardTitle>
        <CardDescription className="text-base">
          Tell us where we can send your curated property matches.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Property Type */}
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
                    disabled={isPending}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Preferred Location */}
            <Controller
              name="preferredLocation"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Preferred Location{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    placeholder="e.g. Sukhumvit, Bangkok"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                    onChange={(e) => {
                      field.onChange(e);
                      form.clearErrors("preferredLocation");
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Monthly Budget */}
            <Controller
              name="monthlyBudget"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Monthly Budget (THB){" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="text-on-surface-variant font-bold">
                        ฿
                      </span>
                    </div>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      className="pl-10"
                      placeholder="e.g. 18000"
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                      value={(field.value as string | number | undefined) ?? ""}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        form.clearErrors("monthlyBudget");
                      }}
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Move-in Date */}
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
                    disabled={isPending}
                    onChange={(e) => {
                      field.onChange(e);
                      form.clearErrors("moveInDate");
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Bedrooms */}
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
                    disabled={isPending}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Bathrooms */}
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
                    disabled={isPending}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Min Size */}
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
                    disabled={isPending}
                    value={(field.value as string | number | undefined) ?? ""}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      form.clearErrors("minSizeSqm");
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Furnishing */}
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
                    disabled={isPending}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </CardContent>

        <CardContent className="border-border space-y-6 border-t pt-6">
          <div>
            <h3 className="text-foreground text-lg font-semibold">
              Additional Preferences
            </h3>
            <p className="text-muted-foreground text-sm">
              Help us narrow down the best matches for you.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Preferred Neighborhoods */}
            <Controller
              name="preferredNeighborhoods"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="sm:col-span-2"
                >
                  <FieldLabel htmlFor="preferredNeighborhoods">
                    Preferred Neighborhoods
                  </FieldLabel>
                  <Input
                    id="preferredNeighborhoods"
                    name="preferredNeighborhoods"
                    type="text"
                    placeholder="e.g. Thonglor, Ekkamai, Ari (comma separated)"
                    disabled={isPending}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Preferred Lease Length */}
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
                    disabled={isPending}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Pet Friendly */}
            <Controller
              name="petFriendly"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal" className="items-center gap-2">
                  <Checkbox
                    id="petFriendly"
                    name="petFriendly"
                    disabled={isPending}
                    defaultChecked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                  <FieldLabel htmlFor="petFriendly" className="font-normal">
                    Must be pet-friendly
                  </FieldLabel>
                </Field>
              )}
            />

            {/* Parking Needed */}
            <Controller
              name="parkingNeeded"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal" className="items-center gap-2">
                  <Checkbox
                    id="parkingNeeded"
                    name="parkingNeeded"
                    disabled={isPending}
                    defaultChecked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                  <FieldLabel htmlFor="parkingNeeded" className="font-normal">
                    Parking required
                  </FieldLabel>
                </Field>
              )}
            />
          </div>

          {/* Amenities Wishlist */}
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
                          disabled={isPending}
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

          {/* Additional Notes */}
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
                  disabled={isPending}
                  onChange={(e) => {
                    field.onChange(e);
                    form.clearErrors("additionalNotes");
                  }}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </CardContent>

        <CardFooter className="bg-surface-strong mt-8 flex flex-col gap-4">
          <div className="flex w-full justify-end">
            <Button
              type="submit"
              className="cursor-pointer px-4"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
