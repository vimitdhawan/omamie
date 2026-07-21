export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment", icon: "building" },
  { value: "condo", label: "Condo", icon: "building" },
  { value: "house", label: "House", icon: "home" },
  { value: "townhouse", label: "Townhouse", icon: "home" },
] as const;

export const FURNISHING_TYPES = [
  { value: "fully", label: "Fully Furnished" },
  { value: "partial", label: "Partially Furnished" },
  { value: "none", label: "Unfurnished" },
] as const;

export const LISTING_ROLES = [
  { value: "owner", label: "Owner" },
  { value: "agent", label: "Agent" },
] as const;

export const PROPERTY_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "rented", label: "Rented" },
  { value: "archived", label: "Archived" },
] as const;

export const CURRENCIES = [
  { value: "THB", label: "THB (฿)" },
  { value: "USD", label: "USD ($)" },
] as const;

export const BEDROOM_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: i,
  label: i === 0 ? "Studio" : i === 1 ? "1 Bedroom" : `${i} Bedrooms`,
}));

export const BATHROOM_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: i,
  label: `${i} ${i === 1 ? "Bathroom" : "Bathrooms"}`,
}));

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartment",
  condo: "Condo",
  house: "House",
  townhouse: "Townhouse",
};

export const FURNISHING_LABELS: Record<string, string> = {
  fully: "Fully Furnished",
  partial: "Partially Furnished",
  none: "Unfurnished",
};

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  rented: "Rented",
  archived: "Archived",
};

export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  rented: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-800",
};

export function formatCurrency(
  amount: number,
  currency: string = "THB"
): string {
  if (currency === "THB") {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount
  );
}

export function getPropertyTypeLabel(type: string): string {
  return PROPERTY_TYPE_LABELS[type] ?? type;
}

export function getFurnishingLabel(furnishing: string): string {
  return FURNISHING_LABELS[furnishing] ?? furnishing;
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800";
}
