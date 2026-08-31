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

export type CreateViewingRequestInput = {
  propertyId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  requestedDate: string;
  requestedTimeStart: string;
  requestedTimeEnd: string;
  notes?: string;
};

export type ViewingRequestWithProperty = ViewingRequest & {
  property: {
    id: string;
    title: string;
    location: string;
    profileId: string;
  };
};

export type ViewingRequestCounts = {
  pending: number;
  accepted: number;
  completed: number;
  declined: number;
  cancelled: number;
  total: number;
};

export type ViewingRequestFilter = {
  status?: ViewingRequestStatus;
  search?: string;
  propertyId?: string;
};

export type UpdateViewingRequestStatusInput = {
  requestId: string;
  status: ViewingRequestStatus;
};

export type UpcomingViewing = {
  id: string;
  propertyTitle: string;
  requesterName: string;
  requestedDate: string;
  requestedTimeStart: string;
  requestedTimeEnd: string;
};
