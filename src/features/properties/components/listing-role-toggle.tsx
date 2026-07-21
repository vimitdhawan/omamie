"use client";

import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ListingRoleToggleProps {
  value: "owner" | "agent";
  onChange: (value: string) => void;
  disabled?: boolean;
}

const OPTIONS = [
  {
    role: "owner" as const,
    title: "Property Owner",
    description: "I own the property directly.",
  },
  {
    role: "agent" as const,
    title: "Real Estate Agent",
    description: "I represent the owner/developer.",
  },
];

export function ListingRoleToggle({
  value,
  onChange,
  disabled,
}: ListingRoleToggleProps) {
  return (
    <RadioGroup
      name="listingRole"
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <div className="grid grid-cols-1 gap-[var(--sp-base)] md:grid-cols-2">
        {OPTIONS.map(({ role, title, description }) => {
          const selected = value === role;
          return (
            <label
              key={role}
              className={cn(
                "relative flex cursor-pointer items-center rounded-[var(--radius-sm)] border p-[var(--sp-base)] transition-all",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-hairline bg-surface-card hover:border-primary"
              )}
            >
              <RadioGroupItem
                value={role}
                className="sr-only"
                disabled={disabled}
              />
              <div
                className={cn(
                  "mr-[var(--sp-base)] flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  selected ? "border-primary bg-primary" : "border-hairline"
                )}
              >
                <div
                  className={cn(
                    "h-2 w-2 rounded-full bg-white transition-opacity",
                    selected ? "opacity-100" : "opacity-0"
                  )}
                />
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "font-title-md text-nav-link",
                    selected ? "text-primary" : "text-ink"
                  )}
                >
                  {title}
                </span>
                <span className="text-muted-foreground text-sm">
                  {description}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </RadioGroup>
  );
}
