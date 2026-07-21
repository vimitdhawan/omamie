"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const RadioGroupContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  name: string;
} | null>(null);

function useRadioGroupContext() {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroup components must be used within RadioGroup");
  }
  return context;
}

interface RadioGroupProps<T extends string = string> {
  value: T;
  onValueChange: (value: T) => void;
  disabled?: boolean;
  name: string;
  children: React.ReactNode;
  className?: string;
}

const RadioGroupFn = function RadioGroup({
  value,
  onValueChange,
  disabled,
  name,
  children,
  className,
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider
      value={{ value, onValueChange, disabled, name }}
    >
      <div
        className={cn("grid gap-2", className)}
        role="radiogroup"
        aria-required="true"
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

export const RadioGroup = RadioGroupFn;

interface RadioGroupItemProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ value, disabled, className, children, ...props }, ref) => {
    const context = useRadioGroupContext();
    const isChecked = context.value === value;
    const isDisabled = disabled || context.disabled;

    return (
      <label className={cn("relative cursor-pointer", className)}>
        <input
          type="radio"
          ref={ref}
          name={context.name}
          value={value}
          checked={isChecked}
          onChange={() => {
            if (!isDisabled) {
              context.onValueChange(value);
            }
          }}
          disabled={isDisabled}
          className="sr-only"
          {...props}
        />
        {children}
      </label>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroupItem };
