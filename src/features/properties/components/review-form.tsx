"use client";

import { useState, useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PropertyStepper } from "./property-stepper";
import { submitReviewAction } from "../actions";
import type { PropertyActionState } from "../schema";
import { PROPERTY_TYPES, FURNISHED_STATUS, AMENITIES } from "../schema";
import type { Property } from "../types";
import { PropertyNextAction } from "../types";
import { formatCurrency } from "@/lib/utils/format";

interface ReviewFormProps {
  property: Property;
  onSuccess?: (updatedProperty: Property) => void;
  onBack?: () => void;
}

export function ReviewForm({ property, onSuccess, onBack }: ReviewFormProps) {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);

  const [state, formAction, isPending] = useActionState<
    PropertyActionState | null,
    FormData
  >(submitReviewAction, null);

  useEffect(() => {
    if (state?.errorMessage) {
      toast.error(state.errorMessage);
    }
    if (state?.success) {
      if (onSuccess) {
        toast.success("Property published!");
        // Don't change the status here - keep original so success page can determine
        // if this was a first-time create (status: pending) or an update (status: review/active/etc)
        const updatedProperty = {
          ...property,
          nextAction: PropertyNextAction.COMPLETED,
        };
        onSuccess(updatedProperty);
      }
    }
  }, [state, property, onSuccess]);

  return (
    <div className="mx-auto max-w-[720px]">
      <PropertyStepper currentStep={3} />

      <Card className="bg-surface-soft/50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl">Review & Confirm</CardTitle>
          <CardDescription className="text-base">
            Please review your listing details before publishing
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <input type="hidden" name="propertyId" value={property.id} />
          <input
            type="hidden"
            name="acceptTerms"
            value={acceptTerms ? "on" : "off"}
          />
          <input
            type="hidden"
            name="confirmAccuracy"
            value={confirmAccuracy ? "on" : "off"}
          />
          <CardContent className="space-y-6">
            {/* Review Summary */}
            {property && (
              <div className="space-y-4">
                <h3 className="text-on-surface text-lg font-semibold">
                  Review Summary
                </h3>

                <div className="bg-surface-container-low grid grid-cols-1 gap-6 rounded-lg p-4 md:grid-cols-2">
                  {/* Listing Details */}
                  <div className="space-y-2">
                    <p className="text-on-surface-variant text-xs font-bold tracking-wider uppercase">
                      Listing Details
                    </p>
                    <p className="text-on-surface font-semibold">
                      {property.title || "Untitled Property"}
                    </p>
                    <p className="text-on-surface-variant text-sm">
                      {formatCurrency(property.monthlyRent, "en-US", "THB")} /
                      Month • {FURNISHED_STATUS[property.furnishedStatus]}
                    </p>
                    <div className="mt-4 space-y-1">
                      <div className="text-on-surface-variant flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-[18px]">
                          bed
                        </span>
                        <span>
                          {property.bedrooms} Bedroom
                          {property.bedrooms !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="text-on-surface-variant flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-[18px]">
                          bathtub
                        </span>
                        <span>
                          {property.bathrooms} Bathroom
                          {property.bathrooms !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="text-on-surface-variant flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-[18px]">
                          {property.propertyType === "apartment" && "apartment"}
                          {property.propertyType === "condo" && "domain"}
                          {property.propertyType === "house" && "home"}
                          {property.propertyType === "townhouse" &&
                            "holiday_village"}
                        </span>
                        <span>{PROPERTY_TYPES[property.propertyType]}</span>
                      </div>
                      {property.amenities && property.amenities.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {property.amenities.map((amenity) => (
                            <span
                              key={amenity}
                              className="bg-surface-container-highest text-on-surface-variant rounded px-2 py-1 text-xs font-semibold tracking-wider uppercase"
                            >
                              {AMENITIES[amenity]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <p className="text-on-surface-variant text-xs font-bold tracking-wider uppercase">
                      Location
                    </p>
                    <p className="text-on-surface font-semibold">
                      {property.location || "Not specified"}
                    </p>
                    <p className="text-on-surface-variant text-sm">
                      Pending Verification
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {property?.description && (
              <div className="space-y-2">
                <p className="text-on-surface-variant text-xs font-bold tracking-wider uppercase">
                  Description
                </p>
                <p className="text-on-surface text-sm leading-relaxed">
                  {property.description}
                </p>
              </div>
            )}

            {/* Terms Checkbox */}
            <div data-invalid={!!state?.errors?.acceptTerms}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  disabled={isPending}
                  className="mt-1 rounded"
                />
                <label
                  htmlFor="acceptTerms"
                  className="flex-1 cursor-pointer font-normal"
                >
                  I accept the terms and conditions for listing properties on
                  Omamie <span className="text-destructive">*</span>
                </label>
              </div>
              {state?.errors?.acceptTerms && (
                <FieldError
                  errors={[{ message: state.errors.acceptTerms[0] }]}
                />
              )}
            </div>

            {/* Accuracy Checkbox */}
            <div data-invalid={!!state?.errors?.confirmAccuracy}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="confirmAccuracy"
                  checked={confirmAccuracy}
                  onChange={(e) => setConfirmAccuracy(e.target.checked)}
                  disabled={isPending}
                  className="mt-1 rounded"
                />
                <label
                  htmlFor="confirmAccuracy"
                  className="flex-1 cursor-pointer font-normal"
                >
                  I confirm that all information provided is accurate and
                  complete <span className="text-destructive">*</span>
                </label>
              </div>
              {state?.errors?.confirmAccuracy && (
                <FieldError
                  errors={[{ message: state.errors.confirmAccuracy[0] }]}
                />
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-surface-strong mt-8 flex flex-col gap-4">
            <div className="flex w-full justify-end gap-3">
              {onBack && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={isPending}
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                disabled={isPending || !acceptTerms || !confirmAccuracy}
                className="px-4"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish"
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
