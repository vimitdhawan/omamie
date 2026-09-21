import { z } from "zod";
import {
  PROPERTY_TYPE_VALUES,
  BEDROOMS_VALUES,
  BATHROOMS_VALUES,
  FURNISHING_VALUES,
  LEASE_LENGTH_VALUES,
  INTENDED_DURATION_VALUES,
  AMENITY_WISHLIST_VALUES,
} from "./types";

// Zod validation schemas using derived value tuples
export const propertyTypeEnum = z.enum(PROPERTY_TYPE_VALUES, {
  message: "Please select a property type",
});

export const bedroomsEnum = z.enum(BEDROOMS_VALUES, {
  message: "Please select the number of bedrooms",
});

export const bathroomsEnum = z.enum(BATHROOMS_VALUES, {
  message: "Please select the number of bathrooms",
});

export const furnishingEnum = z.enum(FURNISHING_VALUES, {
  message: "Please select a furnishing preference",
});

export const leaseLengthEnum = z.enum(LEASE_LENGTH_VALUES, {
  message: "Please select a preferred lease length",
});

export const intendedDurationEnum = z.enum(INTENDED_DURATION_VALUES, {
  message: "Please select how long you intend to stay",
});

// UI label mappings
export const PROPERTY_TYPES: Record<string, string> = {
  apartment: "Apartment",
  condo: "Condo",
  house: "House",
  townhouse: "Townhouse",
} as const;

export const BEDROOMS_LABELS: Record<string, string> = {
  studio: "Studio",
  "1": "1 Bedroom",
  "2": "2 Bedrooms",
  "3": "3 Bedrooms",
  "4+": "4+ Bedrooms",
} as const;

export const BATHROOMS_LABELS: Record<string, string> = {
  "1": "1 Bathroom",
  "2": "2 Bathrooms",
  "3+": "3+ Bathrooms",
} as const;

export const FURNISHING_LABELS: Record<string, string> = {
  furnished: "Furnished",
  partially: "Partially Furnished",
  unfurnished: "Unfurnished",
} as const;

export const LEASE_LENGTH_LABELS: Record<string, string> = {
  "6_months": "6 Months",
  "1_year": "1 Year",
  "2_years": "2 Years",
  flexible: "Flexible",
} as const;

export const INTENDED_DURATION_LABELS: Record<string, string> = {
  "6_months": "6 Months",
  "1_year": "1 Year",
  "2_years": "2 Years",
  longer: "Longer than 2 years",
  flexible: "Flexible",
} as const;

// Reuse the property listing amenity labels so the tenant wishlist matches
// what an owner can actually tag on a listing.
export { AMENITIES as AMENITY_WISHLIST_LABELS } from "@/features/properties/schema";

export const tenantProfileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(80),
  occupation: z.string().min(1, "Occupation is required").max(120),
  employer: z.string().max(120).optional().or(z.literal("")),
  reasonForMoving: z
    .string()
    .min(1, "Let owners know why you're moving")
    .max(500),
  intendedDuration: intendedDurationEnum,
  numberOfOccupants: z.coerce
    .number()
    .int()
    .positive("Must be at least 1 occupant"),
  hasPets: z.boolean().default(false),
  isSmoker: z.boolean().default(false),
  bio: z.string().max(1000).optional().or(z.literal("")),
});

export const tenantRequirementsFormSchema = z.object({
  propertyType: propertyTypeEnum,
  preferredLocation: z.string().min(1, "Preferred location is required"),
  monthlyBudget: z.coerce
    .number()
    .positive("Monthly budget must be greater than 0"),
  moveInDate: z.string().min(1, "Move-in date is required"),
  bedrooms: bedroomsEnum,
  bathrooms: bathroomsEnum,
  minSizeSqm: z.coerce
    .number()
    .int()
    .positive("Min size must be positive")
    .optional()
    .or(z.literal("")),
  furnishing: furnishingEnum,
  preferredNeighborhoods: z.array(z.string().min(1)).default([]),
  petFriendly: z.boolean().default(false),
  parkingNeeded: z.boolean().default(false),
  amenitiesWishlist: z.array(z.enum(AMENITY_WISHLIST_VALUES)).default([]),
  additionalNotes: z
    .string()
    .max(1000, "Notes must be 1000 characters or fewer")
    .optional()
    .or(z.literal("")),
  preferredLeaseLength: leaseLengthEnum.optional().or(z.literal("")),
});

// The tenant fills both sections in a single form before they can request a property.
export const requirementsFormSchema = tenantProfileFormSchema.merge(
  tenantRequirementsFormSchema
);

export type TenantProfileFormData = z.infer<typeof tenantProfileFormSchema>;
export type TenantRequirementsFormData = z.infer<
  typeof tenantRequirementsFormSchema
>;
export type RequirementsFormData = z.infer<typeof requirementsFormSchema>;

export type RequirementsActionState = {
  errors?: Partial<Record<keyof RequirementsFormData, string[]>>;
  errorMessage?: string;
  success?: boolean;
};
