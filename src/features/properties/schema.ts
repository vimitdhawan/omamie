import { z } from "zod";

export const propertyTypeEnum = z.enum([
  "apartment",
  "condo",
  "house",
  "townhouse",
]);
export const furnishingTypeEnum = z.enum(["fully", "partial", "none"]);
export const listingRoleEnum = z.enum(["owner", "agent"]);
export const propertyStatusEnum = z.enum([
  "draft",
  "active",
  "rented",
  "archived",
  "pending",
]);

export const listPropertySchema = z
  .object({
    listingRole: listingRoleEnum.default("owner"),
    propertyType: propertyTypeEnum,
    location: z
      .string()
      .min(5, "Location must be at least 5 characters")
      .max(200, "Location must be at most 200 characters"),
    rentAmount: z
      .number()
      .min(1, "Rent must be at least 1")
      .max(10000000, "Rent is too high"),
    currency: z.string().default("THB"),
    bedrooms: z
      .number()
      .int()
      .min(0, "Bedrooms must be at least 0")
      .max(20, "Bedrooms must be at most 20")
      .default(1),
    bathrooms: z
      .number()
      .int()
      .min(0, "Bathrooms must be at least 0")
      .max(20, "Bathrooms must be at most 20")
      .default(1),
    furnishing: furnishingTypeEnum.default("none"),
    amenities: z.array(z.string()).optional().default([]),
    description: z
      .string()
      .max(2000, "Description must be at most 2000 characters")
      .optional()
      .default(""),
    contactName: z
      .string()
      .min(2, "Contact name must be at least 2 characters")
      .max(100, "Contact name must be at most 100 characters"),
    contactEmail: z.string().email("Please enter a valid email address"),
    contactPhone: z
      .string()
      .min(8, "Phone number must be at least 8 digits")
      .max(20, "Phone number must be at most 20 characters"),
    acceptTerms: z
      .boolean()
      .refine((v) => v === true, "You must accept the terms to continue"),
    acceptMarketing: z.boolean().optional().default(false),
    status: propertyStatusEnum.default("draft"),
  })
  .refine((data) => data.bedrooms > 0 || data.bathrooms > 0, {
    message: "At least one bedroom or bathroom is required",
    path: ["bedrooms"],
  });

export const updatePropertySchema = z.object({
  id: z.string().uuid(),
  listingRole: listingRoleEnum.default("owner").optional(),
  propertyType: propertyTypeEnum.optional(),
  location: z
    .string()
    .min(5, "Location must be at least 5 characters")
    .max(200, "Location must be at most 200 characters")
    .optional(),
  rentAmount: z
    .number()
    .min(1, "Rent must be at least 1")
    .max(10000000, "Rent is too high")
    .optional(),
  currency: z.string().default("THB").optional(),
  bedrooms: z
    .number()
    .int()
    .min(0, "Bedrooms must be at least 0")
    .max(20, "Bedrooms must be at most 20")
    .optional(),
  bathrooms: z
    .number()
    .int()
    .min(0, "Bathrooms must be at least 0")
    .max(20, "Bathrooms must be at most 20")
    .optional(),
  furnishing: furnishingTypeEnum.default("none").optional(),
  amenities: z.array(z.string()).optional().default([]),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .optional()
    .default(""),
  contactName: z
    .string()
    .min(2, "Contact name must be at least 2 characters")
    .max(100, "Contact name must be at most 100 characters")
    .optional(),
  contactEmail: z
    .string()
    .email("Please enter a valid email address")
    .optional(),
  contactPhone: z
    .string()
    .min(8, "Phone number must be at least 8 digits")
    .max(20, "Phone number must be at most 20 characters")
    .optional(),
  acceptTerms: z.boolean().optional(),
  acceptMarketing: z.boolean().optional().default(false),
  status: propertyStatusEnum.default("draft").optional(),
});

export type ListPropertyFormData = z.infer<typeof listPropertySchema>;
export type UpdatePropertyFormData = z.infer<typeof updatePropertySchema>;

export const PROPERTY_TYPE_OPTIONS = [
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "house", label: "House" },
  { value: "townhouse", label: "Townhouse" },
] as const;

export const FURNISHING_OPTIONS = [
  { value: "fully", label: "Fully Furnished" },
  { value: "partial", label: "Partially Furnished" },
  { value: "none", label: "Unfurnished" },
] as const;

export const LISTING_ROLE_OPTIONS = [
  { value: "owner", label: "Owner" },
  { value: "agent", label: "Agent" },
] as const;
