import type { Property } from "@/features/properties/types";

/**
 * Domain types for viewing requests feature
 */

export const ViewingRequestStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export type ViewingRequestStatus =
  (typeof ViewingRequestStatus)[keyof typeof ViewingRequestStatus];

export const VIEWING_REQUEST_STATUS_VALUES =
  Object.values(ViewingRequestStatus);

export type ViewingRequest = {
  id: string;
  propertyId: string;
  tenantProfileId: string;
  status: ViewingRequestStatus;
  message: string | null;
  proposedDate: string | null;
  proposedTimeStart: string | null;
  proposedTimeEnd: string | null;
  agentNotes: string | null;
  requestedAt: string;
  respondedAt: string | null;
  confirmedAt: string | null;
};

export type ViewingRequestWithProperty = ViewingRequest & {
  property?: Property;
};

export type CreateViewingRequestInput = {
  propertyId: string;
  message?: string;
};
