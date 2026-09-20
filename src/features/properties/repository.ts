import { createClient } from "@/lib/supabase/server";
import type { Json, Tables } from "@/lib/supabase/types";
import type {
  Property,
  PropertyImage,
  PropertyImageStatus,
  PropertyType,
  FurnishedStatus,
  PropertyStatus,
  Amenity,
  Location,
} from "./types";
import { AppError } from "@/lib/errors";

// Repository types (database table models)
export type PropertyTable = Tables<"properties">;
export type LocationTable = Tables<"locations">;
export type PropertyImageTable = Tables<"property_images">;
export type CondoTable = Tables<"condos">;

type GeoJsonPoint = { coordinates?: [number, number] };

type PropertyRow = PropertyTable & {
  locations?: LocationTable | null;
  property_images?: PropertyImageTable[] | null;
  condos?: CondoTable | null;
};

/**
 * Repository layer for properties
 * Direct database operations only - mapping between domain and table models
 */

// Only uploaded images are ever surfaced. A row can sit in "pending" if the process died
// between the transaction committing and the file reaching storage, and rendering those
// would produce broken images.
export const PROPERTY_SELECT =
  "*, locations(*), condos(id, name, facilities, verified), property_images(id, storage_path, sort_order, status)";

// Mapping Functions
function mapLocationToLocationDomain(table: LocationTable): Location {
  return {
    id: table.id,
    addressLine1: table.address_line_1,
    addressLine2: table.address_line_2,
    city: table.city,
    district: table.district,
    state: table.state,
    postalCode: table.postal_code,
    country: table.country,
    countryCode: table.country_code,
    latitude: (table.location as GeoJsonPoint | null)?.coordinates?.[1] ?? 0,
    longitude: (table.location as GeoJsonPoint | null)?.coordinates?.[0] ?? 0,
    provider: table.provider,
    providerPlaceId: table.provider_place_id,
  };
}

function mapImageToDomain(table: PropertyImageTable): PropertyImage {
  return {
    id: table.id,
    storagePath: table.storage_path,
    sortOrder: table.sort_order,
    status: table.status as PropertyImageStatus,
  };
}

function mapTableToProperty(table: PropertyRow): Property {
  return {
    id: table.id,
    profileId: table.profile_id,
    propertyType: table.property_type as PropertyType | null,
    title: table.title,
    location: table.location,
    locationId: table.location_id ?? undefined,
    locationDetails: table.locations
      ? mapLocationToLocationDomain(table.locations)
      : undefined,
    monthlyRent: table.monthly_rent,
    description: table.description,
    bedrooms: table.bedrooms,
    bathrooms: table.bathrooms,
    furnishedStatus: table.furnished_status as FurnishedStatus | null,
    // `?? null` rather than a bare read: these columns are genuinely absent from some
    // fixtures and older rows, and the domain type is `number | null`, not `| undefined`.
    securityDepositMonths: table.security_deposit_months ?? null,
    minimumLeaseMonths: table.minimum_lease_months ?? null,
    condoId: table.condo_id ?? null,
    condo: table.condos
      ? {
          id: table.condos.id,
          name: table.condos.name,
          facilities: (table.condos.facilities ?? []) as Amenity[],
          verified: table.condos.verified,
        }
      : null,
    availableFrom: table.available_from ?? null,
    areaSqm: table.area_sqm ?? null,
    floorNumber: table.floor_number ?? null,
    totalFloors: table.total_floors ?? null,
    amenities: (table.amenities || []) as Amenity[],
    images: (table.property_images ?? [])
      .filter((image) => image.status === "uploaded")
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapImageToDomain),
    status: table.status as PropertyStatus,
    createdAt: table.created_at,
    updatedAt: table.updated_at,
  };
}

function mapDatabaseErrorToUserMessage(
  error: { code?: string; message?: string } | null
): string | null {
  if (!error) return null;

  const errorCode = error.code;
  const message = error.message || "";

  switch (errorCode) {
    case "23502": // NOT NULL constraint violation
      return "Required fields are missing. Please check all fields are filled.";
    case "23503": // FK constraint violation
      return "Invalid user profile. Please log in again.";
    case "23505": // Unique constraint violation
      return "This property already exists.";
    case "42501": // Insufficient privilege - raised by the save_property ownership guard
      return "You don't have permission to edit this property.";
    // The schema this code expects is not the schema the database has. Almost always
    // pending migrations, so say that rather than "try again later" — retrying cannot help.
    case "PGRST202": // PostgREST: function missing from the schema cache
    case "PGRST204": // PostgREST: column missing from the schema cache
    case "42883": // undefined_function
    case "42703": // undefined_column
    case "42P01": // undefined_table
      return "This database is missing a pending migration, so the listing could not be saved.";
    case "HV000": // FDW error
      return "Service temporarily unavailable. Please try again later.";
    default:
      if (message.includes("permission")) {
        return "You don't have permission to create a property listing.";
      }
      return null;
  }
}

/**
 * Logs the underlying database error before it is replaced by a user-facing message.
 *
 * Without this the real code and message are discarded, and an unmapped failure surfaces as
 * a bare "Failed to save property" with nothing in the logs to explain it.
 */
function logDatabaseError(
  operation: string,
  error: { code?: string; message?: string; details?: string } | null
): void {
  if (!error) return;
  console.error(
    `[properties] ${operation} failed:`,
    JSON.stringify({
      code: error.code,
      message: error.message,
      details: error.details,
    })
  );
}

/**
 * PostgREST `or()` takes a comma-separated filter string, so an unescaped search term can
 * inject extra filters.
 */
function escapeSearchTerm(term: string): string {
  return term.replace(/[,()*\\]/g, "");
}

// ---------------------------------------------------------------- writes (RPC)

export type SavePropertyRpcInput = {
  propertyId: string;
  isNew: boolean;
  property: Record<string, unknown>;
  location: Record<string, unknown> | null;
  images: Array<{
    id: string | null;
    storage_path: string | null;
    sort_order: number;
  }>;
  publish: boolean;
};

export type SavePropertyRpcResult = {
  property_id: string;
  location_id: string | null;
  status: PropertyStatus;
  deleted_paths: string[];
  pending: Array<{ id: string; storage_path: string; sort_order: number }>;
};

/**
 * Commits the property, its location and the image bookkeeping in one transaction. New
 * images land as "pending"; `finalizePropertyImagesRpc` promotes them once uploaded.
 */
export async function savePropertyRpc(
  input: SavePropertyRpcInput
): Promise<SavePropertyRpcResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("save_property", {
    p_property_id: input.propertyId,
    p_is_new: input.isNew,
    p_property: input.property as Json,
    p_location: input.location as Json,
    p_images: input.images as Json,
    p_publish: input.publish,
  });

  if (error) {
    logDatabaseError("save_property", error);
    const userMessage = mapDatabaseErrorToUserMessage(error);
    throw new AppError(
      "INTERNAL_ERROR",
      userMessage || "Failed to save property"
    );
  }

  return data as unknown as SavePropertyRpcResult;
}

export type FinalizeImagesRpcResult = {
  status: PropertyStatus;
  failed_paths: string[];
};

export async function finalizePropertyImagesRpc(
  propertyId: string,
  uploadedIds: string[],
  failedIds: string[],
  publish: boolean
): Promise<FinalizeImagesRpcResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("finalize_property_images", {
    p_property_id: propertyId,
    p_uploaded: uploadedIds,
    p_failed: failedIds,
    p_publish: publish,
  });

  if (error) {
    logDatabaseError("finalize_property_images", error);
    const userMessage = mapDatabaseErrorToUserMessage(error);
    throw new AppError(
      "INTERNAL_ERROR",
      userMessage || "Failed to finalize property images"
    );
  }

  return data as unknown as FinalizeImagesRpcResult;
}

/** Every storage path still referenced by a row, used to scope the orphan sweep. */
export async function listImagePathsForProperty(
  propertyId: string
): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("property_images")
    .select("storage_path")
    .eq("property_id", propertyId);

  if (error) {
    logDatabaseError("listImagePathsForProperty", error);
    throw new AppError("INTERNAL_ERROR", "Failed to load property images");
  }

  return (data ?? []).map((row) => row.storage_path);
}

export async function deletePropertyById(propertyId: string): Promise<void> {
  const supabase = await createClient();

  // property_images rows cascade on the FK.
  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId);

  if (error) {
    logDatabaseError("deletePropertyById", error);
    const userMessage = mapDatabaseErrorToUserMessage(error);
    throw new AppError(
      "INTERNAL_ERROR",
      userMessage || "Failed to delete property"
    );
  }
}

// ---------------------------------------------------------------- reads

export async function getPropertyById(id: string): Promise<Property | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    // PGRST116 is the expected "no rows" case; anything else is a real fault that would
    // otherwise masquerade as a missing property.
    if (error.code !== "PGRST116") {
      logDatabaseError("getPropertyById", error);
    }
    return null;
  }

  return data ? mapTableToProperty(data as unknown as PropertyRow) : null;
}

export async function getPropertiesList(
  profileId: string,
  filters?: {
    status?: PropertyStatus;
    propertyType?: PropertyType;
    search?: string;
  }
): Promise<Property[]> {
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.propertyType) {
    query = query.eq("property_type", filters.propertyType);
  }

  if (filters?.search) {
    const term = escapeSearchTerm(filters.search);
    query = query.or(`title.ilike.%${term}%,location.ilike.%${term}%`);
  }

  const { data, error } = await query;

  if (error) {
    logDatabaseError("getPropertiesList", error);
    throw new AppError("INTERNAL_ERROR", "Failed to fetch properties");
  }

  return data ? (data as unknown as PropertyRow[]).map(mapTableToProperty) : [];
}

/**
 * Active listings across every owner, for the tenant explore grid. Unlike
 * `getPropertiesList`, this is intentionally not scoped to a `profile_id` — RLS restricts it
 * to `status = 'active'` rows regardless (see the "authenticated_select_active_properties"
 * policy), so it's safe for any authenticated tenant to call.
 */
export async function getPublishedPropertiesList(filters?: {
  propertyType?: PropertyType;
  location?: string;
  minBedrooms?: number;
  minMonthlyRent?: number;
  maxMonthlyRent?: number;
  search?: string;
  /** "YYYY-MM-DD" — inclusive lower bound for `available_from`. */
  fromDate?: string;
  /** "YYYY-MM-DD" — inclusive upper bound for `available_from`. */
  toDate?: string;
}): Promise<Property[]> {
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (filters?.propertyType) {
    query = query.eq("property_type", filters.propertyType);
  }

  if (filters?.minBedrooms !== undefined) {
    query = query.gte("bedrooms", filters.minBedrooms);
  }

  if (filters?.minMonthlyRent !== undefined) {
    query = query.gte("monthly_rent", filters.minMonthlyRent);
  }

  if (filters?.maxMonthlyRent !== undefined) {
    query = query.lte("monthly_rent", filters.maxMonthlyRent);
  }

  if (filters?.location) {
    const term = escapeSearchTerm(filters.location);
    query = query.ilike("location", `%${term}%`);
  }

  if (filters?.search) {
    const term = escapeSearchTerm(filters.search);
    query = query.or(`title.ilike.%${term}%,location.ilike.%${term}%`);
  }

  if (filters?.fromDate) {
    query = query.gte("available_from", filters.fromDate);
  }

  if (filters?.toDate) {
    query = query.lte("available_from", filters.toDate);
  }

  const { data, error } = await query;

  if (error) {
    logDatabaseError("getPublishedPropertiesList", error);
    throw new AppError("INTERNAL_ERROR", "Failed to fetch properties");
  }

  return data ? (data as unknown as PropertyRow[]).map(mapTableToProperty) : [];
}

/**
 * Fetches properties by id, in any order, for the tenant "Saved" grid. RLS still restricts
 * the result to `status = 'active'` rows (the same policy `getPublishedPropertiesList` relies
 * on), so a favorite whose property has since gone inactive simply drops out of the result.
 */
export async function getPropertiesByIds(ids: string[]): Promise<Property[]> {
  if (ids.length === 0) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .in("id", ids)
    .eq("status", "active");

  if (error) {
    logDatabaseError("getPropertiesByIds", error);
    throw new AppError("INTERNAL_ERROR", "Failed to fetch properties");
  }

  return data ? (data as unknown as PropertyRow[]).map(mapTableToProperty) : [];
}

export async function getPropertiesCountByStatus(profileId: string): Promise<{
  all: number;
  active: number;
  draft: number;
  review: number;
  rented: number;
}> {
  const supabase = await createClient();

  const countFor = async (status?: PropertyStatus) => {
    let query = supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", profileId);

    if (status) {
      query = query.eq("status", status);
    }

    const { count } = await query;
    return count ?? 0;
  };

  const [all, active, draft, review, rented] = await Promise.all([
    countFor(),
    countFor("active"),
    countFor("draft"),
    countFor("review"),
    countFor("rented"),
  ]);

  return { all, active, draft, review, rented };
}

export { mapTableToProperty, mapDatabaseErrorToUserMessage, escapeSearchTerm };
