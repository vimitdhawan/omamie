import { createClient } from "@/lib/supabase/server";
import type {
  DashboardMetrics,
  DashboardOverview,
  PendingRequest,
  UpcomingViewing,
  RecentActivity,
} from "./types";
import {
  getPendingRequestsCount,
  getUpcomingViewings as getViewingRequestsUpcoming,
} from "@/features/viewing-requests/repository";

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

  // Get pending viewing requests count
  const pendingRequestsCount = await getPendingRequestsCount(profileId);

  // Get upcoming viewings
  const upcomingViewings = await getViewingRequestsUpcoming(profileId, 1);
  const nextViewing = upcomingViewings.length > 0 ? upcomingViewings[0] : null;

  return {
    activeListings: activeListings ?? 0,
    activeListingsChange: 0,
    pendingRequests: pendingRequestsCount,
    pendingRequestsUrgent: 0, // TODO: Calculate urgent requests (e.g., within 24 hours)
    upcomingViewings: upcomingViewings.length,
    nextViewing: nextViewing
      ? `${nextViewing.requestedDate} ${nextViewing.requestedTimeStart}`
      : null,
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
  profileId: string
): Promise<PendingRequest[]> {
  const supabase = await createClient();

  // Get pending viewing requests
  const { data: viewingRequests, error } = await supabase
    .from("viewing_requests")
    .select(
      `
      id,
      requester_name,
      requested_date,
      requested_time_start,
      created_at,
      property:properties!inner (
        title,
        profile_id
      )
    `
    )
    .eq("property.profile_id", profileId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  return (viewingRequests || []).map((request) => ({
    id: request.id,
    type: "viewing",
    title: `Viewing Request: ${request.property.title}`,
    requester: request.requester_name,
    date: request.requested_date,
    time: request.requested_time_start,
    createdAt: request.created_at,
  }));
}

export async function getUpcomingViewings(
  profileId: string
): Promise<UpcomingViewing[]> {
  const viewings = await getViewingRequestsUpcoming(profileId, 5);

  return viewings.map((viewing) => ({
    id: viewing.id,
    propertyTitle: viewing.propertyTitle,
    requesterName: viewing.requesterName,
    date: viewing.requestedDate,
    time: `${viewing.requestedTimeStart} - ${viewing.requestedTimeEnd}`,
  }));
}

export async function getRecentActivity(
  _profileId: string
): Promise<RecentActivity[]> {
  // Placeholder - will query activity log or aggregate from multiple tables
  return [];
}
