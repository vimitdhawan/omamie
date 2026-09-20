import { createServiceRoleClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/errors";
import {
  PROPERTY_SELECT,
  mapTableToProperty,
  type PropertyTable,
  type LocationTable,
  type PropertyImageTable,
  type CondoTable,
} from "@/features/properties/repository";
import type { PropertyStatus, PropertyType } from "@/features/properties/types";
import type {
  AdminPropertySummary,
  AdminPropertyFilter,
  AdminPropertyDetail,
} from "./types";

/**
 * Admin property reads/writes cross every owner's RLS boundary (properties scopes all
 * operations to `auth.uid()`), so this repository uses the service-role client rather than
 * the per-request client — the same pattern already used for contact_messages. Callers must
 * go through service.ts's `requireAdmin()` first; nothing here re-checks the caller's role.
 */

type PropertyWithOwnerRow = {
  id: string;
  title: string;
  location: string | null;
  property_type: string | null;
  monthly_rent: number | null;
  status: string;
  created_at: string;
  profile_id: string;
  profiles: { full_name: string | null; email: string } | null;
};

function mapPropertyRow(row: PropertyWithOwnerRow): AdminPropertySummary {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    propertyType: row.property_type as PropertyType | null,
    monthlyRent: row.monthly_rent,
    status: row.status as PropertyStatus,
    createdAt: row.created_at,
    ownerId: row.profile_id,
    ownerName: row.profiles?.full_name ?? null,
    ownerEmail: row.profiles?.email ?? null,
  };
}

const PROPERTY_WITH_OWNER_SELECT =
  "id, title, location, property_type, monthly_rent, status, created_at, profile_id, profiles(full_name, email)";

/** Escapes PostgREST `or()` filter delimiters so a search term can't inject extra filters. */
function escapeSearchTerm(term: string): string {
  return term.replace(/[,()*\\]/g, "");
}

export async function findPropertiesForReview(): Promise<
  AdminPropertySummary[]
> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_WITH_OWNER_SELECT)
    .eq("status", "review")
    .order("created_at", { ascending: true });

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch review queue");
  }

  return ((data as unknown as PropertyWithOwnerRow[] | null) ?? []).map(
    mapPropertyRow
  );
}

export async function listAllProperties(
  filters?: AdminPropertyFilter
): Promise<AdminPropertySummary[]> {
  const supabase = createServiceRoleClient();

  let query = supabase
    .from("properties")
    .select(PROPERTY_WITH_OWNER_SELECT)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.search) {
    const term = escapeSearchTerm(filters.search);
    query = query.or(`title.ilike.%${term}%,location.ilike.%${term}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch properties");
  }

  return ((data as unknown as PropertyWithOwnerRow[] | null) ?? []).map(
    mapPropertyRow
  );
}

type PropertyDetailRow = PropertyTable & {
  locations?: LocationTable | null;
  property_images?: PropertyImageTable[] | null;
  condos?: CondoTable | null;
  profiles?: { full_name: string | null; email: string } | null;
};

/**
 * Full listing detail for admin's read-only property view. Crosses the same RLS boundary
 * as the rest of this repository, so it uses the service-role client, but reuses the exact
 * select and row→domain mapping the owner-facing detail page relies on
 * (`@/features/properties/repository`) rather than re-deriving the shape here.
 */
export async function getPropertyById(
  id: string
): Promise<AdminPropertyDetail | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("properties")
    .select(`${PROPERTY_SELECT}, profiles(full_name, email)`)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      throw new AppError("INTERNAL_ERROR", "Failed to fetch property");
    }
    return null;
  }

  if (!data) return null;

  const row = data as unknown as PropertyDetailRow;
  return {
    ...mapTableToProperty(row),
    ownerName: row.profiles?.full_name ?? null,
    ownerEmail: row.profiles?.email ?? null,
  };
}

export async function updatePropertyStatus(
  propertyId: string,
  status: Extract<PropertyStatus, "active" | "inactive">
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("properties")
    .update({ status })
    .eq("id", propertyId)
    .eq("status", "review");

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to update property status");
  }
}
