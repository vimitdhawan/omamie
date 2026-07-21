"use client";

import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PropertyTypeCardProps {
  value: "apartment" | "condo" | "house" | "townhouse";
  onChange: (value: "apartment" | "condo" | "house" | "townhouse") => void;
  disabled?: boolean;
}

const PROPERTY_TYPES = [
  { value: "apartment" as const, label: "Apartment", icon: "apartment" },
  { value: "condo" as const, label: "Condo", icon: "domain" },
  { value: "house" as const, label: "House", icon: "home" },
  { value: "townhouse" as const, label: "Townhouse", icon: "holiday_village" },
] as const;

export function PropertyTypeCards({
  value,
  onChange,
  disabled,
}: PropertyTypeCardProps) {
  return (
    <RadioGroup
      name="propertyType"
      value={value}
      onValueChange={onChange as (value: string) => void}
      disabled={disabled}
    >
      <div className="grid grid-cols-2 gap-[var(--sp-sm)] md:grid-cols-4">
        {PROPERTY_TYPES.map((type) => {
          const selected = value === type.value;
          return (
            <label
              key={type.value}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-sm)] border p-[var(--sp-base)] text-center transition-all",
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-hairline bg-surface-card text-ink hover:bg-surface-soft hover:border-primary"
              )}
            >
              <RadioGroupItem
                value={type.value}
                className="sr-only"
                disabled={disabled}
              />
              <span
                className="material-symbols-outlined text-display-md mb-[var(--sp-xs)]"
                style={{
                  fontVariationSettings: selected
                    ? '"FILL" 1, "wght" 500'
                    : '"FILL" 0, "wght" 400',
                }}
              >
                {type.icon}
              </span>
              <span className="text-sm font-medium">{type.label}</span>
            </label>
          );
        })}
      </div>
    </RadioGroup>
  );
}
