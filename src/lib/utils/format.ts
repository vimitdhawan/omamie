/**
 * Utility functions for formatting common values in Omamie.
 */

/**
 * Formats a number as a currency string (default USD, can be customized).
 */
export function formatCurrency(
  amount: number,
  locale = "en-US",
  currency = "USD"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a number as property size in square meters (sqm).
 */
export function formatArea(size: number): string {
  return `${size} sqm`;
}

/**
 * Formats a number of rooms.
 */
export function formatRooms(rooms: number): string {
  return `${rooms} ${rooms === 1 ? "room" : "rooms"}`;
}

/**
 * Formats a date string or Date object into a readable localized format.
 */
export function formatDate(
  date: string | Date | null | undefined,
  locale = "en-US"
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}
