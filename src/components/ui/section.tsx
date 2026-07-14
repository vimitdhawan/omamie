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
        "overflow-x-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24",
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
    <div className={cn("mb-12 text-center sm:mb-16", className)}>
      <h2 className="text-ink text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted mx-auto mt-4 max-w-2xl text-lg">{subtitle}</p>
      )}
    </div>
  );
}
