import type { Property, PropertyStatus } from "../types";

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

/**
 * Derives per-status counts from an already-fetched property list, rather than issuing
 * separate count queries per status — the caller already has the full unfiltered list.
 */
export function deriveStatusCounts(properties: Property[]): {
  all: number;
  active: number;
  draft: number;
  review: number;
  rented: number;
} {
  const counts = {
    all: properties.length,
    active: 0,
    draft: 0,
    review: 0,
    rented: 0,
  };
  for (const property of properties) {
    if (property.status in counts) {
      counts[property.status as "active" | "draft" | "review" | "rented"]++;
    }
  }
  return counts;
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
