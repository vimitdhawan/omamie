import { createClient } from "@/lib/supabase/server";
import type { SavedProperty } from "./types";
import { AppError } from "@/lib/errors";

// Temporary type until types are regenerated after migration
type SavedPropertyTable = {
  id: string;
  profile_id: string;
  property_id: string;
  created_at: string;
};

/**
 * Repository layer for saved properties
 * Direct database operations only
 */

function mapTableToSavedProperty(table: SavedPropertyTable): SavedProperty {
  return {
    id: table.id,
    profileId: table.profile_id,
    propertyId: table.property_id,
    createdAt: table.created_at,
  };
}

/**
 * Save a property to user's favorites
 */
export async function saveProperty(
  profileId: string,
  propertyId: string
): Promise<SavedProperty> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saved_properties" as never)
    .insert({
      profile_id: profileId,
      property_id: propertyId,
    } as never)
    .select()
    .single();

  if (error) {
    // If unique constraint violation, property is already saved
    if (error.code === "23505") {
      throw new AppError("VALIDATION_ERROR", "Property is already saved");
    }
    throw new AppError("INTERNAL_ERROR", "Failed to save property");
  }

  return mapTableToSavedProperty(data as SavedPropertyTable);
}

/**
 * Remove a property from user's favorites
 */
export async function unsaveProperty(
  profileId: string,
  propertyId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = (await supabase
    .from("saved_properties" as never)
    .delete()
    .eq("profile_id", profileId)
    .eq("property_id", propertyId)) as never;

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to unsave property");
  }
}

/**
 * Get all saved properties for a user
 */
export async function getSavedPropertiesByUser(
  profileId: string
): Promise<SavedProperty[]> {
  const supabase = await createClient();

  const { data, error } = (await supabase
    .from("saved_properties" as never)
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })) as never;

  if (error) {
    return [];
  }

  return (data as SavedPropertyTable[]).map(mapTableToSavedProperty);
}

/**
 * Check if a property is saved by user
 */
export async function isPropertySaved(
  profileId: string,
  propertyId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = (await supabase
    .from("saved_properties" as never)
    .select("id")
    .eq("profile_id", profileId)
    .eq("property_id", propertyId)
    .single()) as never;

  return !error && data !== null;
}
