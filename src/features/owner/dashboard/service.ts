import * as repository from "./repository";

export async function getDashboardData(profileId: string) {
  const [metrics, overview, pendingRequests, upcomingViewings, recentActivity] =
    await Promise.all([
      repository.getDashboardMetrics(profileId),
      repository.getDashboardOverview(profileId),
      repository.getPendingRequests(profileId),
      repository.getUpcomingViewings(profileId),
      repository.getRecentActivity(profileId),
    ]);

  return {
    metrics,
    overview,
    pendingRequests,
    upcomingViewings,
    recentActivity,
  };
}
