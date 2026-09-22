import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/errors";
import type { Viewing, ViewingStatus } from "./types";

interface DatabaseViewing {
  id: string;
  match_id: string;
  status: string;
  scheduled_at: string | null;
  host_name: string | null;
  access_notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapDatabaseViewing(row: DatabaseViewing): Viewing {
  return {
    id: row.id,
    matchId: row.match_id,
    status: row.status as ViewingStatus,
    scheduledAt: row.scheduled_at,
    hostName: row.host_name,
    accessNotes: row.access_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Every viewing row for one match — proposed (`requested`), the one the owner confirmed,
 * and any cancelled ones from an earlier round of proposals. Read under the caller's own
 * session; RLS scopes it to a viewing on a match the caller (tenant or owner) belongs to. */
export async function getViewingsByMatchId(
  matchId: string
): Promise<Viewing[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("viewings")
    .select("*")
    .eq("match_id", matchId)
    .order("scheduled_at", { ascending: true });

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch viewings");
  }

  return ((data ?? []) as DatabaseViewing[]).map(mapDatabaseViewing);
}

/** Same as `getViewingsByMatchId`, batched for a tenant's or owner's whole match list. */
export async function getViewingsByMatchIds(
  matchIds: string[]
): Promise<Record<string, Viewing[]>> {
  if (matchIds.length === 0) return {};

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("viewings")
    .select("*")
    .in("match_id", matchIds)
    .order("scheduled_at", { ascending: true });

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch viewings");
  }

  const byMatch: Record<string, Viewing[]> = {};
  for (const row of (data ?? []) as DatabaseViewing[]) {
    const viewing = mapDatabaseViewing(row);
    (byMatch[viewing.matchId] ??= []).push(viewing);
  }
  return byMatch;
}

/**
 * Replaces a tenant's proposed viewing times for a match with a fresh set, all
 * `status: "requested"`. `viewings` grants no INSERT/UPDATE RLS to `authenticated`
 * (mirroring `leases`), so this always goes through the service-role client — the caller
 * (service.ts) is responsible for verifying the match belongs to the tenant first.
 */
export async function replaceProposedSlots(
  matchId: string,
  slots: string[]
): Promise<Viewing[]> {
  const supabase = createServiceRoleClient();

  // A fresh proposal replaces any earlier one that was never confirmed — an owner should
  // only ever see the tenant's latest set of times, not every round they've tried.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: deleteError } = await (supabase as any)
    .from("viewings")
    .delete()
    .eq("match_id", matchId)
    .eq("status", "requested");

  if (deleteError) {
    throw new AppError("INTERNAL_ERROR", "Failed to update proposed times");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("viewings")
    .insert(
      slots.map((scheduledAt) => ({
        match_id: matchId,
        status: "requested",
        scheduled_at: scheduledAt,
      }))
    )
    .select();

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to save proposed times");
  }

  return ((data ?? []) as DatabaseViewing[]).map(mapDatabaseViewing);
}

/** Owner picks one of the tenant's proposed times: that row becomes `confirmed`, and every
 * other still-`requested` row for the same match is cancelled. Service-role write, same
 * reasoning as `replaceProposedSlots`. */
export async function confirmSlot(
  matchId: string,
  viewingId: string
): Promise<Viewing> {
  const supabase = createServiceRoleClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: cancelError } = await (supabase as any)
    .from("viewings")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("match_id", matchId)
    .eq("status", "requested")
    .neq("id", viewingId);

  if (cancelError) {
    throw new AppError("INTERNAL_ERROR", "Failed to confirm viewing");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("viewings")
    .update({ status: "confirmed", updated_at: new Date().toISOString() })
    .eq("id", viewingId)
    .eq("match_id", matchId)
    .select()
    .single();

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to confirm viewing");
  }

  return mapDatabaseViewing(data as DatabaseViewing);
}
