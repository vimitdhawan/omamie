import { Section } from "@/components/ui/section";

const stats = [
  { value: "1,240+", label: "Active Users", color: "text-primary" },
  { value: "850+", label: "Properties Listed", color: "text-ink" },
  { value: "420+", label: "Successful Matches", color: "text-ink" },
];

export default function Stats() {
  return (
    <Section variant="muted">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center gap-6 text-center sm:flex-row sm:gap-10 lg:gap-16">
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
      </div>
    </Section>
  );
}
