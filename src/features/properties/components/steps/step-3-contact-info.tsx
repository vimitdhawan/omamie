"use client";

import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ReviewSummaryCard } from "@/features/properties/components/review-summary-card";
import type { FieldErrors } from "react-hook-form";
import type { ListPropertyFormData } from "@/features/properties/schema";

export function Step3ContactInfo({
  disabled,
  errors,
}: {
  disabled?: boolean;
  errors?: FieldErrors<ListPropertyFormData>;
}) {
  const { watch, setValue } = useFormContext();

  const contactName = watch("contactName");
  const contactEmail = watch("contactEmail");
  const contactPhone = watch("contactPhone");
  const acceptTerms = watch("acceptTerms");
  const acceptMarketing = watch("acceptMarketing");

  return (
    <div className="space-y-[var(--sp-xl)]">
      {/* Contact Information */}
      <div>
        <label className="font-title-md text-nav-link text-ink mb-[var(--sp-base)] block">
          Your Contact Information <span className="text-destructive">*</span>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-[var(--sp-base)] md:grid-cols-3">
        <div className="space-y-[var(--sp-xs)]">
          <label
            htmlFor="contactName"
            className="font-title-md text-nav-link text-ink"
          >
            Full Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="contactName"
            type="text"
            value={contactName}
            onChange={(e) => setValue("contactName", e.target.value)}
            placeholder="Your name"
            required
            maxLength={100}
            disabled={disabled}
            aria-invalid={errors?.contactName ? "true" : "false"}
          />
          {errors?.contactName && (
            <p className="text-destructive text-sm">
              {errors.contactName.message}
            </p>
          )}
        </div>
        <div className="space-y-[var(--sp-xs)]">
          <label
            htmlFor="contactEmail"
            className="font-title-md text-nav-link text-ink"
          >
            Email Address <span className="text-destructive">*</span>
          </label>
          <Input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setValue("contactEmail", e.target.value)}
            placeholder="you@example.com"
            required
            maxLength={100}
            disabled={disabled}
            aria-invalid={errors?.contactEmail ? "true" : "false"}
          />
          {errors?.contactEmail && (
            <p className="text-destructive text-sm">
              {errors.contactEmail.message}
            </p>
          )}
        </div>
        <div className="space-y-[var(--sp-xs)]">
          <label
            htmlFor="contactPhone"
            className="font-title-md text-nav-link text-ink"
          >
            Phone Number <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-base">
              🇹🇭
            </span>
            <Input
              id="contactPhone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setValue("contactPhone", e.target.value)}
              placeholder="8X XXX XXXX"
              required
              minLength={8}
              maxLength={20}
              disabled={disabled}
              aria-invalid={errors?.contactPhone ? "true" : "false"}
              className="pl-10"
            />
          </div>
          {errors?.contactPhone && (
            <p className="text-destructive text-sm">
              {errors.contactPhone.message}
            </p>
          )}
        </div>
      </div>

      {/* Review Summary */}
      <ReviewSummaryCard formData={watch() as ListPropertyFormData} />

      {/* Legal Checkboxes */}
      <div className="border-hairline space-y-[var(--sp-base)] border-t pt-[var(--sp-lg)]">
        <div className="space-y-[var(--sp-xs)]">
          <Checkbox
            id="acceptTerms"
            checked={acceptTerms}
            onChange={(checked) => setValue("acceptTerms", checked)}
            disabled={disabled}
            aria-invalid={errors?.acceptTerms ? "true" : "false"}
          >
            <span className="text-body-md text-ink">
              I confirm that the information provided is accurate and I have the
              authority to list this property
              <span className="text-destructive">*</span>
            </span>
          </Checkbox>
          {errors?.acceptTerms && (
            <p className="text-destructive ml-6 text-sm">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        <div className="space-y-[var(--sp-xs)]">
          <Checkbox
            id="acceptMarketing"
            checked={acceptMarketing}
            onChange={(checked) => setValue("acceptMarketing", checked)}
            disabled={disabled}
          >
            <span className="text-body-md text-ink">
              I agree to receive marketing communications from Omamie about
              property tips, market updates, and new features
            </span>
          </Checkbox>
        </div>

        <p className="text-caption-sm text-muted-soft">
          By submitting, you agree to our{" "}
          <a
            href="/terms"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
