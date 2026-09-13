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
  PENDING: "pending",
  REVIEW: "review",
  ACTIVE: "active",
  INACTIVE: "inactive",
  RENTED: "rented",
} as const;

export const PropertyNextAction = {
  BASIC_DETAILS: "basic_details",
  AMENITIES: "amenities",
  PHOTOS: "photos",
  REVIEW: "review",
  COMPLETED: "completed",
} as const;

// Type inference from objects
export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];
export type FurnishedStatus =
  (typeof FurnishedStatus)[keyof typeof FurnishedStatus];
export type Amenity = (typeof Amenity)[keyof typeof Amenity];
export type PropertyStatus =
  (typeof PropertyStatus)[keyof typeof PropertyStatus];
export type PropertyNextAction =
  (typeof PropertyNextAction)[keyof typeof PropertyNextAction];

// Value arrays for Zod (derived from object values)
export const PROPERTY_TYPE_VALUES = Object.values(PropertyType);
export const FURNISHED_STATUS_VALUES = Object.values(FurnishedStatus);
export const AMENITY_VALUES = Object.values(Amenity);
export const PROPERTY_STATUS_VALUES = Object.values(PropertyStatus);

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
export type BasicDetailsInput = {
  propertyType: PropertyType;
  title: string;
  location: string;
  monthlyRent: number;
  bedrooms: number;
  bathrooms: number;
  description?: string;
  latitude?: number;
  longitude?: number;
  locationDetails?: Location;
  buildingName?: string;
};

export type AmenitiesInput = {
  furnishedStatus: FurnishedStatus;
  amenities: Amenity[];
};

export type ImagesInput = {
  images: string[];
};

export type Property = {
  id: string;
  profileId: string;
  propertyType: PropertyType;
  title: string;
  location: string;
  locationId?: string | null;
  locationDetails?: Location | null;
  monthlyRent: number;
  description: string | null;
  bedrooms: number;
  bathrooms: number;
  furnishedStatus: FurnishedStatus;
  amenities: Amenity[];
  images: string[];
  status: PropertyStatus;
  nextAction: PropertyNextAction;
  createdAt: string;
  updatedAt?: string;
  listedAt?: string;
};
