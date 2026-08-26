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

// Type inference from objects
export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];
export type Bedrooms = (typeof Bedrooms)[keyof typeof Bedrooms];
export type Bathrooms = (typeof Bathrooms)[keyof typeof Bathrooms];
export type Furnishing = (typeof Furnishing)[keyof typeof Furnishing];

// Value arrays for Zod (derived from object values)
export const PROPERTY_TYPE_VALUES = Object.values(PropertyType);
export const BEDROOMS_VALUES = Object.values(Bedrooms);
export const BATHROOMS_VALUES = Object.values(Bathrooms);
export const FURNISHING_VALUES = Object.values(Furnishing);

// Domain Models (business logic layer - camelCase)
export type PropertyFindRequest = {
  id: string;
  profileId: string;
  propertyType: PropertyType;
  preferredLocation: string;
  monthlyBudget: number;
  moveInDate: string;
  bedrooms: Bedrooms;
  bathrooms: Bathrooms;
  minSizeSqm: number | null;
  furnishing: Furnishing;
  createdAt: string;
  updatedAt: string;
};

export type CreatePropertyFindRequestInput = {
  profileId: string;
  propertyType: PropertyType;
  preferredLocation: string;
  monthlyBudget: number;
  moveInDate: string;
  bedrooms: Bedrooms;
  bathrooms: Bathrooms;
  minSizeSqm?: number | null;
  furnishing: Furnishing;
};
