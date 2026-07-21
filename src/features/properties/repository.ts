import { createClient } from "@/lib/supabase/server";
import type { Property, PropertyInsert } from "./types";

export async function createProperty(
  property: PropertyInsert
): Promise<{ data: Property | null; error: Error | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .insert(property)
    .select()
    .single();

  if (error) return { data: null, error: new Error(error.message) };
  return { data, error: null };
}

export async function getPropertyById(
  id: string
): Promise<{ data: Property | null; error: Error | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { data: null, error: new Error(error.message) };
  return { data, error: null };
}

export async function getPropertiesByOwner(
  ownerId: string
): Promise<{ data: Property[] | null; error: Error | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: new Error(error.message) };
  return { data, error: null };
}

export async function updateProperty(
  id: string,
  property: Partial<PropertyInsert>
): Promise<{ data: Property | null; error: Error | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .update(property)
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: new Error(error.message) };
  return { data, error: null };
}

export async function deleteProperty(
  id: string
): Promise<{ error: Error | null }> {
  const supabase = await createClient();

  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) return { error: new Error(error.message) };
  return { error: null };
}
