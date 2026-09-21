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

  // TODO: replace with real viewing_requests query once the table exists
  const pendingRequestsCount = 3;
  const nextViewing = {
    requestedDate: "2026-09-15",
    requestedTimeStart: "10:00",
  };

  return {
    activeListings: activeListings ?? 0,
    activeListingsChange: 0,
    pendingRequests: pendingRequestsCount,
    pendingRequestsUrgent: 0, // TODO: Calculate urgent requests (e.g., within 24 hours)
    upcomingViewings: 1,
    nextViewing: `${nextViewing.requestedDate} ${nextViewing.requestedTimeStart}`,
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
  // TODO: replace with real viewing_requests query once the table exists
  return [
    {
      id: "1",
      type: "viewing",
      title: "Viewing Request: Modern Downtown Apartment",
      requester: "John Smith",
      date: "2026-09-15",
      time: "10:00",
      createdAt: "2026-09-01T08:00:00Z",
    },
    {
      id: "2",
      type: "viewing",
      title: "Viewing Request: Luxury Penthouse",
      requester: "Sarah Johnson",
      date: "2026-09-16",
      time: "14:30",
      createdAt: "2026-09-01T09:15:00Z",
    },
  ];
}

export async function getUpcomingViewings(
  _profileId: string
): Promise<UpcomingViewing[]> {
  // TODO: replace with real viewing_requests query once the table exists
  return [
    {
      id: "1",
      propertyTitle: "Modern Downtown Apartment",
      requesterName: "John Smith",
      date: "2026-09-15",
      time: "10:00 - 10:30",
    },
    {
      id: "2",
      propertyTitle: "Luxury Penthouse",
      requesterName: "Sarah Johnson",
      date: "2026-09-16",
      time: "14:30 - 15:00",
    },
  ];
}

export async function getRecentActivity(
  _profileId: string
): Promise<RecentActivity[]> {
  // Placeholder - will query activity log or aggregate from multiple tables
  return [];
}
