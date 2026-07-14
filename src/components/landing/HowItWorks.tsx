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

      {/* Desktop: Horizontal stepper */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Connector Line */}
          <div className="bg-hairline-soft absolute top-12 right-[12%] left-[12%] h-0.5" />

          <div className="flex items-start justify-between">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative z-10 flex max-w-[220px] flex-col items-center text-center"
              >
                {step.icon && step.highlight ? (
                  <div className="bg-primary text-on-primary mb-6 flex h-24 w-24 items-center justify-center rounded-full shadow-lg">
                    <step.icon className="h-8 w-8" />
                  </div>
                ) : (
                  <div className="bg-canvas border-surface-soft mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 shadow-sm">
                    <span className="text-primary text-2xl font-bold">
                      {step.number}
                    </span>
                  </div>
                )}
                <h4 className="text-ink mb-2 text-lg font-medium">
                  {step.title}
                </h4>
                <p className="text-muted text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet: Vertical stacked */}
      <div className="space-y-8 lg:hidden">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-start gap-5">
            {step.icon && step.highlight ? (
              <div className="bg-primary text-on-primary flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full shadow-lg">
                <step.icon className="h-6 w-6" />
              </div>
            ) : (
              <div className="bg-canvas border-surface-soft flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 shadow-sm">
                <span className="text-primary text-xl font-bold">
                  {step.number}
                </span>
              </div>
            )}
            <div className="space-y-1 pt-2">
              <h4 className="text-ink text-lg font-medium">{step.title}</h4>
              <p className="text-muted text-sm">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="bg-hairline-soft absolute left-8 mt-16 hidden h-8 w-0.5 sm:block" />
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
