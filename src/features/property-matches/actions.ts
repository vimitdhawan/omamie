"use server";

import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import * as repository from "./repository";
import * as service from "./service";
import {
  createMatchSchema,
  updateMatchStatusSchema,
  matchFilterSchema,
} from "./schema";
import { HARDCODED_TENANT_ID } from "./constants";
import type { MatchFilter, UpdateMatchStatusInput } from "./types";

export async function getMatchesAction(filters?: MatchFilter) {
  const session = await getAuthSession();
  if (
    !session?.profileId ||
    (session.role !== "agent" && session.role !== "owner")
  ) {
    redirect("/login");
  }

  const validFilters = matchFilterSchema.parse(filters || {});
  return repository.getMatchesByProfileId(session.profileId, validFilters);
}

export async function getMatchCountsAction() {
  const session = await getAuthSession();
  if (
    !session?.profileId ||
    (session.role !== "agent" && session.role !== "owner")
  ) {
    redirect("/login");
  }

  return repository.getMatchCounts(session.profileId);
}

export async function getPendingMatchesCountAction() {
  const session = await getAuthSession();
  if (
    !session?.profileId ||
    (session.role !== "agent" && session.role !== "owner")
  ) {
    redirect("/login");
  }

  return repository.getPendingMatchesCount(session.profileId);
}

export async function createMatchAction(propertyId: string, notes?: string) {
  // For now, anyone can show interest (no auth required for tenant-initiated interest)
  // In future, this can gate on session.role === 'tenant' once tenant auth exists
  const input = createMatchSchema.parse({
    propertyId,
    tenantId: HARDCODED_TENANT_ID,
    notes,
  });

  return repository.createMatch(input);
}

export async function updateMatchStatusAction(input: UpdateMatchStatusInput) {
  const session = await getAuthSession();
  if (
    !session?.profileId ||
    (session.role !== "agent" && session.role !== "owner")
  ) {
    redirect("/login");
  }

  const validInput = updateMatchStatusSchema.parse(input);
  return service.updateMatchStatus(
    validInput.matchId,
    validInput.status,
    session.profileId,
    validInput.notes
  );
}
