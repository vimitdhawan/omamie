interface ProgressRingProps {
  /** 0–1. */
  value: number;
  size?: number;
  strokeWidth?: number;
}

/**
 * Small circular completeness meter.
 *
 * Inline SVG rather than a dependency: it is two circles and a dash offset, and the repo has
 * no progress primitive to build on.
 */
export function ProgressRing({
  value,
  size = 56,
  strokeWidth = 5,
}: ProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${Math.round(clamped * 100)} percent complete`}
      className="shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-surface-strong"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - clamped)}
        // Start at 12 o'clock instead of 3.
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="stroke-primary transition-[stroke-dashoffset] duration-500"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="fill-foreground text-[13px] font-bold"
      >
        {Math.round(clamped * 100)}%
      </text>
    </svg>
  );
}
