import { createServiceRoleClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/errors";
import type { UserRole } from "@/features/auth/schema";
import type { AdminUserSummary, AdminUserFilter } from "./types";

/**
 * Admin reads every profile regardless of owner, crossing the `auth.uid() = id` RLS
 * boundary on profiles, so this repository uses the service-role client — the same pattern
 * already used for contact_messages. Callers must go through service.ts's `requireAdmin()`
 * first; nothing here re-checks the caller's role.
 */

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  created_at: string;
};

/** Escapes PostgREST `or()` filter delimiters so a search term can't inject extra filters. */
function escapeSearchTerm(term: string): string {
  return term.replace(/[,()*\\]/g, "");
}

export async function listAllUsers(
  filters?: AdminUserFilter
): Promise<AdminUserSummary[]> {
  const supabase = createServiceRoleClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  if (filters?.role) {
    query = query.eq("role", filters.role);
  }

  if (filters?.search) {
    const term = escapeSearchTerm(filters.search);
    query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch users");
  }

  const rows = (data as unknown as ProfileRow[] | null) ?? [];

  // A per-owner property count column doesn't exist on profiles, so it's derived here with
  // one grouped count query rather than N+1 per-row queries.
  const { data: countRows, error: countError } = await supabase
    .from("properties")
    .select("profile_id");

  if (countError) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch property counts");
  }

  const countByProfile = new Map<string, number>();
  for (const row of (countRows as unknown as { profile_id: string }[]) ?? []) {
    countByProfile.set(
      row.profile_id,
      (countByProfile.get(row.profile_id) ?? 0) + 1
    );
  }

  return rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role as UserRole,
    createdAt: row.created_at,
    propertyCount: countByProfile.get(row.id) ?? 0,
  }));
}
