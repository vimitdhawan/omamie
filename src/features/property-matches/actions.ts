"use server";

import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import * as repository from "./repository";
import * as service from "./service";
import {
  getTenantFirstNames,
  getOwnRequirements,
} from "@/features/requirements/service";
import {
  createMatchSchema,
  updateMatchStatusSchema,
  matchFilterSchema,
  matchIdSchema,
  decideLeaseSchema,
} from "./schema";
import type { MatchFilter, UpdateMatchStatusInput } from "./types";

export async function getMatchesAction(filters?: MatchFilter) {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "owner") {
    redirect("/login");
  }

  const validFilters = matchFilterSchema.parse(filters || {});
  const matches = await repository.getMatchesByProfileId(
    session.profileId,
    validFilters
  );

  const firstNames = await getTenantFirstNames(
    matches.map((match) => match.tenantId)
  );

  return matches.map((match) => ({
    ...match,
    tenantFirstName: firstNames[match.tenantId],
  }));
}

export async function getMatchCountsAction() {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "owner") {
    redirect("/login");
  }

  return repository.getMatchCounts(session.profileId);
}

export async function getPendingMatchesCountAction() {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "owner") {
    redirect("/login");
  }

  return repository.getPendingMatchesCount(session.profileId);
}

export async function createMatchAction(
  propertyId: string,
  options?: {
    notes?: string;
    requestedMoveInDate?: string;
    requestedMoveOutDate?: string;
  }
) {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  const input = createMatchSchema.parse({
    propertyId,
    tenantId: session.profileId,
    notes: options?.notes,
    requestedMoveInDate: options?.requestedMoveInDate,
    requestedMoveOutDate: options?.requestedMoveOutDate,
  });

  const result = await service.createMatch(input);
  revalidatePath("/matches");
  return result;
}

export async function getTenantMatchesAction() {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  try {
    return await repository.getMatchesByTenantId(session.profileId);
  } catch (error) {
    console.error("Failed to fetch tenant matches:", error);
    return [];
  }
}

export async function getMatchedPropertyIdsAction() {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  try {
    return await repository.getMatchedPropertyIdsByTenantId(session.profileId);
  } catch (error) {
    console.error("Failed to fetch matched property ids:", error);
    return [];
  }
}

export async function updateMatchStatusAction(input: UpdateMatchStatusInput) {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "owner") {
    redirect("/login");
  }

  const validInput = updateMatchStatusSchema.parse(input);
  const result = await service.updateMatchStatus(
    validInput.matchId,
    validInput.status,
    session.profileId,
    validInput.notes
  );
  revalidatePath("/matches");
  revalidatePath("/requests");
  return result;
}

/** Re-runs the match engine for the current tenant's saved request. No-ops (returns 0)
 * if they have no request yet. */
export async function refreshMatchesAction(): Promise<number> {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  const { requirements } = await getOwnRequirements(session.profileId);
  if (!requirements) return 0;

  const count = await service.curateMatchesForTenant(
    session.profileId,
    requirements
  );
  revalidatePath("/matches");
  return count;
}

export async function expressInterestAction(matchId: string) {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  const validMatchId = matchIdSchema.parse(matchId);
  const result = await service.expressInterest(validMatchId, session.profileId);
  revalidatePath("/matches");
  return result;
}

/** Tenant withdraws from a match — any stage up to a confirmed viewing. */
export async function rejectMatchAction(matchId: string) {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  const validMatchId = matchIdSchema.parse(matchId);
  const result = await service.rejectMatch(validMatchId, session.profileId);
  revalidatePath("/matches");
  return result;
}

export async function decideLeaseAction(
  matchId: string,
  decision: "confirmed" | "declined"
) {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  const validInput = decideLeaseSchema.parse({ matchId, decision });
  const result = await service.decideLease(
    validInput.matchId,
    session.profileId,
    validInput.decision
  );
  revalidatePath("/matches");
  return result;
}
