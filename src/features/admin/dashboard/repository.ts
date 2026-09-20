import { createServiceRoleClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/errors";
import type { AdminDashboardCounts } from "./types";

/**
 * The dashboard's counts span three domains (properties, matches, profiles) at once, so a
 * small dashboard-owned repository is appropriate here rather than reaching into another
 * domain's repository for a single count query.
 */
export async function getDashboardCounts(): Promise<AdminDashboardCounts> {
  const supabase = createServiceRoleClient();

  const countFor = async (
    table: "properties" | "profiles" | "property_matches",
    eq?: { column: string; value: string }
  ) => {
    let query = supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    if (eq) {
      query = query.eq(eq.column, eq.value);
    }
    const { count, error } = await query;
    if (error) {
      throw new AppError("INTERNAL_ERROR", `Failed to count ${table}`);
    }
    return count ?? 0;
  };

  const [pendingReview, activeListings, openRequests, activeUsers] =
    await Promise.all([
      countFor("properties", { column: "status", value: "review" }),
      countFor("properties", { column: "status", value: "active" }),
      countFor("property_matches", { column: "status", value: "interested" }),
      countFor("profiles"),
    ]);

  return { pendingReview, activeListings, openRequests, activeUsers };
}
