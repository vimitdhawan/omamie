import type { PropertyStatus } from "../types";

const STATUS_LABELS: Record<string, string> = {
  active: "Published",
  draft: "Draft",
  pending: "Draft",
  review: "In review",
  rented: "Rented",
  inactive: "Inactive",
};

/** Dot colour for the status pill; the pill itself stays neutral so photos read through. */
const STATUS_DOT: Record<string, string> = {
  active: "bg-green-600",
  draft: "bg-yellow-600",
  pending: "bg-yellow-600",
  review: "bg-orange-600",
  rented: "bg-blue-600",
  inactive: "bg-muted-foreground",
};

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

export function getStatusDotClass(status: PropertyStatus | string): string {
  return STATUS_DOT[status] || "bg-muted-foreground";
}

/** A short human-facing handle, so an owner can refer to a listing without its UUID. */
export function derivePropertyCode(id: string): string {
  return `PROP-${id.slice(-4).toUpperCase()}`;
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const diffDays = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString();
}
