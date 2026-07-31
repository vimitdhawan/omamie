import { createClient } from "@/lib/supabase/server";
import type { PropertyInsert, Property } from "./types";

/**
 * Repository layer for properties
 * Direct database operations only - no business logic
 */

/**
 * Create a new property listing in the database
 */
export async function createProperty(
  property: PropertyInsert
): Promise<{ property: Property | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .insert(property)
    .select()
    .single();

  if (error) {
    return { property: null, error: error.message };
  }

  return { property: data, error: null };
}

/**
 * Get a property by ID
 */
export async function getPropertyById(
  id: string
): Promise<{ property: Property | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { property: null, error: error.message };
  }

  return { property: data, error: null };
}

/**
 * Get all properties (for future use)
 */
export async function getAllProperties(): Promise<{
  properties: Property[];
  error: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { properties: [], error: error.message };
  }

  return { properties: data, error: null };
}
