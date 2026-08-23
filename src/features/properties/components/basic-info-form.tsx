"use client";

import { useActionState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { PropertyStepper } from "./property-stepper";
import { submitBasicDetailsAction } from "../actions";
import { basicDetailsSchema, type BasicDetailsData } from "../schema";
import { PROPERTY_TYPES } from "../schema";
import type { Property, PropertyType } from "../types";
import { PropertyNextAction } from "../types";
import { cn } from "@/lib/utils";
import { hasBasicDetailsChanged } from "../utils/change-detection";

interface BasicDetailsFormProps {
  property: Property;
  onSuccess?: (updatedProperty: Property) => void;
}

const PROPERTY_TYPE_ICONS: Record<PropertyType, string> = {
  apartment: "apartment",
  condo: "domain",
  house: "home",
  townhouse: "holiday_village",
};

export function BasicDetailsForm({
  property,
  onSuccess,
}: BasicDetailsFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitBasicDetailsAction,
    null
  );

  const form = useForm<BasicDetailsData>({
    resolver: zodResolver(basicDetailsSchema),
    mode: "onBlur",
    defaultValues: {
      propertyType: property.propertyType || "apartment",
      title: property.title || "",
      location: property.location || "",
      monthlyRent: property.monthlyRent || undefined,
      bedrooms: property.bedrooms || 1,
      bathrooms: property.bathrooms || 1,
      description: property.description || "",
    },
  });

  useEffect(() => {
    if (state?.errors) {
      Object.entries(state.errors).forEach(([key, messages]) => {
        form.setError(key as keyof BasicDetailsData, {
          type: "manual",
          message: Array.isArray(messages) ? messages.join("\n") : messages,
        });
      });
    }
    if (state?.errorMessage) {
      toast.error(state.errorMessage);
    }
    if (state?.success) {
      const formValues = form.getValues();

      const changed = hasBasicDetailsChanged(formValues, property);

      if (onSuccess) {
        // Update only basic info fields and next action, preserve other property data
        const updatedProperty: Property = {
          ...property,
          propertyType: formValues.propertyType,
          title: formValues.title,
          location: formValues.location,
          monthlyRent: formValues.monthlyRent,
          bedrooms: formValues.bedrooms,
          bathrooms: formValues.bathrooms,
          description: formValues.description || null,
          nextAction: PropertyNextAction.AMENITIES,
        };

        if (changed) {
          toast.success("Property details saved!");
        } else {
          toast.info("No changes made");
        }

        onSuccess(updatedProperty);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="mx-auto max-w-[720px]">
      <PropertyStepper currentStep={1} />

      <Card className="bg-surface-soft/50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl">Property Details</CardTitle>
          <CardDescription className="text-base">
            Tell us about your property
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <input type="hidden" name="propertyId" value={property.id} />
          <input type="hidden" name="bedrooms" value={form.watch("bedrooms")} />
          <input
            type="hidden"
            name="bathrooms"
            value={form.watch("bathrooms")}
          />
          <CardContent className="space-y-6">
            {/* Property Type Box Selector */}
            <Controller
              name="propertyType"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Property Type <span className="text-destructive">*</span>
                  </FieldLabel>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {(
                      Object.entries(PROPERTY_TYPES) as [PropertyType, string][]
                    ).map(([type, label]) => (
                      <label key={type} className="group cursor-pointer">
                        <input
                          type="radio"
                          name="propertyType"
                          value={type}
                          checked={field.value === type}
                          onChange={() => {
                            field.onChange(type);
                            form.clearErrors("propertyType");
                          }}
                          className="peer sr-only"
                          disabled={isPending}
                        />
                        <div
                          className={cn(
                            "flex flex-col items-center justify-center rounded-lg border-2 p-4 text-center transition-all",
                            "hover:border-primary",
                            "peer-checked:border-primary peer-checked:bg-primary-container/10 peer-checked:text-primary"
                          )}
                        >
                          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                            <span className="material-symbols-outlined text-primary text-[24px]">
                              {PROPERTY_TYPE_ICONS[type]}
                            </span>
                          </div>
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
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
                  <div className="bg-surface-container-low hover:bg-surface-container flex items-center justify-between rounded-lg p-4 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="text-primary flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">
                          bed
                        </span>
                      </div>
                      <div>
                        <p className="text-on-surface font-semibold">
                          Bedrooms
                        </p>
                        <p className="text-on-surface-variant text-sm">
                          How many sleeping areas?
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(Math.max(1, field.value - 1))
                        }
                        className="border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary flex h-10 w-10 items-center justify-center rounded-full border transition-all"
                        disabled={isPending}
                      >
                        <span className="material-symbols-outlined">
                          remove
                        </span>
                      </button>
                      <span className="w-8 text-center text-xl font-bold">
                        {field.value}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(Math.min(20, field.value + 1))
                        }
                        className="border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary flex h-10 w-10 items-center justify-center rounded-full border transition-all"
                        disabled={isPending}
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  </div>
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
                  <div className="bg-surface-container-low hover:bg-surface-container flex items-center justify-between rounded-lg p-4 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="text-primary flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">
                          bathtub
                        </span>
                      </div>
                      <div>
                        <p className="text-on-surface font-semibold">
                          Bathrooms
                        </p>
                        <p className="text-on-surface-variant text-sm">
                          Full or half bathrooms
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(Math.max(1, field.value - 1))
                        }
                        className="border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary flex h-10 w-10 items-center justify-center rounded-full border transition-all"
                        disabled={isPending}
                      >
                        <span className="material-symbols-outlined">
                          remove
                        </span>
                      </button>
                      <span className="w-8 text-center text-xl font-bold">
                        {field.value}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(Math.min(20, field.value + 1))
                        }
                        className="border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary flex h-10 w-10 items-center justify-center rounded-full border transition-all"
                        disabled={isPending}
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Title & Monthly Rent Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Title */}
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Property Title <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="text"
                      placeholder="e.g., Luxury 2BR Apartment"
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                      onChange={(e) => {
                        field.onChange(e);
                        form.clearErrors("title");
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Monthly Rent */}
              <Controller
                name="monthlyRent"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Monthly Rent (THB){" "}
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
                        placeholder="0"
                        aria-invalid={fieldState.invalid}
                        disabled={isPending}
                        value={field.value || ""}
                        onChange={(e) => {
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          );
                          form.clearErrors("monthlyRent");
                        }}
                      />
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Location */}
            <Controller
              name="location"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Location <span className="text-destructive">*</span>
                  </FieldLabel>
                  <div className="relative">
                    <div className="text-on-surface-variant pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="material-symbols-outlined">
                        location_on
                      </span>
                    </div>
                    <Input
                      {...field}
                      id={field.name}
                      type="text"
                      className="pl-12"
                      placeholder="e.g., Sukhumvit, Bangkok"
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                      onChange={(e) => {
                        field.onChange(e);
                        form.clearErrors("location");
                      }}
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Description (Optional)
                  </FieldLabel>
                  <textarea
                    {...field}
                    id={field.name}
                    className="border-outline-variant bg-surface-container-lowest placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-primary/20 h-[120px] w-full resize-none rounded-lg border p-4 transition-all outline-none focus:ring-2"
                    placeholder="Tell potential tenants what makes your property special..."
                    disabled={isPending}
                    onChange={(e) => {
                      field.onChange(e);
                      form.clearErrors("description");
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
                    Saving...
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
