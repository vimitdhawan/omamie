type MetricCardProps = {
  icon: string;
  iconBgColor: string;
  label: string;
  value: string | number;
  subtitle?: string;
  subtitleColor?: string;
};

export function MetricCard({
  icon,
  iconBgColor,
  label,
  value,
  subtitle,
  subtitleColor = "text-muted-foreground",
}: MetricCardProps) {
  return (
    <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBgColor}`}
        >
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        <div>
          <p className="text-muted-foreground text-[13px] font-medium tracking-wider uppercase">
            {label}
          </p>
          <p className="text-foreground mt-1 text-[21px] font-bold">
            {value}{" "}
            {subtitle && (
              <span className={`ml-1 text-[14px] font-normal ${subtitleColor}`}>
                {subtitle}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
