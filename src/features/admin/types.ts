import type { Property, PropertyStatus } from "@/features/properties/types";
import type { Contact } from "@/features/contact/types";
import type { UserRole } from "@/features/auth/schema";

// Dashboard statistics for admin overview
export type DashboardStats = {
  totalUsers: number;
  totalProperties: number;
  pendingReviews: number;
  unreadMessages: number;
  usersByRole: {
    agent: number;
    owner: number;
    tenant: number;
    admin: number;
  };
  propertiesByStatus: {
    pending: number;
    review: number;
    active: number;
    inactive: number;
    rented: number;
  };
};

// Extended property with owner information for admin view
export type AdminProperty = Property & {
  ownerName: string | null;
  ownerEmail: string;
};

// User profile for admin view
export type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  createdAt: string;
  propertyCount?: number;
};

// Property status history entry for audit trail
export type PropertyStatusHistoryEntry = {
  id: string;
  propertyId: string;
  oldStatus: PropertyStatus;
  newStatus: PropertyStatus;
  changedBy: string;
  changedByName: string | null;
  reason: string | null;
  createdAt: string;
};

// Reply email input for contact messages
export type ReplyEmailInput = {
  to: string;
  subject: string;
  message: string;
  originalMessageId: string;
};

// Re-export Contact type for convenience
export type { Contact };
