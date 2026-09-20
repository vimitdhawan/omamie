import { createClient } from "@/lib/supabase/server";
import type { Favorite, FavoriteWithProperty } from "./types";
import { AppError } from "@/lib/errors";

interface DatabaseFavorite {
  id: string;
  tenant_id: string;
  property_id: string;
  created_at: string;
}

function mapDatabaseFavorite(row: DatabaseFavorite): Favorite {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    propertyId: row.property_id,
    createdAt: row.created_at,
  };
}

export async function listFavoritesByTenantId(
  tenantId: string
): Promise<FavoriteWithProperty[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("property_favorites")
    .select(
      `
      *,
      property:properties(id, title, location, monthly_rent)
    `
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch favorites");
  }

  type Row = DatabaseFavorite & {
    property: {
      id: string;
      title: string;
      location: string | null;
      monthly_rent: number | null;
    } | null;
  };

  return ((data as Row[] | null) || [])
    .filter((row) => row.property !== null)
    .map((row) => ({
      ...mapDatabaseFavorite(row),
      property: {
        id: row.property!.id,
        title: row.property!.title,
        location: row.property!.location,
        monthlyRent: row.property!.monthly_rent,
      },
    }));
}

export async function listFavoritedPropertyIds(
  tenantId: string
): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("property_favorites")
    .select("property_id")
    .eq("tenant_id", tenantId);

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch favorites");
  }

  return (data || []).map((row) => row.property_id);
}

export async function isFavorited(
  tenantId: string,
  propertyId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("property_favorites")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to check favorite status");
  }

  return data !== null;
}

export async function addFavorite(
  tenantId: string,
  propertyId: string
): Promise<Favorite> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("property_favorites")
    .insert({ tenant_id: tenantId, property_id: propertyId })
    .select()
    .single();

  if (error) {
    // Unique violation means it's already favorited — treat as idempotent success.
    if (error.code === "23505") {
      const existing = await supabase
        .from("property_favorites")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("property_id", propertyId)
        .single();

      if (existing.data) {
        return mapDatabaseFavorite(existing.data as DatabaseFavorite);
      }
    }
    throw new AppError("INTERNAL_ERROR", "Failed to add favorite");
  }

  return mapDatabaseFavorite(data as DatabaseFavorite);
}

export async function removeFavorite(
  tenantId: string,
  propertyId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("property_favorites")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("property_id", propertyId);

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to remove favorite");
  }
}
