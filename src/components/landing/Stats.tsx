const stats = [
  { value: "1,240+", label: "Active Users", color: "text-primary" },
  { value: "850+", label: "Properties Listed", color: "text-ink" },
  { value: "420+", label: "Successful Matches", color: "text-secondary" },
];

export default function Stats() {
  return (
    <section className="bg-surface-card border-hairline overflow-x-hidden border-y px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center gap-8 text-center sm:flex-row sm:gap-12 lg:gap-20">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl ${stat.color}`}
              >
                {stat.value}
              </div>
              <div className="text-muted mt-2 text-xs font-bold tracking-wider uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
