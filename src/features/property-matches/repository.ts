import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type {
  PropertyMatch,
  PropertyMatchWithProperty,
  CreateMatchInput,
  MatchCounts,
  MatchFilter,
  InitiatedBy,
  MatchStatus,
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
  created_at: string;
  updated_at: string;
}

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

export async function getMatchCounts(profileId: string): Promise<MatchCounts> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = (supabase as any)
    .from("property_matches")
    .select(`id, status`)
    .eq("property_owner_id", profileId);

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

export async function updateMatchStatus(
  matchId: string,
  newStatus: string,
  notes?: string
): Promise<PropertyMatch> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = (supabase as any)
    .from("property_matches")
    .update({
      status: newStatus,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId)
    .select();

  const { data, error } = await query.single();

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to update match status");
  }

  return mapDatabaseMatch(data as DatabasePropertyMatch);
}
