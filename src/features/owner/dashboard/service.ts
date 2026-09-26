import * as repository from "./repository";
import type { DashboardMetrics, DashboardOverview } from "./types";

const PENDING_REQUESTS_PREVIEW_LIMIT = 5;
const RECENT_ACTIVITY_LIMIT = 6;

function toOverview(
  statusCounts: { active: number; rented: number },
  monthlyRevenue: number
): DashboardOverview {
  const occupiedOrListed = statusCounts.active + statusCounts.rented;
  const occupancyRate =
    occupiedOrListed === 0
      ? 0
      : Math.round((statusCounts.rented / occupiedOrListed) * 100);

  return { occupancyRate, monthlyRevenue };
}

export async function getDashboardData(profileId: string) {
  const [
    statusCounts,
    pendingRequestsCount,
    monthlyRevenue,
    pendingRequests,
    revenueByProperty,
    recentActivity,
  ] = await Promise.all([
    repository.countPropertiesByStatus(profileId),
    repository.getPendingRequestsCount(profileId),
    repository.getRentedPropertiesRevenue(profileId),
    repository.getRecentPendingRequests(
      profileId,
      PENDING_REQUESTS_PREVIEW_LIMIT
    ),
    repository.getRevenueByProperty(profileId),
    repository.getRecentActivity(profileId, RECENT_ACTIVITY_LIMIT),
  ]);

  const metrics: DashboardMetrics = {
    totalProperties: statusCounts.all,
    activeListings: statusCounts.active,
    rentedProperties: statusCounts.rented,
    pendingRequests: pendingRequestsCount,
  };

  return {
    metrics,
    overview: toOverview(statusCounts, monthlyRevenue),
    pendingRequests,
    revenueByProperty,
    recentActivity,
  };
}
