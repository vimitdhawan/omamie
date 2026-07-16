"use client";

import { useEffect, useRef, useState } from "react";
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

function renderStep(step: Step, index: number, isDesktop: boolean) {
  const isHighlight = step.icon && step.highlight;
  const circleSize = isDesktop ? "h-20 w-20" : "h-14 w-14";
  const circleInner = isDesktop ? "h-6 w-6" : "h-5 w-5";
  const numberSize = isDesktop ? "text-xl" : "text-lg";

  return (
    <div
      key={step.number}
      className={`step-item relative z-10 flex max-w-[200px] flex-col items-center text-center ${
        isDesktop ? "" : "max-w-none flex-row items-start gap-4"
      }`}
    >
      {isHighlight ? (
        <div
          className={`bg-primary text-on-primary mb-4 flex items-center justify-center rounded-full shadow-lg ${
            isDesktop ? circleSize : "flex-shrink-0 " + circleSize
          }`}
        >
          {step.icon && <step.icon className={circleInner} />}
        </div>
      ) : (
        <div
          className={`bg-canvas border-surface-soft mb-4 flex items-center justify-center rounded-full border-4 shadow-sm ${
            isDesktop ? circleSize : "flex-shrink-0 " + circleSize
          }`}
        >
          <span className={`text-primary font-bold ${numberSize}`}>
            {step.number}
          </span>
        </div>
      )}
      {isDesktop ? (
        <>
          <h4 className="text-ink mb-1.5 text-base font-medium">
            {step.title}
          </h4>
          <p className="text-muted text-xs">{step.description}</p>
        </>
      ) : (
        <div className="space-y-0.5 pt-1.5">
          <h4 className="text-ink text-base font-medium">{step.title}</h4>
          <p className="text-muted text-xs">{step.description}</p>
        </div>
      )}
    </div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Section variant="card" ref={sectionRef}>
      <SectionHeader
        title="We Match People With Properties"
        subtitle="Our intelligent system connects the right tenants with the right properties in four simple steps."
      />

      {/* Desktop: Horizontal stepper */}
      <div
        className={`hidden lg:block ${isVisible ? "animate-steps" : ""}`}
        role="list"
        aria-label="How it works steps"
      >
        <div className="relative">
          {/* Progressive Connector Lines */}
          <div className="absolute top-10 right-[10%] left-[10%] flex h-0.5 gap-2">
            <div className="connector-line-1 bg-hairline-soft flex-1" />
            <div className="connector-line-2 bg-hairline-soft flex-1" />
            <div className="connector-line-3 bg-hairline-soft flex-1" />
          </div>

          <div className="flex items-start justify-between">
            {steps.map((step, index) => renderStep(step, index, true))}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet: Vertical stacked */}
      <div
        className={`space-y-6 lg:hidden ${isVisible ? "animate-steps" : ""}`}
        role="list"
        aria-label="How it works steps"
      >
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="step-item relative flex items-start gap-4"
          >
            {renderStep(step, index, false)}
            {index < steps.length - 1 && (
              <div className="absolute left-7 mt-14 w-0.5 flex-1">
                <div
                  className={`bg-hairline-soft ${index === 0 ? "connector-line-v-1" : index === 1 ? "connector-line-v-2" : "connector-line-v-3"}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
