import type { Property } from "@/features/properties/types";
import { Amenity, FurnishedStatus } from "@/features/properties/types";
import type {
  Bathrooms,
  Bedrooms,
  Furnishing,
  TenantRequirements,
} from "@/features/requirements/types";

/**
 * `tenant_requirements.bedrooms` is a text bucket ("studio" | "1" | "2" | "3" | "4+");
 * `properties.bedrooms` is an integer. "4+" is a floor, everything else is exact.
 */
export function bedroomsMatch(
  requirement: Bedrooms,
  propertyBedrooms: number
): boolean {
  if (requirement === "studio") return propertyBedrooms === 0;
  if (requirement === "4+") return propertyBedrooms >= 4;
  return propertyBedrooms === Number(requirement);
}

/**
 * `tenant_requirements.bathrooms` is "1" | "2" | "3+"; a tenant's requirement is a floor
 * ("at least this many"), unlike bedrooms which is exact.
 */
export function bathroomsSatisfy(
  requirement: Bathrooms,
  propertyBathrooms: number
): boolean {
  const minimum = requirement === "3+" ? 3 : Number(requirement);
  return propertyBathrooms >= minimum;
}

/**
 * The two furnishing vocabularies drifted: tenant requirements use "partially",
 * properties use "partial". Everything else lines up.
 */
export function furnishingMatches(
  requirement: Furnishing,
  propertyFurnishedStatus: FurnishedStatus | null
): boolean {
  if (!propertyFurnishedStatus) return false;
  const mapped =
    requirement === "partially" ? FurnishedStatus.PARTIAL : requirement;
  return mapped === propertyFurnishedStatus;
}

/**
 * Weighted fit score (0-100) between one active listing and a tenant's search request.
 * Pure and DB-free so it's unit-testable directly. Each dimension either fully awards its
 * weight or contributes nothing — there is no partial credit within a dimension.
 *
 * Weights: budget 30, bedrooms 25, location 20, furnishing 10, bathrooms 5, area 5, parking 5.
 *
 * Known gap: `requirements.petFriendly` has nothing to score against — properties has no
 * pet-friendly column or amenity — so pet-friendliness is not scored here.
 */
export function scoreProperty(
  property: Property,
  requirements: TenantRequirements
): number {
  let score = 0;

  if (
    property.monthlyRent !== null &&
    property.monthlyRent <= requirements.monthlyBudget
  ) {
    score += 30;
  }

  if (bedroomsMatch(requirements.bedrooms, property.bedrooms)) {
    score += 25;
  }

  if (
    property.location &&
    property.location
      .toLowerCase()
      .includes(requirements.preferredLocation.toLowerCase())
  ) {
    score += 20;
  }

  if (furnishingMatches(requirements.furnishing, property.furnishedStatus)) {
    score += 10;
  }

  if (bathroomsSatisfy(requirements.bathrooms, property.bathrooms)) {
    score += 5;
  }

  if (
    !requirements.minSizeSqm ||
    (property.areaSqm !== null && property.areaSqm >= requirements.minSizeSqm)
  ) {
    score += 5;
  }

  if (
    !requirements.parkingNeeded ||
    property.amenities.includes(Amenity.PARKING)
  ) {
    score += 5;
  }

  return Math.min(100, score);
}

/** Minimum score a property must clear to be surfaced as a curated match. */
export const CURATION_THRESHOLD = 40;

/** Cap on how many curated suggestions a single refresh inserts. */
export const MAX_CURATED_MATCHES = 10;

/**
 * Scores and ranks candidate properties for a tenant's request, applying the curation
 * threshold and cap. Pure — the caller is responsible for fetching candidates and excluding
 * ones the tenant already has a match on.
 */
export function rankCandidates(
  candidates: Property[],
  requirements: TenantRequirements
): Array<{ property: Property; score: number }> {
  return candidates
    .map((property) => ({
      property,
      score: scoreProperty(property, requirements),
    }))
    .filter((entry) => entry.score >= CURATION_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CURATED_MATCHES);
}
