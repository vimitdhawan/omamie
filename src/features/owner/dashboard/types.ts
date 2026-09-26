export type DashboardMetrics = {
  totalProperties: number;
  activeListings: number;
  rentedProperties: number;
  pendingRequests: number;
};

export type DashboardOverview = {
  /** 0-100, rounded. `rentedProperties / (activeListings + rentedProperties)`. */
  occupancyRate: number;
  monthlyRevenue: number;
};

export type PendingRequestSummary = {
  id: string;
  propertyTitle: string;
  tenantName: string;
  createdAt: string;
};

/** One rented property's contribution to `monthlyRevenue`, for the revenue breakdown chart. */
export type RevenueByProperty = {
  propertyId: string;
  title: string;
  monthlyRent: number;
};

export type ActivityType =
  "property_listed" | "match_interested" | "match_approved" | "match_rejected";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  createdAt: string;
};
