"use client";

import { Section } from "@/components/custom/section";

const stats = [
  { value: "1,240+", label: "Active Users", color: "text-primary" },
  { value: "850+", label: "Properties Listed", color: "text-ink" },
  { value: "420+", label: "Successful Matches", color: "text-ink" },
];

export function StatsSection() {
  return (
    <Section
      variant="default"
      className="border-hairline border-b py-6 sm:py-8 lg:py-10"
    >
      <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-10 lg:gap-16">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl ${stat.color}`}
            >
              {stat.value}
            </div>
            <div className="text-muted mt-1 text-xs font-bold tracking-wider uppercase">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
