import { createClient } from "@/lib/supabase/server";
import type {
  ViewingRequest,
  ViewingRequestWithProperty,
  ViewingRequestStatus,
} from "./types";
import { AppError } from "@/lib/errors";

// Temporary type until types are regenerated after migration
type ViewingRequestTable = {
  id: string;
  property_id: string;
  tenant_profile_id: string;
  status: string;
  message: string | null;
  proposed_date: string | null;
  proposed_time_start: string | null;
  proposed_time_end: string | null;
  agent_notes: string | null;
  requested_at: string;
  responded_at: string | null;
  confirmed_at: string | null;
};

/**
 * Repository layer for viewing requests
 * Direct database operations only
 */

function mapTableToViewingRequest(table: ViewingRequestTable): ViewingRequest {
  return {
    id: table.id,
    propertyId: table.property_id,
    tenantProfileId: table.tenant_profile_id,
    status: table.status as ViewingRequestStatus,
    message: table.message,
    proposedDate: table.proposed_date,
    proposedTimeStart: table.proposed_time_start,
    proposedTimeEnd: table.proposed_time_end,
    agentNotes: table.agent_notes,
    requestedAt: table.requested_at,
    respondedAt: table.responded_at,
    confirmedAt: table.confirmed_at,
  };
}

/**
 * Create a viewing request
 */
export async function createViewingRequest(
  tenantProfileId: string,
  propertyId: string,
  message?: string
): Promise<ViewingRequest> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("viewing_requests" as never)
    .insert({
      tenant_profile_id: tenantProfileId,
      property_id: propertyId,
      message: message ?? null,
      status: "pending",
    } as never)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new AppError(
        "VALIDATION_ERROR",
        "You have already requested to view this property"
      );
    }
    throw new AppError("INTERNAL_ERROR", "Failed to create viewing request");
  }

  return mapTableToViewingRequest(data as ViewingRequestTable);
}

/**
 * Get viewing requests for a tenant
 */
export async function getViewingRequestsByTenant(
  tenantProfileId: string
): Promise<ViewingRequestWithProperty[]> {
  const supabase = await createClient();

  const { data, error } = (await supabase
    .from("viewing_requests" as never)
    .select(
      `
      *,
      properties (*)
    `
    )
    .eq("tenant_profile_id", tenantProfileId)
    .order("requested_at", { ascending: false })) as never;

  if (error) {
    return [];
  }

  return (data as Array<Record<string, unknown>>).map((row) => ({
    ...mapTableToViewingRequest(row as unknown as ViewingRequestTable),
    property: (row.properties as Record<string, unknown>) || undefined,
  })) as ViewingRequestWithProperty[];
}

/**
 * Update viewing request status
 */
export async function updateViewingRequestStatus(
  requestId: string,
  status: ViewingRequestStatus
): Promise<ViewingRequest> {
  const supabase = await createClient();

  const updateData: Record<string, string> = {
    status,
  };

  // Set responded_at when accepting/rejecting
  if (status === "accepted" || status === "rejected") {
    updateData.responded_at = new Date().toISOString();
  }

  // Set confirmed_at when confirming
  if (status === "confirmed") {
    updateData.confirmed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("viewing_requests" as never)
    .update(updateData as never)
    .eq("id", requestId)
    .select()
    .single();

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to update viewing request");
  }

  return mapTableToViewingRequest(data as ViewingRequestTable);
}

/**
 * Check if a viewing request exists for a property and tenant
 */
export async function checkViewingRequestExists(
  propertyId: string,
  tenantProfileId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = (await supabase
    .from("viewing_requests" as never)
    .select("id")
    .eq("property_id", propertyId)
    .eq("tenant_profile_id", tenantProfileId)
    .single()) as never;

  return !error && data !== null;
}
