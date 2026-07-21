import { cn } from "@/lib/utils";
import React from "react";

/**
 * BookingStepper – a simple numeric stepper for guest count / quantity.
 * Maps to the `booking-stepper` helper component in the design system.
 */
export function BookingStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  disabled,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}) {
  const handleDecrement = () => {
    if (value > min && !disabled) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max && !disabled) onChange(value + 1);
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min || disabled}
        className="border-hairline bg-canvas text-ink hover:bg-surface-soft flex h-8 w-8 items-center justify-center rounded-sm border disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
        </svg>
      </button>
      <span className="text-ink min-w-[2rem] text-center text-sm font-medium">
        {value}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max || disabled}
        className="border-hairline bg-canvas text-ink hover:bg-surface-soft flex h-8 w-8 items-center justify-center rounded-sm border disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v12m6-6H6"
          />
        </svg>
      </button>
    </div>
  );
}
