import { getMatchesByTenantId } from "@/features/property-matches/repository";
import { getOwnRequirements } from "@/features/requirements/service";
import { getViewingsForMatches } from "@/features/viewings/service";
import { getTenantActiveLease } from "@/features/leases/service";
import { getPropertiesByIds } from "@/features/properties/repository";
import {
  deriveMatchStage,
  deriveRequestCode,
  deriveStageCounts,
} from "./utils";
import type { MatchJourney, TenantJourney } from "./types";

/** The single read that drives the tenant's "My Property Searches" page: their request,
 * every match against it grouped by tab, and their active lease if the journey has gone
 * all the way through. */
export async function getTenantJourney(
  profileId: string
): Promise<TenantJourney> {
  const [{ profile, requirements }, matches, lease] = await Promise.all([
    getOwnRequirements(profileId),
    getMatchesByTenantId(profileId),
    getTenantActiveLease(profileId),
  ]);

  const [viewingsByMatch, properties] = await Promise.all([
    getViewingsForMatches(matches.map((match) => match.id)),
    getPropertiesByIds(matches.map((match) => match.propertyId)),
  ]);
  const propertiesById = new Map(properties.map((p) => [p.id, p]));

  const matchJourneys: MatchJourney[] = matches.map((match) => {
    const viewings = viewingsByMatch[match.id] ?? [];
    const hasLease = Boolean(
      lease &&
      lease.propertyId === match.propertyId &&
      lease.tenantId === match.tenantId
    );
    return {
      match,
      property: propertiesById.get(match.propertyId) ?? null,
      viewings,
      stage: deriveMatchStage(match, viewings, hasLease),
    };
  });

  return {
    profile,
    requirements,
    requestCode: requirements ? deriveRequestCode(profileId) : null,
    matches: matchJourneys,
    counts: deriveStageCounts(matchJourneys.map((mj) => mj.stage)),
    lease,
  };
}
