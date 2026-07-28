"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { redirect } from "next/navigation";
import { listPropertyActionData } from "@/features/properties/actions";
import type { ListPropertyFormData } from "@/features/properties/schema";

import { Step1PropertyDetails } from "./steps/step-1-property-details";
import { Step2PhotosAmenities } from "./steps/step-2-photos-amenities";
import { Step3ContactInfo } from "./steps/step-3-contact-info";
import { FormStepIndicator } from "./form-step-indicator";
import type { PropertyActionResult } from "@/features/properties/types";

const STEPS = [
  {
    id: "property",
    title: "Property Details",
    description: "Listing type, property type, location, and rent",
  },
  {
    id: "photos",
    title: "Features & Amenities",
    description: "Bedrooms, bathrooms, furnishing, amenities",
  },
  {
    id: "contact",
    title: "Review",
    description: "Your contact details and review",
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const STEP_FIELDS: Record<StepId, (keyof ListPropertyFormData)[]> = {
  property: ["listingRole", "propertyType", "location", "rentAmount"],
  photos: ["bedrooms", "bathrooms", "furnishing"],
  contact: ["contactName", "contactEmail", "contactPhone", "acceptTerms"],
};

const STEP_NUMBERS: Record<StepId, string> = {
  property: "1",
  photos: "2",
  contact: "3",
};

const STEP_HEADERS: Record<StepId, string> = {
  property: "Property Details",
  photos: "Features & Amenities",
  contact: "Review",
};

const createInitialFormData = (): ListPropertyFormData => ({
  listingRole: "owner" as const,
  propertyType: "condo" as const,
  location: "",
  rentAmount: 0,
  currency: "THB",
  bedrooms: 1,
  bathrooms: 1,
  furnishing: "none" as const,
  amenities: [] as string[],
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  acceptTerms: false,
  acceptMarketing: false,
  status: "draft" as const,
});

interface PublicPropertyFormWizardProps {
  isOwnerOrAgent: boolean;
}

export function PublicPropertyFormWizard({
  isOwnerOrAgent,
}: PublicPropertyFormWizardProps) {
  const [currentStep, setCurrentStep] = useState<StepId>("property");
  const [isPending, setIsPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<ListPropertyFormData>({
    defaultValues: createInitialFormData(),
    mode: "onBlur",
  });

  const {
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = methods;

  const formData = watch();

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const handleInputChange = (
    name: string,
    value: string | number | string[] | boolean | null
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(name as any, value ?? "", { shouldValidate: true });
  };

  const handleNext = async () => {
    const ok = await trigger(STEP_FIELDS[currentStep]);
    if (!ok) return;
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id);
    }
  };

  const onSubmit = async (data: ListPropertyFormData) => {
    setSubmitError(null);
    setIsPending(true);
    try {
      const result: PropertyActionResult = await listPropertyActionData(data);
      if (result.success) {
        if (isOwnerOrAgent) {
          redirect("/dashboard/welcome");
        } else {
          redirect("/list-property/success");
        }
      } else {
        setSubmitError(
          result.error ?? "Failed to list property. Please try again."
        );
      }
    } catch (err) {
      // redirect() throws a digest error during navigation; only surface real errors
      if (err && typeof err === "object" && "digest" in err) {
        throw err;
      }
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const renderStep = () => {
    const listingRole = formData.listingRole as "owner" | "agent";
    const propertyType = formData.propertyType as
      | "apartment"
      | "condo"
      | "house"
      | "townhouse";
    const furnishing = formData.furnishing as "fully" | "partial" | "none";

    switch (currentStep) {
      case "property":
        return (
          <Step1PropertyDetails
            formData={{
              listingRole,
              propertyType,
              location: formData.location,
              rentAmount: formData.rentAmount,
            }}
            onChange={handleInputChange}
            disabled={isPending}
            errors={errors}
          />
        );

      case "photos":
        return (
          <Step2PhotosAmenities
            formData={{
              propertyType,
              furnishing,
              bedrooms: formData.bedrooms,
              bathrooms: formData.bathrooms,
              amenities: formData.amenities,
            }}
            onChange={handleInputChange}
            disabled={isPending}
            errors={errors}
          />
        );

      case "contact":
        return <Step3ContactInfo disabled={isPending} errors={errors} />;
    }
  };

  return (
    <>
      {/* Stepper */}
      <FormStepIndicator
        currentStep={currentStep}
        className="mb-[var(--sp-xl)]"
      />

      {/* Form Section */}
      <section className="border-hairline bg-surface-soft rounded-lg border p-[var(--sp-base)] shadow-sm md:p-[var(--sp-lg)]">
        <h2 className="text-display-lg text-ink border-hairline-soft mb-[var(--sp-xl)] border-b pb-[var(--sp-base)] font-medium">
          {STEP_NUMBERS[currentStep]}. {STEP_HEADERS[currentStep]}
        </h2>

        {submitError && (
          <div
            className="mb-[var(--sp-lg)] rounded-[var(--radius-sm)] border border-[var(--color-primary-error-text)]/50 bg-[var(--color-primary-error-text)]/10 px-3 py-2 text-sm text-[var(--color-primary-error-text)]"
            role="alert"
          >
            {submitError}
          </div>
        )}

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-[var(--sp-xl)]"
          >
            {renderStep()}

            {/* Form Navigation */}
            <div className="flex justify-end gap-[var(--sp-base)] pt-[var(--sp-xl)]">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isPending}
                  className="font-title-md text-nav-link text-muted-foreground hover:text-ink hover:bg-surface-soft inline-flex h-10 items-center gap-[var(--sp-xs)] rounded-[var(--radius-sm)] px-[var(--sp-base)] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: '"FILL" 0, "wght" 400' }}
                  >
                    arrow_back
                  </span>
                  Back
                </button>
              )}
              {isLastStep ? (
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-primary text-on-primary font-title-md hover:bg-primary-active inline-flex h-10 items-center gap-[var(--sp-xs)] rounded-[var(--radius-sm)] px-[var(--sp-xl)] shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Publishing..." : "List My Property"}
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    arrow_forward
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isPending}
                  className="bg-primary text-on-primary font-title-md hover:bg-primary-active inline-flex h-10 items-center gap-[var(--sp-xs)] rounded-[var(--radius-sm)] px-[var(--sp-xl)] shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: '"FILL" 0, "wght" 400' }}
                  >
                    arrow_forward
                  </span>
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </section>
    </>
  );
}
