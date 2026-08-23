"use client";

import { useActionState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
import { submitAmenitiesAction } from "../actions";
import type { PropertyActionState, AmenitiesData } from "../schema";
import { amenitiesSchema, FURNISHED_STATUS, AMENITIES } from "../schema";
import type { Property, FurnishedStatus, Amenity } from "../types";
import { PropertyNextAction } from "../types";
import { cn } from "@/lib/utils";

interface AmenitiesFormProps {
  property: Property;
  onSuccess?: (updatedProperty: Property) => void;
}

const FURNISHED_ICONS: Record<FurnishedStatus, string> = {
  furnished: "chair",
  partial: "weekend",
  unfurnished: "square_foot",
};

const AMENITY_ICONS: Record<Amenity, string> = {
  ac: "ac_unit",
  wifi: "wifi",
  parking: "local_parking",
  pool: "pool",
  gym: "fitness_center",
  microwave: "microwave",
  washing_machine: "local_laundry_service",
  refrigerator: "kitchen",
  tv: "tv",
  balcony: "balcony",
  elevator: "elevator",
  security: "security",
  sofa: "chair",
};

export function AmenitiesForm({ property, onSuccess }: AmenitiesFormProps) {
  const [state, formAction, isPending] = useActionState<
    PropertyActionState | null,
    FormData
  >(submitAmenitiesAction, null);

  const form = useForm<AmenitiesData>({
    resolver: zodResolver(amenitiesSchema),
    mode: "onBlur",
    defaultValues: {
      furnishedStatus: property.furnishedStatus,
      amenities: property.amenities ?? [],
    },
  });

  const handleAmenityChange = (amenity: Amenity, checked: boolean) => {
    const current = form.getValues("amenities");
    if (checked) {
      form.setValue("amenities", [...current, amenity]);
    } else {
      form.setValue(
        "amenities",
        current.filter((a) => a !== amenity)
      );
    }
  };

  useEffect(() => {
    if (state?.errorMessage) {
      toast.error(state.errorMessage);
    }
    if (state?.success && onSuccess) {
      const { furnishedStatus, amenities } = form.getValues();

      const updatedProperty = {
        ...property,
        furnishedStatus,
        amenities,
        nextAction: PropertyNextAction.REVIEW,
      };

      onSuccess(updatedProperty);
    }
  }, [state, onSuccess, property, form]);

  return (
    <div className="mx-auto max-w-[720px]">
      <PropertyStepper currentStep={2} />

      <Card className="bg-surface-soft/50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl">Amenities & Features</CardTitle>
          <CardDescription className="text-base">
            Tell us about the property features
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <input type="hidden" name="propertyId" value={property.id} />
          <CardContent className="space-y-6">
            {/* Furnished Status */}
            <Controller
              name="furnishedStatus"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={
                    fieldState.invalid || !!state?.errors?.furnishedStatus
                  }
                >
                  <FieldLabel>
                    Furnished Status <span className="text-destructive">*</span>
                  </FieldLabel>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {(
                      Object.entries(FURNISHED_STATUS) as [
                        FurnishedStatus,
                        string,
                      ][]
                    ).map(([status, label]) => (
                      <div key={status} className="relative">
                        <input
                          type="radio"
                          id={`furnished-${status}`}
                          name="furnishedStatus"
                          value={status}
                          checked={field.value === status}
                          onChange={() => field.onChange(status)}
                          className="peer sr-only"
                          disabled={isPending}
                        />
                        <label
                          htmlFor={`furnished-${status}`}
                          className={cn(
                            "flex h-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-4 text-center transition-all",
                            "hover:bg-surface-container-high",
                            "peer-checked:border-primary peer-checked:bg-primary-container/10 peer-checked:text-primary"
                          )}
                        >
                          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                            <span className="material-symbols-outlined text-primary text-[24px]">
                              {FURNISHED_ICONS[status]}
                            </span>
                          </div>
                          <span className="text-sm font-semibold">{label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {(fieldState.invalid || state?.errors?.furnishedStatus) && (
                    <FieldError
                      errors={[
                        {
                          message:
                            fieldState.error?.message ||
                            state?.errors?.furnishedStatus?.[0] ||
                            "",
                        },
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            {/* Amenities */}
            <Controller
              name="amenities"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={
                    fieldState.invalid || !!state?.errors?.amenities
                  }
                >
                  <FieldLabel>Amenities</FieldLabel>
                  <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
                    {(Object.entries(AMENITIES) as [Amenity, string][]).map(
                      ([amenity, label]) => (
                        <div key={amenity} className="relative">
                          <input
                            type="checkbox"
                            id={`amenity-${amenity}`}
                            name="amenities"
                            value={amenity}
                            checked={field.value.includes(amenity)}
                            onChange={(e) =>
                              handleAmenityChange(amenity, e.target.checked)
                            }
                            className="peer sr-only"
                            disabled={isPending}
                          />
                          <label
                            htmlFor={`amenity-${amenity}`}
                            className={cn(
                              "flex h-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-2 text-center transition-all",
                              "hover:bg-surface-container-high",
                              "peer-checked:border-primary peer-checked:bg-primary-container/10 peer-checked:text-primary"
                            )}
                          >
                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                              <span className="material-symbols-outlined text-primary text-[24px]">
                                {AMENITY_ICONS[amenity]}
                              </span>
                            </div>
                            <span className="text-sm font-semibold">
                              {label}
                            </span>
                          </label>
                        </div>
                      )
                    )}
                  </div>
                  {(fieldState.invalid || state?.errors?.amenities) && (
                    <FieldError
                      errors={[
                        {
                          message:
                            fieldState.error?.message ||
                            state?.errors?.amenities?.[0] ||
                            "",
                        },
                      ]}
                    />
                  )}
                </Field>
              )}
            />
          </CardContent>
          <CardFooter className="bg-surface-strong mt-8 flex flex-col gap-4">
            <div className="flex w-full justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  onSuccess?.({
                    ...property,
                    nextAction: PropertyNextAction.BASIC_DETAILS,
                  })
                }
                disabled={isPending}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="cursor-pointer px-4"
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
