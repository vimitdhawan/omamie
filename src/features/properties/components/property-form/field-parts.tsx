"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipRadioProps<T extends string> {
  options: ReadonlyArray<ChipOption<T>>;
  value: T | undefined;
  onValueChange: (value: T) => void;
  label: string;
}

/**
 * Pill-style single select, as in the reference's "Property Type" row.
 *
 * A real radio group under the hood — one tab stop, arrow keys move between options — rather
 * than a row of buttons, which would be neither.
 */
export function ChipRadio<T extends string>({
  options,
  value,
  onValueChange,
  label,
}: ChipRadioProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "focus-visible:ring-ring rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
              selected
                ? "bg-primary text-primary-foreground"
                : "bg-surface-soft text-foreground hover:bg-surface-strong"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface CalloutProps extends ComponentProps<"div"> {
  icon: ReactNode;
  title: string;
  tone?: "info" | "warning";
}

/** Tinted note box — the "Standard lease policy" / "Live sync enabled" blocks. */
export function Callout({
  icon,
  title,
  tone = "info",
  children,
  className,
  ...props
}: CalloutProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg p-3",
        tone === "warning"
          ? "bg-warning-soft text-warning"
          : "bg-surface-soft text-foreground",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "mt-0.5 shrink-0",
          tone === "warning" ? "text-warning" : "text-primary"
        )}
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {children && (
          <div className="text-muted-foreground mt-0.5 text-xs">{children}</div>
        )}
      </div>
    </div>
  );
}
