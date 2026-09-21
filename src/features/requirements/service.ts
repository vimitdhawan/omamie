import { getMatchById } from "@/features/property-matches/repository";
import { AppError } from "@/lib/errors";
import {
  upsertTenantProfile,
  upsertTenantRequirements,
  getTenantProfileByProfileId,
  getTenantRequirementsByProfileId,
  getTenantDetailByTenantId,
  getFirstNamesByProfileIds,
} from "./repository";
import type { RequirementsFormData } from "./schema";
import type { TenantRequestDetail } from "./types";

export async function saveRequirements(
  profileId: string,
  input: RequirementsFormData
) {
  const [profile, requirements] = await Promise.all([
    upsertTenantProfile({
      profileId,
      firstName: input.firstName,
      occupation: input.occupation,
      employer: input.employer || null,
      reasonForMoving: input.reasonForMoving,
      intendedDuration: input.intendedDuration,
      numberOfOccupants: input.numberOfOccupants,
      hasPets: input.hasPets,
      isSmoker: input.isSmoker,
      bio: input.bio || null,
    }),
    upsertTenantRequirements({
      profileId,
      propertyType: input.propertyType,
      preferredLocation: input.preferredLocation,
      monthlyBudget: input.monthlyBudget,
      moveInDate: input.moveInDate,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      minSizeSqm: input.minSizeSqm ? Number(input.minSizeSqm) : null,
      furnishing: input.furnishing,
      preferredNeighborhoods: input.preferredNeighborhoods ?? [],
      petFriendly: input.petFriendly ?? false,
      parkingNeeded: input.parkingNeeded ?? false,
      amenitiesWishlist: input.amenitiesWishlist ?? [],
      additionalNotes: input.additionalNotes || null,
      preferredLeaseLength: input.preferredLeaseLength || null,
    }),
  ]);

  return { profile, requirements };
}

/** Owner-facing: first names for a set of tenants, e.g. to label rows in a matches
 * table without exposing anything from `profiles`. */
export async function getTenantFirstNames(
  tenantIds: string[]
): Promise<Record<string, string>> {
  return getFirstNamesByProfileIds(Array.from(new Set(tenantIds)));
}

export async function getOwnRequirements(profileId: string) {
  const [profile, requirements] = await Promise.all([
    getTenantProfileByProfileId(profileId),
    getTenantRequirementsByProfileId(profileId),
  ]);

  return { profile, requirements };
}

/** Owner-facing: the tenant's profile + requirements for a specific match request they
 * own. Ownership is re-verified via `getMatchById` (same guard property-matches uses for
 * status updates) rather than trusted from the caller. */
export async function getTenantDetailForMatch(
  matchId: string,
  ownerProfileId: string
): Promise<TenantRequestDetail> {
  const match = await getMatchById(matchId, ownerProfileId);
  if (!match) {
    throw new AppError(
      "NOT_FOUND",
      "Match not found or you do not have permission to view it"
    );
  }

  return getTenantDetailByTenantId(match.tenantId);
}
