import {
  countPropertiesByStatus,
  getRentedPropertiesRevenue,
} from "@/features/properties/service";
import {
  getPendingMatchesCount,
  getRecentInterestedMatches,
} from "@/features/property-matches/repository";
import type { PendingRequestSummary } from "./types";

export { countPropertiesByStatus, getRentedPropertiesRevenue };

export async function getPendingRequestsCount(
  profileId: string
): Promise<number> {
  return getPendingMatchesCount(profileId);
}

export async function getRecentPendingRequests(
  profileId: string,
  limit: number
): Promise<PendingRequestSummary[]> {
  return getRecentInterestedMatches(profileId, limit);
}
