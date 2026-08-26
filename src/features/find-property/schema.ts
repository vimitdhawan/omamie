import { z } from "zod";
import {
  PROPERTY_TYPE_VALUES,
  BEDROOMS_VALUES,
  BATHROOMS_VALUES,
  FURNISHING_VALUES,
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

export const findPropertyFormSchema = z.object({
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
});

export type FindPropertyFormData = z.infer<typeof findPropertyFormSchema>;

export type FindPropertyActionState = {
  errors?: Partial<Record<keyof FindPropertyFormData, string[]>>;
  errorMessage?: string;
  success?: boolean;
};
