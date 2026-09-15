// Enum definitions as single source of truth
export const PropertyType = {
  APARTMENT: "apartment",
  CONDO: "condo",
  HOUSE: "house",
  TOWNHOUSE: "townhouse",
} as const;

export const FurnishedStatus = {
  FURNISHED: "furnished",
  PARTIAL: "partial",
  UNFURNISHED: "unfurnished",
} as const;

export const Amenity = {
  AC: "ac",
  WIFI: "wifi",
  PARKING: "parking",
  POOL: "pool",
  GYM: "gym",
  MICROWAVE: "microwave",
  WASHING_MACHINE: "washing_machine",
  REFRIGERATOR: "refrigerator",
  TV: "tv",
  BALCONY: "balcony",
  ELEVATOR: "elevator",
  SECURITY: "security",
  SOFA: "sofa",
} as const;

export const PropertyStatus = {
  DRAFT: "draft",
  PENDING: "pending",
  REVIEW: "review",
  ACTIVE: "active",
  INACTIVE: "inactive",
  RENTED: "rented",
} as const;

export const PropertyImageStatus = {
  PENDING: "pending",
  UPLOADED: "uploaded",
  FAILED: "failed",
} as const;

// Type inference from objects
export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];
export type FurnishedStatus =
  (typeof FurnishedStatus)[keyof typeof FurnishedStatus];
export type Amenity = (typeof Amenity)[keyof typeof Amenity];
export type PropertyStatus =
  (typeof PropertyStatus)[keyof typeof PropertyStatus];
export type PropertyImageStatus =
  (typeof PropertyImageStatus)[keyof typeof PropertyImageStatus];

// Value arrays for Zod (derived from object values)
export const PROPERTY_TYPE_VALUES = Object.values(PropertyType);
export const FURNISHED_STATUS_VALUES = Object.values(FurnishedStatus);
export const AMENITY_VALUES = Object.values(Amenity);
export const PROPERTY_STATUS_VALUES = Object.values(PropertyStatus);

/**
 * Amenities split by who owns them.
 *
 * Building facilities belong to the block and are the same for every unit in it, so they
 * also seed `condos.facilities` — that is what lets a future listing in the same building
 * inherit them instead of asking the landlord again. Unit amenities are specific to the
 * apartment itself.
 *
 * Both halves are still stored on `properties.amenities`, so a listing stays
 * self-describing even when it has no condo linked (a house has parking too).
 */
export const BUILDING_FACILITY_VALUES = [
  Amenity.POOL,
  Amenity.GYM,
  Amenity.PARKING,
  Amenity.ELEVATOR,
  Amenity.SECURITY,
] as const;

export const UNIT_AMENITY_VALUES = [
  Amenity.AC,
  Amenity.WIFI,
  Amenity.REFRIGERATOR,
  Amenity.WASHING_MACHINE,
  Amenity.MICROWAVE,
  Amenity.TV,
  Amenity.SOFA,
  Amenity.BALCONY,
] as const;

export function isBuildingFacility(amenity: Amenity): boolean {
  return (BUILDING_FACILITY_VALUES as readonly Amenity[]).includes(amenity);
}

/** A building in the shared condo registry. */
export type Condo = {
  id: string;
  name: string;
  facilities: Amenity[];
  verified: boolean;
};

// Location domain model
export type Location = {
  id?: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  countryCode?: string | null;
  latitude: number;
  longitude: number;
  provider?: string | null;
  providerPlaceId?: string | null;
};

// Location context from geocoding enrichment
export type LocationContext = {
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  countryCode?: string;
  provider?: string;
  providerPlaceId?: string;
};

// Domain Models (business logic layer - camelCase)

/**
 * One image belonging to a property.
 *
 * Rows are created as "pending" in the same transaction as the property write and promoted
 * to "uploaded" once the file is in storage, so read paths must filter on "uploaded".
 */
export type PropertyImage = {
  id: string;
  storagePath: string;
  sortOrder: number;
  status: PropertyImageStatus;
};

// Fields are nullable because a draft is saved before it is complete; the
// properties_complete_when_not_draft constraint enforces them once it leaves draft.
export type Property = {
  id: string;
  profileId: string;
  propertyType: PropertyType | null;
  title: string;
  location: string | null;
  locationId?: string | null;
  locationDetails?: Location | null;
  monthlyRent: number | null;
  description: string | null;
  bedrooms: number;
  bathrooms: number;
  furnishedStatus: FurnishedStatus | null;
  securityDepositMonths: number | null;
  minimumLeaseMonths: number | null;
  condoId: string | null;
  condo?: Condo | null;
  /** "YYYY-MM-DD". Deliberately a string: a Date would reapply a timezone and shift the day. */
  availableFrom: string | null;
  areaSqm: number | null;
  floorNumber: number | null;
  totalFloors: number | null;
  amenities: Amenity[];
  images: PropertyImage[];
  status: PropertyStatus;
  createdAt: string;
  updatedAt?: string;
  listedAt?: string;
};
