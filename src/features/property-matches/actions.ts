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
import type { MatchFilter, UpdateMatchStatusInput } from "./types";

export async function getMatchesAction(filters?: MatchFilter) {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "owner") {
    redirect("/login");
  }

  const validFilters = matchFilterSchema.parse(filters || {});
  return repository.getMatchesByProfileId(session.profileId, validFilters);
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

  return service.createMatch(input);
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
  return service.updateMatchStatus(
    validInput.matchId,
    validInput.status,
    session.profileId,
    validInput.notes
  );
}
