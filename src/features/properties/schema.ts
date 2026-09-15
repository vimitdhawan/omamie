import { z } from "zod";
import {
  PROPERTY_TYPE_VALUES,
  FURNISHED_STATUS_VALUES,
  AMENITY_VALUES,
  PROPERTY_STATUS_VALUES,
  type PropertyStatus,
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

/** Common Bangkok lease terms, offered as chips with a custom fallback. */
export const LEASE_PRESET_MONTHS = [1, 3, 6, 12] as const;

export const MAX_IMAGES = 10;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/**
 * One entry in the ordered image manifest.
 *
 * Exactly one of `id` (an image already saved) or `fileIndex` (an index into the `files`
 * entries of the same FormData) is set. Ordering is carried by `sortOrder`, so a reorder and
 * an upload are the same submission.
 */
export const imageManifestEntrySchema = z
  .object({
    id: z.uuid().nullable().default(null),
    fileIndex: z.number().int().min(0).nullable().default(null),
    sortOrder: z.number().int().min(0),
  })
  .refine((entry) => (entry.id === null) !== (entry.fileIndex === null), {
    message: "Each image must reference either a saved image or a new file",
  });

export const imageManifestSchema = z
  .string()
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid image manifest" });
      return z.NEVER;
    }
  })
  .pipe(
    z
      .array(imageManifestEntrySchema)
      .max(MAX_IMAGES, `Maximum ${MAX_IMAGES} images allowed`)
  );

// Files travel as FormData entries rather than in the object payload, so they are validated
// separately. The previous form claimed a 10MB limit and enforced nothing.
export const imageFileSchema = z
  .file()
  .max(MAX_IMAGE_BYTES, "Each image must be under 5MB")
  .mime(
    [...ACCEPTED_IMAGE_TYPES],
    "Only JPEG, PNG and WebP images are supported"
  );

export const imageFilesSchema = z
  .array(imageFileSchema)
  .max(MAX_IMAGES, `Maximum ${MAX_IMAGES} images allowed`);

/**
 * These five fields are optional AND clearable, so `null` has to survive validation: an
 * explicit null is how the editor tells `save_property` to empty a column (omitting the key
 * preserves the old value instead). `.nullish()` accepts both null and undefined.
 */
function nullableCoercedInt(min: number, max: number, maxMessage: string) {
  return z.coerce
    .number()
    .int("Enter a whole number")
    .min(min)
    .max(max, maxMessage)
    .nullish();
}

function nullableCoercedNumber(
  min: number,
  max: number,
  minMessage: string,
  maxMessage: string
) {
  return z.coerce.number().min(min, minMessage).max(max, maxMessage).nullish();
}

/**
 * `<input type="date">` submits "YYYY-MM-DD". Postgres `date` accepts that literal verbatim,
 * so it travels end to end as a string and never becomes a JS Date, which would reapply a
 * timezone and shift the day.
 */
function nullableIsoDate() {
  return z.iso.date("Enter a valid date").nullish();
}

/**
 * Draft intent: the shape is checked, completeness is not. Saving partial work must never be
 * blocked by a field the owner has not filled in yet.
 */
export const propertyDraftSchema = z.object({
  propertyId: z.uuid().optional(),
  intent: z.enum(["draft", "publish"]),
  propertyType: propertyTypeSchema.optional(),
  title: z
    .string()
    .max(100, "Property title must be less than 100 characters")
    .optional(),
  location: z.string().max(300, "Location is too long").optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  monthlyRent: z.coerce
    .number()
    .int("Monthly rent must be a whole number")
    .positive("Monthly rent must be positive")
    .optional(),
  bedrooms: z.coerce
    .number()
    .int()
    .min(1, "At least 1 bedroom is required")
    .max(20, "Maximum 20 bedrooms allowed")
    .optional(),
  bathrooms: z.coerce
    .number()
    .int()
    .min(1)
    .max(20, "Maximum 20 bathrooms allowed")
    .optional(),
  description: z.string().max(1000, "Description is too long").nullish(),
  buildingName: z
    .string()
    .max(200, "Building name must be less than 200 characters")
    .optional(),
  furnishedStatus: furnishedStatusSchema.optional(),
  securityDepositMonths: nullableCoercedInt(
    0,
    24,
    "Deposit cannot exceed 24 months"
  ),
  availableFrom: nullableIsoDate(),
  areaSqm: nullableCoercedNumber(
    0.01,
    10000,
    "Size must be greater than zero",
    "Size looks too large"
  ),
  floorNumber: nullableCoercedInt(-5, 200, "Floor looks too high"),
  totalFloors: nullableCoercedInt(1, 200, "That is a lot of floors"),
  minimumLeaseMonths: nullableCoercedInt(
    1,
    60,
    "Minimum lease cannot exceed 60 months"
  ),
  amenities: z.array(amenitySchema).default([]),
  locationContext: z.string().optional(),
  images: imageManifestSchema.default([]),
});

/** Publish intent: the same payload, with everything a live listing needs. */
export const propertyPublishSchema = propertyDraftSchema.extend({
  propertyType: propertyTypeSchema,
  title: z
    .string()
    .min(5, "Property title must be at least 5 characters")
    .max(100, "Property title must be less than 100 characters"),
  location: z.string().min(3, "Location is required"),
  latitude: z.coerce
    .number()
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude"),
  longitude: z.coerce
    .number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),
  monthlyRent: z.coerce
    .number()
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
  furnishedStatus: furnishedStatusSchema,
  areaSqm: z.coerce
    .number({ message: "Floor area is required" })
    .positive("Size must be greater than zero")
    .max(10000, "Size looks too large"),
  images: imageManifestSchema.refine(
    (entries) => entries.length > 0,
    "At least one photo is required"
  ),
  acceptTerms: z.literal("on", {
    message: "You must accept the terms and conditions",
  }),
  confirmAccuracy: z.literal("on", {
    message: "You must confirm the information is accurate",
  }),
});

export function schemaForIntent(intent: unknown) {
  return intent === "publish" ? propertyPublishSchema : propertyDraftSchema;
}

export type PropertyDraftData = z.infer<typeof propertyDraftSchema>;
export type PropertyPublishData = z.infer<typeof propertyPublishSchema>;
export type PropertySaveData = PropertyDraftData | PropertyPublishData;
export type ImageManifestEntry = z.infer<typeof imageManifestEntrySchema>;

/** Splits a submission into the object payload and the uploaded files. */
/**
 * Fields the editor is allowed to blank out. Everything else is intentionally excluded: a
 * cleared title must not wipe the saved one, it just means this submission did not carry it.
 */
export const CLEARABLE_FIELDS = [
  "securityDepositMonths",
  "availableFrom",
  "areaSqm",
  "floorNumber",
  "totalFloors",
  "minimumLeaseMonths",
  "description",
] as const;

function parseClearedFields(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string" || raw === "") return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (field): field is string =>
        typeof field === "string" &&
        (CLEARABLE_FIELDS as readonly string[]).includes(field)
    );
  } catch {
    return [];
  }
}

export function parsePropertyFormData(formData: FormData): {
  payload: Record<string, unknown>;
  files: File[];
} {
  const payload: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (
      key === "files" ||
      key === "amenities" ||
      key === "clearedFields" ||
      value instanceof File
    )
      continue;
    // An empty value means "not carried by this submission", so the key is omitted and
    // save_property preserves whatever was stored. Genuine clearing goes through
    // `clearedFields` below -- otherwise a blank input could never empty a saved column.
    if (value === "") continue;
    payload[key] = value;
  }

  payload.amenities = [...new Set(formData.getAll("amenities") as string[])];

  // An explicit null is what tells save_property to empty a column.
  for (const field of parseClearedFields(formData.get("clearedFields"))) {
    payload[field] = null;
  }

  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  return { payload, files };
}

/** Action state for the single property form. */
export type PropertyActionState = {
  success?: boolean;
  errors?: Record<string, string[]>;
  errorMessage?: string;
  propertyId?: string;
  status?: PropertyStatus;
  /** True when this submission created the listing, so the client can swap to the edit URL. */
  created?: boolean;
  /**
   * Images that failed to upload while the property itself saved. This is a partial success:
   * `success` stays true so the UI does not tell the owner their work was lost.
   */
  imageWarnings?: Array<{ fileName: string; message: string }>;
};

// ---------------------------------------------------------------------------
// Client form schemas
//
// The schemas above parse FormData, where every value is a string. These parse the
// React Hook Form value object, where numbers are already numbers. Keeping both in this
// file means a validation message is written once and shown identically on either side.
// ---------------------------------------------------------------------------

/**
 * A cleared `<input type="number">` gives "" (and NaN under `valueAsNumber`). Rather than
 * wrapping these in `z.preprocess` -- which erases the input type RHF's resolver is generic
 * over -- the inputs are registered with `numericFieldOptions` below, so an empty control is
 * already null by the time the resolver sees it.
 */
function nullableFormInt(min: number, max: number, maxMessage: string) {
  return z
    .number()
    .int("Enter a whole number")
    .min(min)
    .max(max, maxMessage)
    .nullish();
}

function nullableFormNumber(
  min: number,
  max: number,
  minMessage: string,
  maxMessage: string
) {
  return z.number().min(min, minMessage).max(max, maxMessage).nullish();
}

/**
 * Registration options for every optional numeric input. Empty clears the field to null,
 * which is what tells `save_property` to empty the column -- omitting the key would instead
 * preserve whatever was saved before.
 */
/**
 * Bedrooms and bathrooms always have at least one. Clearing the input yields "" (NaN under
 * valueAsNumber), which zod reports as "expected number, received NaN" — a confusing error
 * for a field that simply cannot be empty, so it falls back to the minimum instead.
 */
export const countFieldOptions = {
  setValueAs: (value: unknown) => {
    const parsed = Number(value);
    return value === "" || value === null || Number.isNaN(parsed) ? 1 : parsed;
  },
} as const;

export const numericFieldOptions = {
  setValueAs: (value: unknown) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  },
} as const;

export const propertyFormClientSchema = z.object({
  propertyType: propertyTypeSchema.optional(),
  title: z
    .string()
    .max(100, "Property title must be less than 100 characters")
    .optional(),
  location: z.string().max(300, "Location is too long").optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationContext: z.string().optional(),
  buildingName: z
    .string()
    .max(200, "Building name must be less than 200 characters")
    .optional(),
  monthlyRent: z
    .number()
    .int("Monthly rent must be a whole number")
    .positive("Monthly rent must be positive")
    .optional(),
  bedrooms: z
    .number()
    .int()
    .min(1, "At least 1 bedroom is required")
    .max(20, "Maximum 20 bedrooms allowed"),
  bathrooms: z.number().int().min(1).max(20, "Maximum 20 bathrooms allowed"),
  description: z.string().max(1000, "Description is too long").nullish(),
  furnishedStatus: furnishedStatusSchema.optional(),
  securityDepositMonths: nullableFormInt(
    0,
    24,
    "Deposit cannot exceed 24 months"
  ),
  availableFrom: nullableIsoDate(),
  areaSqm: nullableFormNumber(
    0.01,
    10000,
    "Size must be greater than zero",
    "Size looks too large"
  ),
  floorNumber: nullableFormInt(-5, 200, "Floor looks too high"),
  totalFloors: nullableFormInt(1, 200, "That is a lot of floors"),
  minimumLeaseMonths: nullableFormInt(
    1,
    60,
    "Minimum lease cannot exceed 60 months"
  ),
  amenities: z.array(amenitySchema),
  acceptTerms: z.boolean(),
  confirmAccuracy: z.boolean(),
  imageCount: z.number().int().min(0).max(MAX_IMAGES),
});

export const propertyFormPublishClientSchema = propertyFormClientSchema.extend({
  propertyType: propertyTypeSchema,
  title: z
    .string()
    .min(5, "Property title must be at least 5 characters")
    .max(100, "Property title must be less than 100 characters"),
  location: z.string().min(3, "Location is required"),
  latitude: z.number({
    message: "Select a neighbourhood from the suggestions",
  }),
  longitude: z.number({
    message: "Select a neighbourhood from the suggestions",
  }),
  monthlyRent: z
    .number({ message: "Monthly rent is required" })
    .int("Monthly rent must be a whole number")
    .positive("Monthly rent must be positive"),
  bedrooms: z
    .number()
    .int()
    .min(1, "At least 1 bedroom is required")
    .max(20, "Maximum 20 bedrooms allowed"),
  furnishedStatus: furnishedStatusSchema,
  areaSqm: z
    .number({ message: "Floor area is required" })
    .positive("Size must be greater than zero")
    .max(10000, "Size looks too large"),
  imageCount: z.number().int().min(1, "At least one photo is required"),
  acceptTerms: z.literal(true, {
    message: "You must accept the terms and conditions",
  }),
  confirmAccuracy: z.literal(true, {
    message: "You must confirm the information is accurate",
  }),
});

export type PropertyFormValues = z.infer<typeof propertyFormClientSchema>;

/** Which form fields each drawer owns, for per-section validation on close. */
export const SECTION_FIELDS = {
  // location/lat/lng/buildingName must stay together: buildingName persists to
  // locations.address_line_2, and buildLocationPayload discards the whole location write
  // unless both coordinates are present.
  basics: [
    "propertyType",
    "location",
    "latitude",
    "longitude",
    "buildingName",
    "monthlyRent",
    "securityDepositMonths",
    "availableFrom",
    "minimumLeaseMonths",
  ],
  specs: [
    "bedrooms",
    "bathrooms",
    "areaSqm",
    "floorNumber",
    "totalFloors",
    "furnishedStatus",
  ],
  photos: ["imageCount"],
  amenities: ["amenities"],
  headline: ["title", "description"],
} as const satisfies Record<string, readonly (keyof PropertyFormValues)[]>;

/** Card titles and order shown in the editor. */
export const SECTION_META: ReadonlyArray<{
  key: PropertySection;
  title: string;
  hint: string;
}> = [
  {
    key: "basics",
    title: "Property Basics & Rental Terms",
    hint: "Type, address, rent, deposit and availability",
  },
  {
    key: "specs",
    title: "Bedrooms, Bathrooms & Specs",
    hint: "Rooms, size, floor and furnishing",
  },
  {
    key: "photos",
    title: "Property Photos",
    hint: "Up to 10 images — the first is the cover",
  },
  {
    key: "amenities",
    title: "Amenities & Building Highlights",
    hint: "What comes with the place",
  },
  {
    key: "headline",
    title: "Headline & Description",
    hint: "How the listing reads to a tenant",
  },
];

export type PropertySection = keyof typeof SECTION_FIELDS;

/**
 * Sections with no required fields. They can be saved empty — a plain house needs no
 * building facilities — so their drawer never blocks and their card reads "Optional"
 * until the owner has actually looked at it.
 */
export const OPTIONAL_SECTIONS: readonly PropertySection[] = ["amenities"];

/**
 * Required to publish, but never allowed to block a drawer's Save.
 *
 * Coordinates are not typed by the owner — they arrive only by picking a Mapbox
 * suggestion. Gating Save on them would mean that a missing MAPBOX_TOKEN, or the geocoder
 * being down, leaves the section permanently unsaveable and the owner unable to record
 * anything they had typed. They still block publishing, and the section still reads as
 * incomplete until they are set.
 */
const NON_BLOCKING_FIELDS: readonly (keyof PropertyFormValues)[] = [
  "latitude",
  "longitude",
];

/**
 * Everything the given section still needs before the listing could be published, keyed by
 * field.
 *
 * The form resolver deliberately uses the lenient draft rules so partial work always
 * persists; this is the stricter view a drawer uses to decide whether its own section is
 * finished. Scoping by section matters — a missing photo must not light up an error inside
 * the address drawer.
 */
export function validateSection(
  section: PropertySection,
  values: Partial<PropertyFormValues>,
  options: { blockingOnly?: boolean } = {}
): Partial<Record<keyof PropertyFormValues, string>> {
  const owned = SECTION_FIELDS[
    section
  ] as readonly (keyof PropertyFormValues)[];
  const result = propertyFormPublishClientSchema.safeParse(values);
  if (result.success) return {};

  const issues: Partial<Record<keyof PropertyFormValues, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof PropertyFormValues | undefined;
    // acceptTerms / confirmAccuracy belong to the publish panel, not to any section.
    if (!field || !owned.includes(field)) continue;
    if (options.blockingOnly && NON_BLOCKING_FIELDS.includes(field)) continue;
    issues[field] ??= issue.message;
  }
  return issues;
}
