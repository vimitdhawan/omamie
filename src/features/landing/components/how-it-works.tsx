"use client";

import { Section, SectionHeader } from "@/components/ui/section";
import { Brain, type LucideIcon } from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  highlight?: boolean;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Tell us requirements",
    description: "Share exactly what you're looking for or offering.",
  },
  {
    number: "02",
    title: "Submit details",
    description: "Quick 2-minute profile or listing creation.",
  },
  {
    number: "03",
    icon: Brain,
    title: "Smart Matching",
    description:
      "Our AI-driven algorithms instantly pair the most compatible candidates.",
    highlight: true,
  },
  {
    number: "04",
    title: "Connect",
    description: "Meet your match and move in with confidence.",
  },
];

export default function HowItWorks() {
  return (
    <Section variant="card">
      <SectionHeader
        title="We Match People With Properties"
        subtitle="Our intelligent system connects the right tenants with the right properties in four simple steps."
      />

      {/* ================= Desktop ================= */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Horizontal connector */}
          <div className="absolute top-10 right-[10%] left-[10%] flex h-0.5 gap-2">
            <div className="bg-hairline-soft flex-1" />
            <div className="bg-hairline-soft flex-1" />
            <div className="bg-hairline-soft flex-1" />
          </div>

          <div className="flex items-start justify-between">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="relative z-10 flex max-w-[220px] flex-col items-center text-center"
                >
                  {Icon && step.highlight ? (
                    <div className="bg-primary text-primary-foreground mb-4 flex h-20 w-20 items-center justify-center rounded-full shadow-lg">
                      <Icon className="h-6 w-6" />
                    </div>
                  ) : (
                    <div className="bg-background border-surface-soft mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 shadow-sm">
                      <span className="text-primary text-xl font-bold">
                        {step.number}
                      </span>
                    </div>
                  )}

                  <h4 className="text-ink mb-2 text-base font-semibold">
                    {step.title}
                  </h4>

                  <p className="text-muted text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= Mobile / Tablet ================= */}
      <div className="space-y-8 lg:hidden">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div key={step.number} className="relative flex items-start gap-4">
              {/* Vertical connector */}
              {index < steps.length - 1 && (
                <div className="bg-hairline-soft absolute top-14 left-7 h-[calc(100%+2rem)] w-px" />
              )}

              {/* Circle */}
              {Icon && step.highlight ? (
                <div className="bg-primary text-primary-foreground relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-lg">
                  <Icon className="h-5 w-5" />
                </div>
              ) : (
                <div className="bg-background border-surface-soft relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 shadow-sm">
                  <span className="text-primary text-lg font-bold">
                    {step.number}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 pt-1">
                <h4 className="text-ink text-base font-semibold">
                  {step.title}
                </h4>

                <p className="text-muted mt-1 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
