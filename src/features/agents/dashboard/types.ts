export type DashboardMetrics = {
  activeListings: number;
  activeListingsChange: number;
  pendingRequests: number;
  pendingRequestsUrgent: number;
  upcomingViewings: number;
  nextViewing: string | null;
  totalProperties: number;
  totalPropertiesActive: number;
};

export type DashboardOverview = {
  occupancyRate: number;
  monthlyRevenue: number;
};

export type PendingRequest = {
  id: string;
  type: "viewing" | "maintenance" | "application";
  title: string;
  requester: string;
  date: string;
  time: string;
  createdAt: string;
};

export type UpcomingViewing = {
  id: string;
  propertyTitle: string;
  requesterName: string;
  date: string;
  time: string;
};

export type RecentActivity = {
  id: string;
  type:
    | "lease_signed"
    | "listing_published"
    | "viewing_cancelled"
    | "maintenance_completed";
  title: string;
  timestamp: string;
  icon: string;
  iconColor: "primary" | "secondary" | "destructive" | "success";
};
