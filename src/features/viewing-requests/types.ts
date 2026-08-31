export type ViewingRequestStatus =
  "pending" | "accepted" | "declined" | "cancelled" | "completed";

export type ViewingRequest = {
  id: string;
  propertyId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string | null;
  requestedDate: string;
  requestedTimeStart: string;
  requestedTimeEnd: string;
  status: ViewingRequestStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined data
  propertyTitle?: string;
  propertyAddress?: string;
};
