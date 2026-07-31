import { z } from "zod";

// Enums
export const propertyTypeEnum = z.enum(
  ["apartment", "condo", "house", "townhouse"],
  {
    message: "Please select a property type",
  }
);

export const furnishedStatusEnum = z.enum(
  ["furnished", "partial", "unfurnished"],
  {
    message: "Please select a furnishing status",
  }
);

export const amenityEnum = z.enum([
  "ac",
  "microwave",
  "wifi",
  "pool",
  "gym",
  "parking",
]);

export const propertyStatusEnum = z.enum([
  "pending_review",
  "approved",
  "rejected",
  "archived",
]);

// Type inference from enums
export type PropertyType = z.infer<typeof propertyTypeEnum>;
export type FurnishedStatus = z.infer<typeof furnishedStatusEnum>;
export type Amenity = z.infer<typeof amenityEnum>;
export type PropertyStatus = z.infer<typeof propertyStatusEnum>;

// Constants for UI
export const PROPERTY_TYPES: Record<PropertyType, string> = {
  apartment: "Apartment",
  condo: "Condo",
  house: "House",
  townhouse: "Townhouse",
} as const;

export const FURNISHED_STATUS: Record<FurnishedStatus, string> = {
  furnished: "Fully Furnished",
  partial: "Partially Furnished",
  unfurnished: "Unfurnished",
} as const;

export const AMENITIES: Record<Amenity, string> = {
  ac: "Air Conditioning",
  microwave: "Microwave",
  wifi: "Wi-Fi",
  pool: "Swimming Pool",
  gym: "Gym",
  parking: "Parking",
} as const;

// Step 1: Property Details
export const step1Schema = z.object({
  propertyType: propertyTypeEnum,
  title: z
    .string()
    .min(5, "Property title must be at least 5 characters")
    .max(100, "Property title must be less than 100 characters"),
  location: z.string().min(3, "Location is required"),
  monthlyRent: z
    .number({
      message: "Monthly rent must be a number",
    })
    .int("Monthly rent must be a whole number")
    .positive("Monthly rent must be positive"),
  description: z.string().max(1000, "Description is too long").optional(),
});

// Step 2: Amenities
export const step2Schema = z.object({
  bedrooms: z
    .number()
    .int()
    .min(1, "At least 1 bedroom is required")
    .max(20, "Maximum 20 bedrooms allowed"),
  bathrooms: z
    .number()
    .int()
    .min(1, "At least 1 bathroom is required")
    .max(20, "Maximum 20 bathrooms allowed"),
  furnishedStatus: furnishedStatusEnum,
  amenities: z.array(amenityEnum).default([]),
});

// Step 3: Review (just checkboxes, no data collection)
export const step3Schema = z.object({
  acceptTerms: z.literal(true, {
    message: "You must accept the terms and conditions",
  }),
  confirmAccuracy: z.literal(true, {
    message: "You must confirm the information is accurate",
  }),
});

// Combined schema for server-side validation
export const listPropertySchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema);

// Type inference
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type ListPropertyFormData = z.infer<typeof listPropertySchema>;

// Helper function to extract first error from Zod issues
export function extractFirstError(issues: z.ZodIssue[]): string {
  if (issues.length === 0) return "Validation failed";
  return issues[0].message;
}
