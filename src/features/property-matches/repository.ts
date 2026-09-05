import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type {
  PropertyMatch,
  PropertyMatchWithProperty,
  CreateMatchInput,
  MatchCounts,
  MatchFilter,
} from "./types";
import { AppError } from "@/lib/errors";

interface DatabasePropertyMatch {
  id: string;
  property_id: string;
  tenant_id: string;
  initiated_by: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapDatabaseMatch(row: DatabasePropertyMatch): PropertyMatch {
  return {
    id: row.id,
    propertyId: row.property_id,
    tenantId: row.tenant_id,
    initiatedBy: row.initiated_by,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getMatchesByProfileId(
  profileId: string,
  filters?: MatchFilter
): Promise<PropertyMatchWithProperty[]> {
  const supabase = await createClient();

  let query = supabase
    .from("property_matches")
    .select(
      `
      *,
      property:properties!inner(id, title, location, monthly_rent)
    `
    )
    .eq("property:properties.profile_id", profileId)
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

export async function getMatchById(
  matchId: string,
  profileId: string
): Promise<PropertyMatchWithProperty | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("property_matches")
    .select(
      `
      *,
      property:properties!inner(id, title, location, monthly_rent, profile_id)
    `
    )
    .eq("id", matchId)
    .eq("property.profile_id", profileId)
    .single();

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
  // Fetch all matches for the user's properties (RLS will filter automatically)
  const supabase = await createClient();

  const { data: allMatches, error } = await supabase
    .from("property_matches")
    .select(`id, status, property:properties!inner(profile_id)`)
    .eq("property.profile_id", profileId);

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

  const { data, error } = await supabase
    .from("property_matches")
    .select(`id, status, property:properties!inner(profile_id)`)
    .eq("property.profile_id", profileId)
    .eq("status", "interested");

  if (error || !data) {
    return 0;
  }

  return data.length;
}

export async function createMatch(
  input: CreateMatchInput
): Promise<PropertyMatch> {
  // Use service role to bypass RLS for hardcoded tenant (no real auth session yet)
  const supabase = await createServiceRoleClient();

  const { data, error } = await supabase
    .from("property_matches")
    .insert({
      property_id: input.propertyId,
      tenant_id: input.tenantId,
      notes: input.notes || null,
      initiated_by: "tenant",
      status: "interested",
    })
    .select()
    .single();

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

  const { data, error } = await supabase
    .from("property_matches")
    .update({
      status: newStatus,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId)
    .select()
    .single();

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to update match status");
  }

  return mapDatabaseMatch(data as DatabasePropertyMatch);
}
