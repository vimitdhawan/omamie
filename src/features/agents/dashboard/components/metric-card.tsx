type MetricCardProps = {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  subtitleColor?: string;
  bgColor?: string;
  iconColor?: string;
};

export function MetricCard({
  icon,
  label,
  value,
  subtitle,
  subtitleColor = "text-muted-foreground",
  bgColor = "bg-blue-50",
  iconColor = "text-blue-600",
}: MetricCardProps) {
  return (
    <div className={`${bgColor} flex flex-col rounded-lg p-2.5 shadow-sm`}>
      <div className="mb-1 flex items-start justify-between">
        {icon && (
          <div className={`${iconColor} flex-shrink-0 text-xl`}>{icon}</div>
        )}
        <p className="text-foreground text-[24px] font-bold">{value}</p>
      </div>
      <p className="text-muted-foreground mb-0.5 text-[11px] font-medium">
        {label}
      </p>
      {subtitle && (
        <p className={`text-[10px] font-medium ${subtitleColor}`}>{subtitle}</p>
      )}
    </div>
  );
}
