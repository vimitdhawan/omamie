import { z } from "zod";
import {
  PROPERTY_TYPE_VALUES,
  FURNISHED_STATUS_VALUES,
  AMENITY_VALUES,
  PROPERTY_STATUS_VALUES,
} from "./types";

// Zod validation schemas using derived value tuples
export const propertyTypeSchema = z.enum(PROPERTY_TYPE_VALUES, {
  message: "Please select a property type",
});

export const furnishedStatusSchema = z.enum(FURNISHED_STATUS_VALUES, {
  message: "Please select a furnishing status",
});

export const amenitySchema = z.enum(AMENITY_VALUES);

export const propertyStatusSchema = z.enum(PROPERTY_STATUS_VALUES);

// UI label mappings
export const PROPERTY_TYPES: Record<string, string> = {
  apartment: "Apartment",
  condo: "Condo",
  house: "House",
  townhouse: "Townhouse",
} as const;

export const FURNISHED_STATUS: Record<string, string> = {
  furnished: "Fully Furnished",
  partial: "Partially Furnished",
  unfurnished: "Unfurnished",
} as const;

export const AMENITIES: Record<string, string> = {
  ac: "Air Conditioning",
  wifi: "Wi-Fi",
  parking: "Parking",
  pool: "Swimming Pool",
  gym: "Gym",
  microwave: "Microwave",
  washing_machine: "Washing Machine",
  refrigerator: "Refrigerator",
  tv: "TV",
  balcony: "Balcony",
  elevator: "Elevator",
  security: "Security",
  sofa: "Sofa",
} as const;

// Step 1: Basic Property Details (Type, Title, Location, Rent, Bedrooms, Bathrooms, Description)
// Client-side schema (for React Hook Form zodResolver)
export const basicDetailsSchema = z.object({
  propertyType: propertyTypeSchema,
  title: z
    .string()
    .min(5, "Property title must be at least 5 characters")
    .max(100, "Property title must be less than 100 characters"),
  location: z.string().min(3, "Location is required"),
  latitude: z
    .number({
      message: "Latitude must be a number",
    })
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude"),
  longitude: z
    .number({
      message: "Longitude must be a number",
    })
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),
  monthlyRent: z
    .number({
      message: "Monthly rent must be a number",
    })
    .int("Monthly rent must be a whole number")
    .positive("Monthly rent must be positive"),
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
  description: z.string().max(1000, "Description is too long").optional(),
  buildingName: z
    .string()
    .max(200, "Building name must be less than 200 characters")
    .optional(),
});

// Server-side schema (for FormData validation with coerce)
export const basicInfoSchema = z.object({
  propertyType: propertyTypeSchema,
  title: z
    .string()
    .min(5, "Property title must be at least 5 characters")
    .max(100, "Property title must be less than 100 characters"),
  location: z.string().min(3, "Location is required"),
  locationSelected: z.literal("true", {
    message: "Please select a neighbourhood from the suggestions",
  }),
  latitude: z.coerce
    .number({
      message: "Latitude must be a number",
    })
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude"),
  longitude: z.coerce
    .number({
      message: "Longitude must be a number",
    })
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),
  monthlyRent: z.coerce
    .number({
      message: "Monthly rent must be a number",
    })
    .int("Monthly rent must be a whole number")
    .positive("Monthly rent must be positive"),
  bedrooms: z.coerce
    .number()
    .int()
    .min(1, "At least 1 bedroom is required")
    .max(20, "Maximum 20 bedrooms allowed"),
  bathrooms: z.coerce
    .number()
    .int()
    .min(1, "At least 1 bathroom is required")
    .max(20, "Maximum 20 bathrooms allowed"),
  description: z.string().max(1000, "Description is too long").optional(),
  buildingName: z
    .string()
    .max(200, "Building name must be less than 200 characters")
    .optional(),
  locationContext: z.string().optional(),
});

// Step 2: Amenities & Features (Furnished Status, Amenities)
export const amenitiesSchema = z.object({
  furnishedStatus: furnishedStatusSchema,
  amenities: z.array(amenitySchema),
});

// Step 3: Images Upload (0-10 images)
export const imagesSchema = z.object({
  images: z
    .array(z.string().min(1, "Image path required"))
    .max(10, "Maximum 10 images allowed"),
});

// Step 4: Review & Confirm (Terms & Accuracy)
export const reviewSchema = z.object({
  acceptTerms: z.literal(true, {
    message: "You must accept the terms and conditions",
  }),
  confirmAccuracy: z.literal(true, {
    message: "You must confirm the information is accurate",
  }),
});

// Combined schema for server-side validation (backward compatibility)
export const listPropertySchema = basicDetailsSchema
  .merge(amenitiesSchema)
  .merge(reviewSchema);

// Type inference with purpose-based names
export type BasicDetailsData = z.infer<typeof basicDetailsSchema>;
export type AmenitiesData = z.infer<typeof amenitiesSchema>;
export type ImagesData = z.infer<typeof imagesSchema>;
export type ReviewData = z.infer<typeof reviewSchema>;
export type ListPropertyFormData = z.infer<typeof listPropertySchema>;

// Action state type for server actions
export type PropertyActionState = {
  errors?: Record<string, string[]>;
  errorMessage?: string;
  success?: boolean;
};
