import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type {
  PropertyMatch,
  PropertyMatchWithProperty,
  CreateMatchInput,
  MatchCounts,
  MatchFilter,
  InitiatedBy,
  MatchStatus,
  LeaseDecision,
} from "./types";
import { AppError } from "@/lib/errors";

interface DatabasePropertyMatch {
  id: string;
  property_id: string;
  tenant_id: string;
  property_owner_id: string;
  initiated_by: string;
  status: string;
  notes: string | null;
  requested_move_in_date: string | null;
  requested_move_out_date: string | null;
  match_score: number | null;
  curated_at: string | null;
  lease_decision: string | null;
  lease_decision_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Statuses that represent tenant-visible-only suggestions, never surfaced to an owner. */
const OWNER_VISIBLE_STATUSES = ["interested", "approved", "rejected"];

function mapDatabaseMatch(row: DatabasePropertyMatch): PropertyMatch {
  return {
    id: row.id,
    propertyId: row.property_id as string,
    tenantId: row.tenant_id as string,
    propertyOwnerId: row.property_owner_id as string,
    initiatedBy: row.initiated_by as unknown as InitiatedBy,
    status: row.status as unknown as MatchStatus,
    notes: row.notes,
    requestedMoveInDate: row.requested_move_in_date ?? null,
    requestedMoveOutDate: row.requested_move_out_date ?? null,
    matchScore: row.match_score ?? null,
    curatedAt: row.curated_at ?? null,
    leaseDecision: (row.lease_decision as LeaseDecision | null) ?? null,
    leaseDecisionAt: row.lease_decision_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getMatchesByProfileId(
  profileId: string,
  filters?: MatchFilter
): Promise<PropertyMatchWithProperty[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = (supabase as any)
    .from("property_matches")
    .select(
      `
      *,
      property:properties(id, title, location, monthly_rent)
    `
    )
    .eq("property_owner_id", profileId)
    // Curated/dismissed rows are tenant-only suggestions the tenant hasn't acted on.
    .in("status", OWNER_VISIBLE_STATUSES)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.propertyId) {
    query = query.eq("property_id", filters.propertyId);
  }

  if (filters?.search) {
    query = query.or(
      `property.title.ilike.%${filters.search}%,property.location.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch property matches");
  }

  return (data || []).map(
    (
      row: DatabasePropertyMatch & {
        property: {
          id: string;
          title: string;
          location: string;
          monthly_rent: number;
        };
      }
    ) => ({
      ...mapDatabaseMatch(row),
      property: {
        id: row.property.id,
        title: row.property.title,
        location: row.property.location,
        monthlyRent: row.property.monthly_rent,
      },
    })
  );
}

export async function getMatchesByTenantId(
  tenantId: string
): Promise<PropertyMatchWithProperty[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = (supabase as any)
    .from("property_matches")
    .select(
      `
      *,
      property:properties(id, title, location, monthly_rent)
    `
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch property matches");
  }

  return (data || [])
    .filter(
      (
        row: DatabasePropertyMatch & {
          property: {
            id: string;
            title: string;
            location: string;
            monthly_rent: number;
          } | null;
        }
      ) => row.property !== null
    )
    .map(
      (
        row: DatabasePropertyMatch & {
          property: {
            id: string;
            title: string;
            location: string;
            monthly_rent: number;
          };
        }
      ) => ({
        ...mapDatabaseMatch(row),
        property: {
          id: row.property.id,
          title: row.property.title,
          location: row.property.location,
          monthlyRent: row.property.monthly_rent,
        },
      })
    );
}

export async function getMatchById(
  matchId: string,
  profileId: string
): Promise<PropertyMatchWithProperty | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = (supabase as any)
    .from("property_matches")
    .select(
      `
      *,
      property:properties(id, title, location, monthly_rent)
    `
    )
    .eq("id", matchId)
    .eq("property_owner_id", profileId);

  const { data, error } = await query.single();

  if (error) {
    return null;
  }

  const match = data as DatabasePropertyMatch & {
    property: {
      id: string;
      title: string;
      location: string;
      monthly_rent: number;
    };
  };
  return {
    ...mapDatabaseMatch(match),
    property: {
      id: match.property.id,
      title: match.property.title,
      location: match.property.location,
      monthlyRent: match.property.monthly_rent,
    },
  };
}

/** Same shape as `getMatchById`, scoped to the tenant instead of the owner — the
 * permission gate for every tenant-initiated transition (express interest, dismiss,
 * lease decision). */
export async function getMatchByIdForTenant(
  matchId: string,
  tenantId: string
): Promise<PropertyMatchWithProperty | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = (supabase as any)
    .from("property_matches")
    .select(
      `
      *,
      property:properties(id, title, location, monthly_rent)
    `
    )
    .eq("id", matchId)
    .eq("tenant_id", tenantId);

  const { data, error } = await query.single();

  if (error) {
    return null;
  }

  const match = data as DatabasePropertyMatch & {
    property: {
      id: string;
      title: string;
      location: string;
      monthly_rent: number;
    };
  };
  return {
    ...mapDatabaseMatch(match),
    property: {
      id: match.property.id,
      title: match.property.title,
      location: match.property.location,
      monthlyRent: match.property.monthly_rent,
    },
  };
}

export async function getMatchCounts(profileId: string): Promise<MatchCounts> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = (supabase as any)
    .from("property_matches")
    .select(`id, status`)
    .eq("property_owner_id", profileId)
    .in("status", OWNER_VISIBLE_STATUSES);

  const { data: allMatches, error } = await query;

  if (error || !allMatches) {
    return { all: 0, interested: 0, approved: 0, rejected: 0 };
  }

  const matches = allMatches as Array<{ id: string; status: string }>;
  const counts = {
    all: matches.length,
    interested: matches.filter((m) => m.status === "interested").length,
    approved: matches.filter((m) => m.status === "approved").length,
    rejected: matches.filter((m) => m.status === "rejected").length,
  };

  return counts;
}

export async function getPendingMatchesCount(
  profileId: string
): Promise<number> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = (supabase as any)
    .from("property_matches")
    .select(`id, status`)
    .eq("property_owner_id", profileId)
    .eq("status", "interested");

  const { data, error } = await query;

  if (error || !data) {
    return 0;
  }

  return data.length;
}

/** The most recent "interested" matches for an owner's properties, with the tenant's name
 * attached, for the dashboard's Pending Requests list. */
export async function getRecentInterestedMatches(
  profileId: string,
  limit: number
): Promise<
  Array<{
    id: string;
    propertyTitle: string;
    tenantId: string;
    createdAt: string;
  }>
> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = (supabase as any)
    .from("property_matches")
    .select(
      `
      id,
      tenant_id,
      created_at,
      property:properties(title)
    `
    )
    .eq("property_owner_id", profileId)
    .eq("status", "interested")
    .order("created_at", { ascending: false })
    .limit(limit);

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return (
    data as Array<{
      id: string;
      tenant_id: string;
      created_at: string;
      property: { title: string } | null;
    }>
  ).map((row) => ({
    id: row.id,
    propertyTitle: row.property?.title ?? "Property",
    tenantId: row.tenant_id,
    createdAt: row.created_at,
  }));
}

/** The property IDs a tenant already has a match/interest on, for badge/button state in the explore grid. */
export async function getMatchedPropertyIdsByTenantId(
  tenantId: string
): Promise<string[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = (supabase as any)
    .from("property_matches")
    .select("property_id")
    .eq("tenant_id", tenantId);

  const { data, error } = await query;

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch property matches");
  }

  return (data || []).map((row: { property_id: string }) => row.property_id);
}

export async function createMatch(
  input: CreateMatchInput
): Promise<PropertyMatch> {
  // Use service role to bypass RLS for hardcoded tenant (no real auth session yet)
  const supabase = await createServiceRoleClient();

  // Fetch property to get owner_id
  const { data: property, error: propertyError } =
    await // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((supabase as any)
      .from("properties")
      .select("profile_id")
      .eq("id", input.propertyId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .single() as any);

  if (propertyError || !property) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch property");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = (supabase as any)
    .from("property_matches")
    .insert({
      property_id: input.propertyId,
      tenant_id: input.tenantId,
      property_owner_id: property.profile_id,
      notes: input.notes || null,
      requested_move_in_date: input.requestedMoveInDate || null,
      requested_move_out_date: input.requestedMoveOutDate || null,
      initiated_by: "tenant",
      status: "interested",
    })
    .select();

  const { data, error } = await query.single();

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to create match");
  }

  return mapDatabaseMatch(data as DatabasePropertyMatch);
}

/** Engine-curated suggestions. Runs under the tenant's own session (the tenant insert RLS
 * policy only checks `tenant_id = auth.uid()`, so no service-role bypass is needed here),
 * with `initiated_by: "system"` distinguishing these from tenant/owner-initiated rows. */
export async function insertCuratedMatches(
  rows: Array<{
    propertyId: string;
    tenantId: string;
    propertyOwnerId: string;
    matchScore: number;
  }>
): Promise<void> {
  if (rows.length === 0) return;

  const supabase = await createClient();
  const now = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("property_matches").insert(
    rows.map((row) => ({
      property_id: row.propertyId,
      tenant_id: row.tenantId,
      property_owner_id: row.propertyOwnerId,
      initiated_by: "system",
      status: "curated",
      match_score: row.matchScore,
      curated_at: now,
    }))
  );

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to save curated matches");
  }
}

export async function updateMatchStatus(
  matchId: string,
  newStatus: string,
  notes?: string
): Promise<PropertyMatch> {
  const supabase = await createClient();

  const update: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };
  // Only touch `notes` when the caller actually supplied one — an approve/reject with no
  // notes argument must not wipe out notes left by an earlier step. An explicit empty
  // string still normalizes to null, same as a cleared field always has in this table.
  if (notes !== undefined) {
    update.notes = notes || null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = (supabase as any)
    .from("property_matches")
    .update(update)
    .eq("id", matchId)
    .select();

  const { data, error } = await query.single();

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to update match status");
  }

  return mapDatabaseMatch(data as DatabasePropertyMatch);
}

/** Tenant-side status transition (curated -> interested/dismissed). There is no tenant
 * UPDATE RLS policy on `property_matches` — deliberately, so a tenant can never write
 * `approved`/`rejected` themselves — so this goes through the service-role client, with the
 * `tenant_id` predicate standing in for the RLS check that would otherwise gate it. The
 * caller (service.ts) is responsible for verifying the current status first. */
export async function updateMatchStatusForTenant(
  matchId: string,
  tenantId: string,
  newStatus: string
): Promise<PropertyMatch> {
  const supabase = await createServiceRoleClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = (supabase as any)
    .from("property_matches")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", matchId)
    .eq("tenant_id", tenantId)
    .select();

  const { data, error } = await query.single();

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to update match status");
  }

  return mapDatabaseMatch(data as DatabasePropertyMatch);
}

/** Records the tenant's final decision once a viewing is done. Same service-role +
 * `tenant_id` pattern as `updateMatchStatusForTenant`, for the same reason. */
export async function setLeaseDecision(
  matchId: string,
  tenantId: string,
  decision: string
): Promise<PropertyMatch> {
  const supabase = await createServiceRoleClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = (supabase as any)
    .from("property_matches")
    .update({
      lease_decision: decision,
      lease_decision_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId)
    .eq("tenant_id", tenantId)
    .select();

  const { data, error } = await query.single();

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to record lease decision");
  }

  return mapDatabaseMatch(data as DatabasePropertyMatch);
}
