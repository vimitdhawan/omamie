import type { TablesInsert, TablesUpdate } from "@/lib/supabase/types";

export type PropertyType = "apartment" | "condo" | "house" | "townhouse";
export type FurnishingType = "fully" | "partial" | "none";
export type ListingRole = "owner" | "agent";
export type PropertyStatus =
  | "draft"
  | "active"
  | "rented"
  | "archived"
  | "pending";

export interface Property {
  id: string;
  owner_id: string | null;
  listing_role: string;
  title: string;
  description: string | null;
  property_type: string;
  rent_amount: number;
  currency: string;
  address: string;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  bedrooms: number;
  bathrooms: number;
  furnishing: string;
  amenities: string[];
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export type PropertyInsert = TablesInsert<"properties">;
export type PropertyUpdate = TablesUpdate<"properties">;

export const PROPERTY_TYPES: Record<PropertyType, string> = {
  apartment: "Apartment",
  condo: "Condo",
  house: "House",
  townhouse: "Townhouse",
} as const;

export const FURNISHING_TYPES: Record<FurnishingType, string> = {
  fully: "Fully Furnished",
  partial: "Partially Furnished",
  none: "Unfurnished",
} as const;

export const LISTING_ROLES: Record<ListingRole, string> = {
  owner: "Owner",
  agent: "Agent",
} as const;

export const PROPERTY_STATUSES: Record<PropertyStatus, string> = {
  draft: "Draft",
  active: "Active",
  rented: "Rented",
  archived: "Archived",
  pending: "Pending Review",
} as const;

export const CURRENCY = "THB" as const;
export const DEFAULT_COUNTRY = "Thailand" as const;

export interface PropertyActionResult {
  success: boolean;
  error?: string;
  message?: string;
  data?: Property;
}
