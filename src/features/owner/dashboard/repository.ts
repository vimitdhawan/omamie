import {
  countPropertiesByStatus,
  getRentedPropertiesRevenue,
} from "@/features/properties/service";
import {
  getPendingMatchesCount,
  getRecentInterestedMatches,
} from "@/features/property-matches/repository";
import { getTenantFirstNames } from "@/features/requirements/service";
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
  const matches = await getRecentInterestedMatches(profileId, limit);
  const firstNames = await getTenantFirstNames(
    matches.map((match) => match.tenantId)
  );

  return matches.map((match) => ({
    id: match.id,
    propertyTitle: match.propertyTitle,
    tenantName: firstNames[match.tenantId] ?? "A tenant",
    createdAt: match.createdAt,
  }));
}
