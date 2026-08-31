import { createClient } from "@/lib/supabase/server";
import type {
  ViewingRequest,
  ViewingRequestWithProperty,
  ViewingRequestFilter,
  ViewingRequestCounts,
  UpcomingViewing,
  ViewingRequestStatus,
} from "./types";

/**
 * Viewing Request Repository
 *
 * Direct database access layer for viewing requests.
 * All functions use the server-side Supabase client.
 */

/**
 * Get all viewing requests for properties owned by a specific profile
 */
export async function getViewingRequestsByProfileId(
  profileId: string,
  filter?: ViewingRequestFilter
): Promise<ViewingRequestWithProperty[]> {
  const supabase = await createClient();

  let query = supabase
    .from("viewing_requests")
    .select(
      `
      *,
      property:properties!inner (
        id,
        title,
        location,
        profile_id
      )
    `
    )
    .eq("property.profile_id", profileId)
    .order("created_at", { ascending: false });

  // Apply filters
  if (filter?.status) {
    query = query.eq("status", filter.status);
  }

  if (filter?.propertyId) {
    query = query.eq("property_id", filter.propertyId);
  }

  if (filter?.search) {
    query = query.or(
      `requester_name.ilike.%${filter.search}%,requester_email.ilike.%${filter.search}%,property.title.ilike.%${filter.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []).map((item) => ({
    id: item.id,
    propertyId: item.property_id,
    requesterName: item.requester_name,
    requesterEmail: item.requester_email,
    requesterPhone: item.requester_phone,
    requestedDate: item.requested_date,
    requestedTimeStart: item.requested_time_start,
    requestedTimeEnd: item.requested_time_end,
    status: item.status,
    notes: item.notes,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    property: {
      id: item.property.id,
      title: item.property.title,
      location: item.property.location,
      profileId: item.property.profile_id,
    },
  }));
}

/**
 * Get a single viewing request by ID (with property data)
 */
export async function getViewingRequestById(
  requestId: string,
  profileId: string
): Promise<ViewingRequestWithProperty | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("viewing_requests")
    .select(
      `
      *,
      property:properties!inner (
        id,
        title,
        location,
        profile_id
      )
    `
    )
    .eq("id", requestId)
    .eq("property.profile_id", profileId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    propertyId: data.property_id,
    requesterName: data.requester_name,
    requesterEmail: data.requester_email,
    requesterPhone: data.requester_phone,
    requestedDate: data.requested_date,
    requestedTimeStart: data.requested_time_start,
    requestedTimeEnd: data.requested_time_end,
    status: data.status,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    property: {
      id: data.property.id,
      title: data.property.title,
      location: data.property.location,
      profileId: data.property.profile_id,
    },
  };
}

/**
 * Get viewing request counts by status for a profile
 */
export async function getViewingRequestCounts(
  profileId: string
): Promise<ViewingRequestCounts> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("viewing_requests")
    .select("status, property:properties!inner(profile_id)")
    .eq("property.profile_id", profileId);

  if (error) {
    throw error;
  }

  const counts: ViewingRequestCounts = {
    pending: 0,
    accepted: 0,
    completed: 0,
    declined: 0,
    cancelled: 0,
    total: 0,
  };

  for (const item of data || []) {
    counts[item.status as ViewingRequestStatus]++;
    counts.total++;
  }

  return counts;
}

/**
 * Get pending viewing requests count for a profile
 */
export async function getPendingRequestsCount(
  profileId: string
): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("viewing_requests")
    .select("*, property:properties!inner(profile_id)", {
      count: "exact",
      head: true,
    })
    .eq("property.profile_id", profileId)
    .eq("status", "pending");

  if (error) {
    throw error;
  }

  return count || 0;
}

/**
 * Get upcoming viewings (accepted requests with future dates)
 */
export async function getUpcomingViewings(
  profileId: string,
  limit: number = 5
): Promise<UpcomingViewing[]> {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("viewing_requests")
    .select(
      `
      id,
      requester_name,
      requested_date,
      requested_time_start,
      requested_time_end,
      property:properties!inner (
        title,
        profile_id
      )
    `
    )
    .eq("property.profile_id", profileId)
    .eq("status", "accepted")
    .gte("requested_date", today)
    .order("requested_date", { ascending: true })
    .order("requested_time_start", { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data || []).map((item) => ({
    id: item.id,
    propertyTitle: item.property.title,
    requesterName: item.requester_name,
    requestedDate: item.requested_date,
    requestedTimeStart: item.requested_time_start,
    requestedTimeEnd: item.requested_time_end,
  }));
}

/**
 * Update viewing request status
 */
export async function updateViewingRequestStatus(
  requestId: string,
  status: ViewingRequestStatus
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("viewing_requests")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) {
    throw error;
  }
}

/**
 * Create a new viewing request
 */
export async function createViewingRequest(input: {
  propertyId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string | null;
  requestedDate: string;
  requestedTimeStart: string;
  requestedTimeEnd: string;
  notes?: string | null;
}): Promise<ViewingRequest> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("viewing_requests")
    .insert({
      property_id: input.propertyId,
      requester_name: input.requesterName,
      requester_email: input.requesterEmail,
      requester_phone: input.requesterPhone || null,
      requested_date: input.requestedDate,
      requested_time_start: input.requestedTimeStart,
      requested_time_end: input.requestedTimeEnd,
      notes: input.notes || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    propertyId: data.property_id,
    requesterName: data.requester_name,
    requesterEmail: data.requester_email,
    requesterPhone: data.requester_phone,
    requestedDate: data.requested_date,
    requestedTimeStart: data.requested_time_start,
    requestedTimeEnd: data.requested_time_end,
    status: data.status,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
