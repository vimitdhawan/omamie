"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, children, ...props }, ref) => {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3", className)}>
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "border-hairline text-primary focus-visible:ring-primary/20 h-4 w-4 rounded focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        )}
        {...props}
      />
      {children && (
        <span className="text-body-md text-ink mt-0.5">{children}</span>
      )}
    </label>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
