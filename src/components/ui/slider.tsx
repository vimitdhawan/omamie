"use client";

import * as React from "react";
import { Slider as SliderNamespace } from "@base-ui/react/slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderNamespace.Root>,
  React.ComponentPropsWithoutRef<typeof SliderNamespace.Root>
>(({ className, ...props }, ref) => (
  <SliderNamespace.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none items-center select-none",
      className
    )}
    {...props}
  >
    <SliderNamespace.Track className="bg-primary/20 relative h-1.5 w-full grow overflow-hidden rounded-full">
      <SliderNamespace.Indicator className="bg-primary absolute h-full" />
    </SliderNamespace.Track>
    <SliderNamespace.Thumb className="border-primary/50 bg-background focus-visible:ring-ring block h-4 w-4 rounded-full border shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" />
  </SliderNamespace.Root>
));
Slider.displayName = "Slider";

export { Slider };
