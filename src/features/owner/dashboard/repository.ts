import {
  countPropertiesByStatus,
  getRentedPropertiesRevenue,
  listProperties,
} from "@/features/properties/service";
import {
  getPendingMatchesCount,
  getRecentInterestedMatches,
  getMatchesByProfileId,
} from "@/features/property-matches/repository";
import { getTenantFirstNames } from "@/features/requirements/service";
import type {
  ActivityItem,
  PendingRequestSummary,
  RevenueByProperty,
} from "./types";

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

/** Each rented property's monthly rent, for the revenue breakdown chart. */
export async function getRevenueByProperty(
  profileId: string
): Promise<RevenueByProperty[]> {
  const rentedProperties = await listProperties(profileId, {
    status: "rented",
  });

  return rentedProperties.map((property) => ({
    propertyId: property.id,
    title: property.title,
    monthlyRent: property.monthlyRent ?? 0,
  }));
}

const ACTIVITY_TYPE_LABEL: Record<string, string> = {
  interested: "is interested in",
  approved: "was approved for",
  rejected: "was declined for",
};

/** Recent, real events an owner can act on: new listings and tenant interest/decisions on
 * their properties. Nothing here depends on leases or rent collection, since neither is
 * tracked yet. */
export async function getRecentActivity(
  profileId: string,
  limit: number
): Promise<ActivityItem[]> {
  const [properties, matches] = await Promise.all([
    listProperties(profileId),
    getMatchesByProfileId(profileId),
  ]);

  const firstNames = await getTenantFirstNames(
    matches.map((match) => match.tenantId)
  );

  const propertyEvents: ActivityItem[] = properties.map((property) => ({
    id: `property-${property.id}`,
    type: "property_listed",
    title: property.title,
    subtitle: "Listing created",
    createdAt: property.createdAt,
  }));

  const matchEvents: ActivityItem[] = matches
    .filter(
      (match) => match.status !== "curated" && match.status !== "dismissed"
    )
    .map((match) => ({
      id: `match-${match.id}`,
      type: `match_${match.status}` as ActivityItem["type"],
      title: match.property.title,
      subtitle: `${firstNames[match.tenantId] ?? "A tenant"} ${
        ACTIVITY_TYPE_LABEL[match.status] ?? "acted on"
      } this property`,
      createdAt:
        match.status === "interested" ? match.createdAt : match.updatedAt,
    }));

  return [...propertyEvents, ...matchEvents]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}
