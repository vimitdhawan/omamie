import * as repository from "./repository";
import {
  getMatchById,
  getMatchByIdForTenant,
  createMatch as createMatchInRepository,
  updateMatchStatus as updateMatchStatusInRepository,
  updateMatchStatusForTenant,
  insertCuratedMatches,
  setLeaseDecision as setLeaseDecisionInRepository,
} from "./repository";
import { getPublishedPropertiesList } from "@/features/properties/repository";
import { getViewingsByMatchId } from "@/features/viewings/repository";
import { rankCandidates } from "./utils";
import type {
  CreateMatchInput,
  PropertyMatch,
  PropertyMatchWithProperty,
  MatchStatus,
  LeaseDecision,
} from "./types";
import type { TenantRequirements } from "@/features/requirements/types";
import { AppError } from "@/lib/errors";
import {
  sendNewInterestNotification,
  sendMatchApprovedNotification,
  sendMatchRejectedNotification,
} from "./notifications";

export async function createMatch(
  input: CreateMatchInput
): Promise<PropertyMatch> {
  const match = await createMatchInRepository(input);
  // Best-effort — a notification failure should never fail the tenant's action.
  void sendNewInterestNotification(
    match.propertyOwnerId,
    match.propertyId,
    match.tenantId
  ).catch(() => {});
  return match;
}

// Governs `updateMatchStatus` (owner) and `expressInterest` (tenant) only. `rejectMatch`
// deliberately does not consult this map — a tenant can withdraw from an `approved` match
// too (just not once a viewing is confirmed) — so `approved: []` here is not a claim that
// nothing can ever leave "approved"; see `rejectMatch`'s own guard for that rule.
const VALID_TRANSITIONS: Record<MatchStatus, MatchStatus[]> = {
  curated: ["interested", "dismissed"],
  dismissed: [],
  interested: ["approved", "rejected"],
  approved: [],
  rejected: [],
};

/** Owner-driven transition: approve or reject a tenant's expressed interest. */
export async function updateMatchStatus(
  matchId: string,
  newStatus: MatchStatus,
  profileId: string,
  notes?: string
): Promise<PropertyMatchWithProperty> {
  // Verify the match exists and the user owns the property
  const match = await getMatchById(matchId, profileId);
  if (!match) {
    throw new AppError(
      "NOT_FOUND",
      "Match not found or you do not have permission to access it"
    );
  }

  // Check if the transition is valid
  const currentStatus = match.status;
  const validTransitions = VALID_TRANSITIONS[currentStatus] || [];

  if (!validTransitions.includes(newStatus)) {
    throw new AppError(
      "CONFLICT",
      `Cannot transition from ${currentStatus} to ${newStatus}`
    );
  }

  // Perform the update
  await updateMatchStatusInRepository(matchId, newStatus, notes);

  // Return the updated match
  const updated = await getMatchById(matchId, profileId);
  if (!updated) {
    throw new AppError("INTERNAL_ERROR", "Failed to fetch updated match");
  }

  if (newStatus === "approved") {
    void sendMatchApprovedNotification(
      updated.tenantId,
      updated.property.title
    ).catch(() => {});
  } else if (newStatus === "rejected") {
    void sendMatchRejectedNotification(
      updated.tenantId,
      updated.property.title
    ).catch(() => {});
  }

  return updated;
}

/** Scores active listings against a tenant's request and inserts the best ones as
 * `curated` matches, skipping properties the tenant already has any match on. Called after
 * a tenant saves their requirements, and from an explicit "Refresh matches" action. */
export async function curateMatchesForTenant(
  tenantId: string,
  requirements: TenantRequirements
): Promise<number> {
  const [candidates, existingPropertyIds] = await Promise.all([
    getPublishedPropertiesList({
      propertyType: requirements.propertyType,
      maxMonthlyRent: requirements.monthlyBudget * 1.15,
    }),
    repository.getMatchedPropertyIdsByTenantId(tenantId),
  ]);

  const existing = new Set(existingPropertyIds);
  const fresh = candidates.filter((property) => !existing.has(property.id));
  const ranked = rankCandidates(fresh, requirements);

  await insertCuratedMatches(
    ranked.map(({ property, score }) => ({
      propertyId: property.id,
      tenantId,
      propertyOwnerId: property.profileId,
      matchScore: score,
    }))
  );

  return ranked.length;
}

async function requireTenantMatch(
  matchId: string,
  tenantId: string
): Promise<PropertyMatchWithProperty> {
  const match = await getMatchByIdForTenant(matchId, tenantId);
  if (!match) {
    throw new AppError(
      "NOT_FOUND",
      "Match not found or you do not have permission to access it"
    );
  }
  return match;
}

function assertTransition(current: MatchStatus, next: MatchStatus) {
  const validTransitions = VALID_TRANSITIONS[current] || [];
  if (!validTransitions.includes(next)) {
    throw new AppError(
      "CONFLICT",
      `Cannot transition from ${current} to ${next}`
    );
  }
}

/** Tenant expresses interest in a curated suggestion, moving it into the owner's queue. */
export async function expressInterest(
  matchId: string,
  tenantId: string
): Promise<PropertyMatch> {
  const match = await requireTenantMatch(matchId, tenantId);
  assertTransition(match.status, "interested");
  return updateMatchStatusForTenant(matchId, tenantId, "interested");
}

/**
 * Tenant withdraws from a match — from a curated suggestion, an expressed interest, or
 * even an owner-approved match — at any point up to a confirmed viewing. Once a viewing is
 * confirmed the tenant can no longer reject or reschedule it themselves; that needs an
 * agent to step in (there is no self-service cancellation of a confirmed viewing).
 */
export async function rejectMatch(
  matchId: string,
  tenantId: string
): Promise<PropertyMatch> {
  const match = await requireTenantMatch(matchId, tenantId);

  if (match.status === "dismissed" || match.status === "rejected") {
    throw new AppError("CONFLICT", "This match has already been closed");
  }

  if (match.status === "approved") {
    const viewings = await getViewingsByMatchId(matchId);
    if (viewings.some((v) => v.status === "confirmed")) {
      throw new AppError(
        "CONFLICT",
        "A viewing has already been confirmed — contact your agent to cancel or reschedule it."
      );
    }
  }

  return updateMatchStatusForTenant(matchId, tenantId, "dismissed");
}

/** Tenant's final call once a viewing on an approved match is done. */
export async function decideLease(
  matchId: string,
  tenantId: string,
  decision: LeaseDecision
): Promise<PropertyMatch> {
  const match = await requireTenantMatch(matchId, tenantId);
  if (match.status !== "approved") {
    throw new AppError(
      "CONFLICT",
      "A lease decision can only be made on an approved match"
    );
  }
  if (
    match.leaseDecision === "confirmed" ||
    match.leaseDecision === "declined"
  ) {
    throw new AppError(
      "CONFLICT",
      "This match's lease decision is already final"
    );
  }
  return setLeaseDecisionInRepository(matchId, tenantId, decision);
}
