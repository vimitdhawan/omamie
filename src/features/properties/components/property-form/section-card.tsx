"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SectionStatus = "complete" | "partial" | "empty" | "error";

interface SectionCardProps {
  index: number;
  title: string;
  hint: string;
  icon: ReactNode;
  status: SectionStatus;
  statusLabel: string;
  onEdit: () => void;
  children: ReactNode;
}

const STATUS_BADGE: Record<SectionStatus, string> = {
  complete: "bg-success-soft text-success",
  partial: "bg-surface-strong text-muted-foreground",
  empty: "bg-surface-soft text-muted-foreground",
  error: "bg-warning-soft text-warning",
};

/**
 * Read-only summary of one section; editing happens in its drawer.
 *
 * The whole card is the click target, done with a stretched overlay on a single button
 * rather than an onClick on the wrapper around a nested button — that keeps exactly one
 * focusable control per card, which a click-anywhere div plus an Edit button would not.
 */
export function SectionCard({
  index,
  title,
  hint,
  icon,
  status,
  statusLabel,
  onEdit,
  children,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "group bg-card relative rounded-xl border transition-colors",
        status === "error"
          ? "border-warning/40 bg-warning-soft/30"
          : "border-hairline-soft hover:border-primary/40"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            status === "error"
              ? "bg-warning-soft text-warning"
              : "bg-surface-soft text-primary"
          )}
          aria-hidden
        >
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-title-md">
              {index}. {title}
            </h3>
            <Badge
              variant="secondary"
              className={cn("border-0", STATUS_BADGE[status])}
            >
              {statusLabel}
            </Badge>
          </div>

          <p className="text-muted-foreground mt-1 text-sm">{hint}</p>

          <div className="mt-2 text-sm">{children}</div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${title}`}
          className="text-muted-foreground group-hover:text-primary focus-visible:ring-ring mt-1 shrink-0 rounded-md transition-colors after:absolute after:inset-0 after:content-[''] focus-visible:ring-2 focus-visible:outline-none"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

/** Placeholder for a section the owner has not filled in yet. */
export function EmptyHint({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground italic">{children}</p>;
}

/** Small summary pills under a section card ("$2,000 / mo", "2 Mos Deposit"). */
export function SectionChips({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="bg-surface-soft text-foreground rounded-full px-2.5 py-1 text-xs font-medium"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
