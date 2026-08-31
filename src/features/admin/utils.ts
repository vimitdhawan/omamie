// Utility functions for admin feature

/**
 * Format a number with commas for better readability
 * Example: 1234 -> "1,234"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format a date to a human-readable format
 * Example: "2026-09-01T12:00:00Z" -> "Sep 1, 2026"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date with time
 * Example: "2026-09-01T12:00:00Z" -> "Sep 1, 2026 at 12:00 PM"
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Get status badge variant based on property status
 */
export function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "review":
      return "secondary";
    case "inactive":
      return "destructive";
    case "rented":
      return "outline";
    default:
      return "outline";
  }
}

/**
 * Get role badge variant
 */
export function getRoleVariant(
  role: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case "admin":
      return "destructive";
    case "agent":
      return "default";
    case "owner":
      return "secondary";
    case "tenant":
      return "outline";
    default:
      return "outline";
  }
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
