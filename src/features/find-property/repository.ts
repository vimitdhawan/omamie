import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/lib/supabase/types";
import type {
  PropertyFindRequest,
  CreatePropertyFindRequestInput,
  PropertyType,
  Bedrooms,
  Bathrooms,
  Furnishing,
} from "./types";
import { AppError } from "@/lib/errors";

// Repository types (database table models)
export type PropertyFindRequestTable = Tables<"property_find_requests">;
export type PropertyFindRequestInsertTable =
  TablesInsert<"property_find_requests">;

/**
 * Repository layer for find-property requests
 * Direct database operations only - mapping between domain and table models
 */

function mapInputToInsert(
  input: CreatePropertyFindRequestInput
): PropertyFindRequestInsertTable {
  return {
    profile_id: input.profileId,
    property_type: input.propertyType,
    preferred_location: input.preferredLocation,
    monthly_budget: input.monthlyBudget,
    move_in_date: input.moveInDate,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    min_size_sqm: input.minSizeSqm ?? null,
    furnishing: input.furnishing,
  };
}

function mapTableToPropertyFindRequest(
  table: PropertyFindRequestTable
): PropertyFindRequest {
  return {
    id: table.id,
    profileId: table.profile_id,
    propertyType: table.property_type as PropertyType,
    preferredLocation: table.preferred_location,
    monthlyBudget: table.monthly_budget,
    moveInDate: table.move_in_date,
    bedrooms: table.bedrooms as Bedrooms,
    bathrooms: table.bathrooms as Bathrooms,
    minSizeSqm: table.min_size_sqm,
    furnishing: table.furnishing as Furnishing,
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
      return "This request already exists.";
    case "42P01": // Table doesn't exist
      return "Service temporarily unavailable. Please try again later.";
    case "HV000": // FDW error
      return "Service temporarily unavailable. Please try again later.";
    default:
      if (message.includes("permission")) {
        return "You don't have permission to submit this request.";
      }
      return null;
  }
}

/**
 * Create a new property find request in the database
 */
export async function createFindPropertyRequest(
  input: CreatePropertyFindRequestInput
): Promise<PropertyFindRequest> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("property_find_requests")
    .insert(mapInputToInsert(input))
    .select()
    .single();

  if (error) {
    const userMessage = mapDatabaseErrorToUserMessage(error);
    throw new AppError(
      "INTERNAL_ERROR",
      userMessage || "Failed to submit property find request"
    );
  }

  return mapTableToPropertyFindRequest(data as PropertyFindRequestTable);
}

export { mapInputToInsert, mapTableToPropertyFindRequest };
