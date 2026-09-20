import type {
  PropertyStatus,
  PropertyType,
  Property,
} from "@/features/properties/types";

export type AdminPropertySummary = {
  id: string;
  title: string;
  location: string | null;
  propertyType: PropertyType | null;
  monthlyRent: number | null;
  status: PropertyStatus;
  createdAt: string;
  ownerId: string;
  ownerName: string | null;
  ownerEmail: string | null;
};

export type AdminPropertyFilter = {
  status?: PropertyStatus;
  search?: string;
};

/** The full listing plus who owns it — admin's read-only detail view needs both. */
export type AdminPropertyDetail = Property & {
  ownerName: string | null;
  ownerEmail: string | null;
};
