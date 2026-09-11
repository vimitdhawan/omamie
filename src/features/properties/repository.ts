import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/types";
import type {
  Property,
  BasicDetailsInput,
  AmenitiesInput,
  PropertyType,
  FurnishedStatus,
  PropertyStatus,
  Amenity,
  PropertyNextAction,
} from "./types";
import { AppError } from "@/lib/errors";

// Repository types (database table models)
export type PropertyTable = Tables<"properties">;
export type PropertyInsertTable = TablesInsert<"properties">;
export type PropertyUpdateTable = TablesUpdate<"properties">;

/**
 * Repository layer for properties
 * Direct database operations only - mapping between domain and table models
 */

// Mapping Functions
function mapBasicDetailsToInsert(
  data: BasicDetailsInput,
  profileId: string
): PropertyInsertTable {
  return {
    profile_id: profileId,
    property_type: data.propertyType,
    title: data.title,
    location: data.location,
    monthly_rent: data.monthlyRent,
    description: data.description ?? null,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    furnished_status: "unfurnished",
    amenities: [],
    status: "pending",
    next_action: "amenities",
  };
}

function mapAmenitiesDataToUpdate(
  data: AmenitiesInput,
  nextAction: string
): Partial<PropertyUpdateTable> {
  return {
    furnished_status: data.furnishedStatus,
    amenities: data.amenities,
    next_action: nextAction,
    updated_at: new Date().toISOString(),
  };
}

function mapTableToProperty(table: PropertyTable): Property {
  return {
    id: table.id,
    profileId: table.profile_id,
    propertyType: table.property_type as PropertyType,
    title: table.title,
    location: table.location,
    monthlyRent: table.monthly_rent,
    description: table.description,
    bedrooms: table.bedrooms,
    bathrooms: table.bathrooms,
    furnishedStatus: table.furnished_status as FurnishedStatus,
    amenities: (table.amenities || []) as Amenity[],
    status: table.status as PropertyStatus,
    nextAction: table.next_action as PropertyNextAction,
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
    case "42P01": // Table doesn't exist
      return "Service temporarily unavailable. Please try again later.";
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
 * Create a new property listing in the database
 */
export async function createProperty(
  property: PropertyInsertTable
): Promise<Property> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .insert(property)
    .select()
    .single();

  if (error) {
    const userMessage = mapDatabaseErrorToUserMessage(error);
    throw new AppError(
      "INTERNAL_ERROR",
      userMessage || "Failed to create property listing"
    );
  }

  return mapTableToProperty(data as PropertyTable);
}

/**
 * Get a property by ID
 */
export async function getPropertyById(id: string): Promise<Property | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return mapTableToProperty(data as PropertyTable);
}

/**
 * Get all properties (for future use)
 */
export async function getAllProperties(): Promise<Property[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data as PropertyTable[]).map(mapTableToProperty);
}

/**
 * Update property with step data
 */
export async function updateProperty(
  propertyId: string,
  stepData: Partial<PropertyUpdateTable>
): Promise<Property> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .update({
      ...stepData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", propertyId)
    .select()
    .single();

  if (error) {
    const userMessage = mapDatabaseErrorToUserMessage(error);
    throw new AppError(
      "INTERNAL_ERROR",
      userMessage || "Failed to update property"
    );
  }

  return mapTableToProperty(data as PropertyTable);
}

// Backward compatibility alias
export const updatePropertyStep = updateProperty;

/**
 * Complete property submission - change status from pending to review
 * Property will be reviewed by admin before activation
 */
export async function completePropertySubmission(
  propertyId: string
): Promise<Property> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .update({
      status: "review",
      next_action: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", propertyId)
    .select()
    .single();

  if (error) {
    const userMessage = mapDatabaseErrorToUserMessage(error);
    throw new AppError(
      "INTERNAL_ERROR",
      userMessage || "Failed to complete property submission"
    );
  }

  return mapTableToProperty(data as PropertyTable);
}

/**
 * Get pending property listing for a user
 * Returns first incomplete property (status = "pending")
 */
export async function getPendingListing(
  profileId: string
): Promise<Property | null> {
  const supabase = await createClient();

  const { data, error } = (await supabase
    .from("properties")
    .select("*")
    .eq("profile_id", profileId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()) as {
    data: PropertyTable | null;
    error: { code?: string; message?: string } | null;
  };

  if (error) {
    return null;
  }

  return data ? mapTableToProperty(data) : null;
}

/**
 * Get all properties for a user with optional filtering
 */
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
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.propertyType) {
    query = query.eq("property_type", filters.propertyType);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,location.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch properties");
  }

  return data ? data.map(mapTableToProperty) : [];
}

/**
 * Get properties count by status
 */
export async function getPropertiesCountByStatus(profileId: string): Promise<{
  all: number;
  active: number;
  pending: number;
  draft: number;
  rented: number;
}> {
  const supabase = await createClient();

  const { count: all } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId);

  const { count: active } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("status", "active");

  const { count: pending } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("status", "pending");

  const { count: draft } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .in("next_action", ["basic_details", "amenities", "review"]);

  const { count: rented } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("status", "rented");

  return {
    all: all ?? 0,
    active: active ?? 0,
    pending: pending ?? 0,
    draft: draft ?? 0,
    rented: rented ?? 0,
  };
}

export { mapBasicDetailsToInsert, mapAmenitiesDataToUpdate };
