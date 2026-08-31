import { createClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/types/error";
import type { UserRole } from "@/features/auth/schema";
import type {
  DashboardStats,
  AdminProperty,
  AdminUser,
  PropertyStatusHistoryEntry,
} from "./types";
import type {
  PropertyStatus,
  PropertyType,
  FurnishedStatus,
  Amenity,
  PropertyNextAction,
} from "@/features/properties/types";

/**
 * Get dashboard statistics for admin overview
 * Real-time counts of users, properties, and pending reviews
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  // Get total users count
  const { count: totalUsers, error: usersError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (usersError) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Failed to fetch dashboard statistics",
      { cause: usersError }
    );
  }

  // Get users by role
  const { data: usersByRole, error: usersByRoleError } = await supabase
    .from("profiles")
    .select("role");

  if (usersByRoleError) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Failed to fetch user role statistics",
      { cause: usersByRoleError }
    );
  }

  // Get total properties count
  const { count: totalProperties, error: propertiesError } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true });

  if (propertiesError) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Failed to fetch property statistics",
      { cause: propertiesError }
    );
  }

  // Get properties by status
  const { data: propertiesByStatus, error: propertiesByStatusError } =
    await supabase.from("properties").select("status");

  if (propertiesByStatusError) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Failed to fetch property status statistics",
      { cause: propertiesByStatusError }
    );
  }

  // Get pending reviews count (properties with status 'review')
  const { count: pendingReviews, error: reviewsError } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("status", "review");

  if (reviewsError) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Failed to fetch pending reviews count",
      { cause: reviewsError }
    );
  }

  // Get unread messages count (all contact messages for now)
  const { count: unreadMessages, error: messagesError } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true });

  if (messagesError) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Failed to fetch contact messages count",
      { cause: messagesError }
    );
  }

  // Aggregate users by role
  const userRoleCounts = {
    agent: 0,
    owner: 0,
    tenant: 0,
    admin: 0,
  };

  usersByRole?.forEach((user) => {
    if (user.role === "agent") userRoleCounts.agent++;
    else if (user.role === "owner") userRoleCounts.owner++;
    else if (user.role === "tenant") userRoleCounts.tenant++;
    else if (user.role === "admin") userRoleCounts.admin++;
  });

  // Aggregate properties by status
  const propertyStatusCounts = {
    pending: 0,
    review: 0,
    active: 0,
    inactive: 0,
    rented: 0,
  };

  propertiesByStatus?.forEach((property) => {
    if (property.status === "pending") propertyStatusCounts.pending++;
    else if (property.status === "review") propertyStatusCounts.review++;
    else if (property.status === "active") propertyStatusCounts.active++;
    else if (property.status === "inactive") propertyStatusCounts.inactive++;
    else if (property.status === "rented") propertyStatusCounts.rented++;
  });

  return {
    totalUsers: totalUsers ?? 0,
    totalProperties: totalProperties ?? 0,
    pendingReviews: pendingReviews ?? 0,
    unreadMessages: unreadMessages ?? 0,
    usersByRole: userRoleCounts,
    propertiesByStatus: propertyStatusCounts,
  };
}

/**
 * Get all properties with owner information for admin view
 */
export async function getAllProperties(filters?: {
  status?: PropertyStatus;
}): Promise<AdminProperty[]> {
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select(
      `
      *,
      profiles!inner (
        email,
        full_name
      )
    `
    )
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch properties", {
      cause: error,
    });
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?.map((row: any) => ({
      id: row.id,
      profileId: row.profile_id,
      propertyType: row.property_type as PropertyType,
      title: row.title,
      location: row.location,
      monthlyRent: row.monthly_rent,
      description: row.description,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      furnishedStatus: row.furnished_status as FurnishedStatus,
      amenities: (row.amenities || []) as Amenity[],
      status: row.status as PropertyStatus,
      nextAction: row.next_action as PropertyNextAction,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      listedAt: row.listed_at,
      ownerEmail: Array.isArray(row.profiles)
        ? row.profiles[0]?.email
        : row.profiles?.email,
      ownerName: Array.isArray(row.profiles)
        ? row.profiles[0]?.full_name || null
        : row.profiles?.full_name || null,
    })) || []
  );
}

/**
 * Get properties pending review (status = 'review')
 */
export async function getPropertiesForReview(): Promise<AdminProperty[]> {
  return getAllProperties({ status: "review" });
}

/**
 * Approve a property - change status to 'active' and create history entry
 */
export async function approveProperty(
  propertyId: string,
  adminId: string
): Promise<void> {
  const supabase = await createClient();

  // Get current property to record old status
  const { data: property, error: fetchError } = await supabase
    .from("properties")
    .select("status")
    .eq("id", propertyId)
    .single();

  if (fetchError) {
    throw new AppError("NOT_FOUND", "Property not found", {
      cause: fetchError,
    });
  }

  const oldStatus = property.status;

  // Update property status to active
  const { error: updateError } = await supabase
    .from("properties")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", propertyId);

  if (updateError) {
    throw new AppError("INTERNAL_ERROR", "Failed to approve property", {
      cause: updateError,
    });
  }

  // Create status history entry
  await createStatusHistoryEntry(propertyId, oldStatus, "active", adminId);
}

/**
 * Reject a property - change status to 'inactive' and create history entry with reason
 */
export async function rejectProperty(
  propertyId: string,
  adminId: string,
  reason?: string
): Promise<void> {
  const supabase = await createClient();

  // Get current property to record old status
  const { data: property, error: fetchError } = await supabase
    .from("properties")
    .select("status")
    .eq("id", propertyId)
    .single();

  if (fetchError) {
    throw new AppError("NOT_FOUND", "Property not found", {
      cause: fetchError,
    });
  }

  const oldStatus = property.status;

  // Update property status to inactive
  const { error: updateError } = await supabase
    .from("properties")
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .eq("id", propertyId);

  if (updateError) {
    throw new AppError("INTERNAL_ERROR", "Failed to reject property", {
      cause: updateError,
    });
  }

  // Create status history entry with reason
  await createStatusHistoryEntry(
    propertyId,
    oldStatus,
    "inactive",
    adminId,
    reason
  );
}

/**
 * Get all users for admin view
 */
export async function getAllUsers(): Promise<AdminUser[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch users", {
      cause: error,
    });
  }

  return (
    data?.map((row) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role as UserRole,
      createdAt: row.created_at,
    })) || []
  );
}

/**
 * Get property status history for a specific property
 */
export async function getPropertyStatusHistory(
  propertyId: string
): Promise<PropertyStatusHistoryEntry[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("property_status_history")
    .select(
      `
      *,
      profiles!property_status_history_changed_by_fkey (
        full_name
      )
    `
    )
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Failed to fetch property status history",
      { cause: error }
    );
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?.map((row: any) => ({
      id: row.id,
      propertyId: row.property_id,
      oldStatus: row.old_status as PropertyStatus,
      newStatus: row.new_status as PropertyStatus,
      changedBy: row.changed_by,
      changedByName: Array.isArray(row.profiles)
        ? row.profiles[0]?.full_name || null
        : row.profiles?.full_name || null,
      reason: row.reason,
      createdAt: row.created_at,
    })) || []
  );
}

/**
 * Create a status history entry
 */
export async function createStatusHistoryEntry(
  propertyId: string,
  oldStatus: string,
  newStatus: string,
  changedBy: string,
  reason?: string
): Promise<void> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("property_status_history")
    .insert({
      property_id: propertyId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: changedBy,
      reason: reason || null,
    });

  if (error) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Failed to create status history entry",
      { cause: error }
    );
  }
}
