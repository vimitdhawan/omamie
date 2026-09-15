"use client";

import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface IconInputProps extends ComponentProps<typeof Input> {
  icon: ReactNode;
}

/** Text input with a leading glyph, as every field in the reference drawer has. */
export function IconInput({ icon, className, ...props }: IconInputProps) {
  return (
    <div className="relative">
      <span
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        aria-hidden
      >
        {icon}
      </span>
      <Input className={cn("pl-9", className)} {...props} />
    </div>
  );
}
