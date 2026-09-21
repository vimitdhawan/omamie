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
