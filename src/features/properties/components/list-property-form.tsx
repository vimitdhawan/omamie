"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper";
import { CheckIcon } from "lucide-react";
import { StepPropertyDetails } from "./step-property-details";
import { StepAmenities } from "./step-amenities";
import { StepReview } from "./step-review";
import { listPropertyAction } from "../actions";
import type { PropertyType, FurnishedStatus, Amenity } from "../schema";
import type { PropertyActionResult } from "../types";

const STEPS = [
  { label: "Property Details" },
  { label: "Amenities" },
  { label: "Review" },
];

export function ListPropertyForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [state, formAction, isPending] = useActionState<
    PropertyActionResult | null,
    FormData
  >(listPropertyAction, null);

  // Form data state
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [description, setDescription] = useState("");
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [furnishedStatus, setFurnishedStatus] =
    useState<FurnishedStatus>("furnished");
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);

  // Client-side validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Toast for server-side errors
  const { error: showErrorToast } = useToast();

  // Show toast when server returns an error
  useEffect(() => {
    if (state?.error) {
      showErrorToast("Error", state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Validate Step 1: Property Details
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 5) {
      newErrors.title = "Property title must be at least 5 characters";
    }
    if (!location.trim() || location.trim().length < 3) {
      newErrors.location = "Location is required (min 3 characters)";
    }
    if (!monthlyRent || Number(monthlyRent) <= 0) {
      newErrors.monthlyRent = "Monthly rent is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setErrors({}); // Clear previous errors

    // Validate current step before proceeding
    if (currentStep === 1 && !validateStep1()) {
      return; // Don't proceed if validation fails
    }
    // Step 2 has sensible defaults, no validation needed

    setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
  };

  const handleBack = () => {
    setErrors({}); // Clear errors when going back
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="mx-auto max-w-[720px]">
      {/* Back to Home Link */}
      <div className="mb-6">
        <Link
          href="/"
          className="group text-primary hover:text-primary/80 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[18px] leading-none transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
          Back to Home
        </Link>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-on-surface text-3xl font-bold">
          List Your Property
        </h1>
        <p className="text-on-surface-variant mt-1">
          Tell us about your property to reach thousands of potential tenants.
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <Stepper
          value={currentStep}
          onValueChange={setCurrentStep}
          indicators={{
            completed: <CheckIcon className="size-3.5" />,
          }}
          className="w-full"
        >
          <StepperNav>
            {STEPS.map((step, index) => (
              <StepperItem
                key={index}
                step={index + 1}
                className="relative flex-1 items-start"
              >
                <StepperTrigger className="flex flex-col gap-2.5">
                  <StepperIndicator>{index + 1}</StepperIndicator>
                  <StepperTitle>{step.label}</StepperTitle>
                </StepperTrigger>

                {index < STEPS.length - 1 && (
                  <StepperSeparator className="group-data-[state=completed]/step:bg-primary absolute inset-x-0 top-3 left-[calc(50%+0.875rem)] m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem+0.225rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none" />
                )}
              </StepperItem>
            ))}
          </StepperNav>
        </Stepper>
      </div>

      {/* Form Card */}
      <div className="border-outline-variant/30 bg-surface-container-low rounded-xl border p-6 shadow-sm md:p-8">
        <form action={formAction}>
          {/* Hidden inputs to persist form data across all steps */}
          <input type="hidden" name="propertyType" value={propertyType} />
          <input type="hidden" name="title" value={title} />
          <input type="hidden" name="location" value={location} />
          <input type="hidden" name="monthlyRent" value={monthlyRent} />
          <input type="hidden" name="description" value={description} />
          <input type="hidden" name="bedrooms" value={bedrooms} />
          <input type="hidden" name="bathrooms" value={bathrooms} />
          <input type="hidden" name="furnishedStatus" value={furnishedStatus} />
          {amenities.map((amenity, index) => (
            <input
              key={amenity + "-" + index}
              type="hidden"
              name="amenities"
              value={amenity}
            />
          ))}

          {/* Step 1: Property Details */}
          {currentStep === 1 && (
            <StepPropertyDetails
              propertyType={propertyType}
              title={title}
              location={location}
              monthlyRent={monthlyRent}
              description={description}
              onPropertyTypeChange={setPropertyType}
              onTitleChange={setTitle}
              onLocationChange={setLocation}
              onMonthlyRentChange={setMonthlyRent}
              onDescriptionChange={setDescription}
              errors={errors}
            />
          )}

          {/* Step 2: Amenities */}
          {currentStep === 2 && (
            <StepAmenities
              bedrooms={bedrooms}
              bathrooms={bathrooms}
              furnishedStatus={furnishedStatus}
              amenities={amenities}
              onBedroomsChange={setBedrooms}
              onBathroomsChange={setBathrooms}
              onFurnishedStatusChange={setFurnishedStatus}
              onAmenitiesChange={setAmenities}
            />
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <StepReview
              propertyType={propertyType}
              title={title}
              location={location}
              monthlyRent={monthlyRent}
              bedrooms={bedrooms}
              bathrooms={bathrooms}
              furnishedStatus={furnishedStatus}
              amenities={amenities}
              acceptTerms={acceptTerms}
              confirmAccuracy={confirmAccuracy}
              onAcceptTermsChange={setAcceptTerms}
              onConfirmAccuracyChange={setConfirmAccuracy}
            />
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            {/* Back button (only shown from Step 2 onwards) */}
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isPending}
              >
                Back
              </Button>
            )}

            {/* Next/Publish button */}
            {currentStep < STEPS.length ? (
              <Button
                type="button"
                onClick={handleNext}
                className="px-8"
                disabled={isPending}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                className="px-8"
                disabled={isPending || !acceptTerms || !confirmAccuracy}
              >
                {isPending ? "Publishing..." : "Publish Listing"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
