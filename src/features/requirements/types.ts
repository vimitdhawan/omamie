// Enum definitions as single source of truth
export const PropertyType = {
  APARTMENT: "apartment",
  CONDO: "condo",
  HOUSE: "house",
  TOWNHOUSE: "townhouse",
} as const;

export const Bedrooms = {
  STUDIO: "studio",
  ONE: "1",
  TWO: "2",
  THREE: "3",
  FOUR_PLUS: "4+",
} as const;

export const Bathrooms = {
  ONE: "1",
  TWO: "2",
  THREE_PLUS: "3+",
} as const;

export const Furnishing = {
  FURNISHED: "furnished",
  PARTIALLY: "partially",
  UNFURNISHED: "unfurnished",
} as const;

export const LeaseLength = {
  SIX_MONTHS: "6_months",
  ONE_YEAR: "1_year",
  TWO_YEARS: "2_years",
  FLEXIBLE: "flexible",
} as const;

export const IntendedDuration = {
  SIX_MONTHS: "6_months",
  ONE_YEAR: "1_year",
  TWO_YEARS: "2_years",
  LONGER: "longer",
  FLEXIBLE: "flexible",
} as const;

// Type inference from objects
export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];
export type Bedrooms = (typeof Bedrooms)[keyof typeof Bedrooms];
export type Bathrooms = (typeof Bathrooms)[keyof typeof Bathrooms];
export type Furnishing = (typeof Furnishing)[keyof typeof Furnishing];
export type LeaseLength = (typeof LeaseLength)[keyof typeof LeaseLength];
export type IntendedDuration =
  (typeof IntendedDuration)[keyof typeof IntendedDuration];

// Value arrays for Zod (derived from object values)
export const PROPERTY_TYPE_VALUES = Object.values(PropertyType);
export const BEDROOMS_VALUES = Object.values(Bedrooms);
export const BATHROOMS_VALUES = Object.values(Bathrooms);
export const FURNISHING_VALUES = Object.values(Furnishing);
export const LEASE_LENGTH_VALUES = Object.values(LeaseLength);
export const INTENDED_DURATION_VALUES = Object.values(IntendedDuration);

/**
 * Amenity wishlist reuses the property listing amenity vocabulary so tenant
 * preferences line up 1:1 with what an owner can tag on a listing.
 */
export type { Amenity } from "@/features/properties/types";
export { AMENITY_VALUES as AMENITY_WISHLIST_VALUES } from "@/features/properties/types";

// Domain Models (business logic layer - camelCase)

/** What a tenant is looking for. One row per tenant. */
export type TenantRequirements = {
  profileId: string;
  propertyType: PropertyType;
  preferredLocation: string;
  monthlyBudget: number;
  moveInDate: string;
  bedrooms: Bedrooms;
  bathrooms: Bathrooms;
  minSizeSqm: number | null;
  furnishing: Furnishing;
  preferredNeighborhoods: string[];
  petFriendly: boolean;
  parkingNeeded: boolean;
  amenitiesWishlist: string[];
  additionalNotes: string | null;
  preferredLeaseLength: LeaseLength | null;
  createdAt: string;
  updatedAt: string;
};

/** General context about who the tenant is. One row per tenant. Deliberately
 * separate from `profiles` — this is the only tenant identity an owner may read. */
export type TenantProfile = {
  profileId: string;
  firstName: string;
  occupation: string;
  employer: string | null;
  reasonForMoving: string;
  intendedDuration: IntendedDuration;
  numberOfOccupants: number;
  hasPets: boolean;
  isSmoker: boolean;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertTenantProfileInput = Omit<
  TenantProfile,
  "createdAt" | "updatedAt"
>;

export type UpsertTenantRequirementsInput = Omit<
  TenantRequirements,
  "createdAt" | "updatedAt"
>;

/** Everything an owner may see about a tenant on a match request. Structurally
 * cannot carry an email or any other `profiles` field. */
export type TenantRequestDetail = {
  profile: TenantProfile | null;
  requirements: TenantRequirements | null;
};
