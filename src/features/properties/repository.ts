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
  PropertySearchFilters,
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
 * Search active properties with filters (for tenant browsing)
 * Only returns properties with status = 'active'
 */
export async function searchActiveProperties(
  filters: PropertySearchFilters
): Promise<Property[]> {
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // Apply location filter (partial match)
  if (filters.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  // Apply property type filter
  if (filters.propertyTypes && filters.propertyTypes.length > 0) {
    query = query.in("property_type", filters.propertyTypes);
  }

  // Apply rent range filters
  if (filters.minRent !== undefined) {
    query = query.gte("monthly_rent", filters.minRent);
  }
  if (filters.maxRent !== undefined) {
    query = query.lte("monthly_rent", filters.maxRent);
  }

  // Apply bedrooms filter
  if (filters.bedrooms !== undefined) {
    query = query.gte("bedrooms", filters.bedrooms);
  }

  // Apply furnished status filter
  if (filters.furnishedStatus && filters.furnishedStatus.length > 0) {
    query = query.in("furnished_status", filters.furnishedStatus);
  }

  // Apply amenities filter (property must have all requested amenities)
  if (filters.amenities && filters.amenities.length > 0) {
    query = query.contains("amenities", filters.amenities);
  }

  const { data, error } = await query;

  if (error) {
    return [];
  }

  return (data as PropertyTable[]).map(mapTableToProperty);
}

/**
 * Get a single active property by ID (for public viewing by tenants)
 */
export async function getActivePropertyById(
  id: string
): Promise<Property | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error) {
    return null;
  }

  return mapTableToProperty(data as PropertyTable);
}

export { mapBasicDetailsToInsert, mapAmenitiesDataToUpdate };
