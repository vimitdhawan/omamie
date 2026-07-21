"use client";

import { cn } from "@/lib/utils";

const STEPS = [
  { id: "property", title: "Property Details" },
  { id: "photos", title: "Features & Amenities" },
  { id: "contact", title: "Review" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

interface FormStepIndicatorProps {
  currentStep: StepId;
  className?: string;
}

export function FormStepIndicator({
  currentStep,
  className,
}: FormStepIndicatorProps) {
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div
      className={cn("relative flex items-center justify-between", className)}
      role="progressbar"
      aria-label="Form progress"
      aria-valuenow={currentStepIndex + 1}
      aria-valuemin={1}
      aria-valuemax={STEPS.length}
    >
      {/* Progress Line Background (behind the circles) */}
      <div className="bg-surface-strong absolute top-1/2 right-0 left-0 -z-10 h-[2px] -translate-y-1/2" />
      {/* Progress Line Fill (highlights visited steps) */}
      <div
        className="bg-primary absolute top-1/2 left-0 -z-10 h-[2px] -translate-y-1/2 transition-all duration-300"
        style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
      />

      {STEPS.map((step, index) => {
        const isActive = index === currentStepIndex;
        const isComplete = index < currentStepIndex;

        return (
          <div
            key={step.id}
            className="bg-surface-card flex flex-col items-center gap-[var(--sp-xs)] px-[var(--sp-sm)]"
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-200",
                isComplete
                  ? "bg-primary text-on-primary"
                  : isActive
                    ? "bg-primary text-on-primary ring-primary/15 ring-4"
                    : "bg-surface-strong text-muted-foreground"
              )}
              aria-current={isActive ? "step" : undefined}
            >
              {isComplete ? (
                <span
                  className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: '"FILL" 1, "wght" 500' }}
                >
                  check
                </span>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                "font-title-md text-nav-link w-28 text-center text-sm lg:w-36",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
