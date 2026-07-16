import { cn } from "@/lib/utils";
import React from "react";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: "default" | "muted" | "card";
}

const variantClasses = {
  default: "bg-canvas",
  muted: "bg-surface-soft",
  card: "bg-surface-card",
};

export function Section({
  children,
  className,
  variant = "default",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "overflow-x-hidden px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20 xl:px-16",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function SectionHeader({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 text-center sm:mb-10", className)}>
      <h2 className="text-ink text-xl font-bold tracking-tight sm:text-2xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted mx-auto mt-2 max-w-2xl text-sm">{subtitle}</p>
      )}
    </div>
  );
}
