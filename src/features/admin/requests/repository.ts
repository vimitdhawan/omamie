import { createServiceRoleClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/errors";
import type { MatchStatus } from "@/features/property-matches/types";
import type { AdminMatchSummary, AdminMatchFilter } from "./types";

/**
 * Admin reads every tenant's matching request regardless of owner, crossing the
 * `property_owner_id = auth.uid()` RLS boundary on property_matches, so this repository
 * uses the service-role client — the same pattern already used for contact_messages.
 * Callers must go through service.ts's `requireAdmin()` first; nothing here re-checks the
 * caller's role.
 */

type MatchWithPropertyAndTenantRow = {
  id: string;
  status: string;
  created_at: string;
  property_id: string;
  tenant_id: string;
  properties: { title: string; location: string | null } | null;
  tenant: { full_name: string | null; email: string } | null;
};

export async function listAllMatches(
  filters?: AdminMatchFilter
): Promise<AdminMatchSummary[]> {
  const supabase = createServiceRoleClient();

  let query = supabase
    .from("property_matches")
    .select(
      "id, status, created_at, property_id, tenant_id, properties(title, location), tenant:profiles!property_matches_tenant_id_fkey(full_name, email)"
    )
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch matching requests");
  }

  return (
    (data as unknown as MatchWithPropertyAndTenantRow[] | null) ?? []
  ).map((row) => ({
    id: row.id,
    status: row.status as MatchStatus,
    createdAt: row.created_at,
    propertyId: row.property_id,
    propertyTitle: row.properties?.title ?? "Untitled property",
    propertyLocation: row.properties?.location ?? null,
    tenantId: row.tenant_id,
    tenantName: row.tenant?.full_name ?? null,
    tenantEmail: row.tenant?.email ?? null,
  }));
}
