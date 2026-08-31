import { createClient } from "@/lib/supabase/server";
import type {
  DashboardMetrics,
  DashboardOverview,
  PendingRequest,
  UpcomingViewing,
  RecentActivity,
} from "./types";

export async function getDashboardMetrics(
  profileId: string
): Promise<DashboardMetrics> {
  const supabase = await createClient();

  // Get total properties count
  const { count: totalProperties } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId);

  // Get active listings count
  const { count: activeListings } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("status", "active");

  // For now, return static data for metrics we'll implement later
  return {
    activeListings: activeListings ?? 0,
    activeListingsChange: 0,
    pendingRequests: 0,
    pendingRequestsUrgent: 0,
    upcomingViewings: 0,
    nextViewing: null,
    totalProperties: totalProperties ?? 0,
    totalPropertiesActive: activeListings ?? 0,
  };
}

export async function getDashboardOverview(
  _profileId: string
): Promise<DashboardOverview> {
  // For now, return placeholder data
  // Will be calculated from leases table once implemented
  return {
    occupancyRate: 0,
    monthlyRevenue: 0,
  };
}

export async function getPendingRequests(
  _profileId: string
): Promise<PendingRequest[]> {
  // Placeholder - will query viewing_requests and maintenance_requests tables
  return [];
}

export async function getUpcomingViewings(
  _profileId: string
): Promise<UpcomingViewing[]> {
  // Placeholder - will query viewing_requests table
  return [];
}

export async function getRecentActivity(
  _profileId: string
): Promise<RecentActivity[]> {
  // Placeholder - will query activity log or aggregate from multiple tables
  return [];
}
