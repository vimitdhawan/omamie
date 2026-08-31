"use client";

import * as React from "react";
import { Checkbox as CheckboxNamespace } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxNamespace.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxNamespace.Root>
>(({ className, ...props }, ref) => (
  <CheckboxNamespace.Root
    ref={ref}
    className={cn(
      "peer border-primary focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4 shrink-0 rounded-sm border shadow focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <CheckboxNamespace.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxNamespace.Indicator>
  </CheckboxNamespace.Root>
));
Checkbox.displayName = CheckboxNamespace.Root.displayName;

export { Checkbox };
