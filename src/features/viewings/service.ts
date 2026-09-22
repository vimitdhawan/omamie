import * as repository from "./repository";
import {
  getMatchById,
  getMatchByIdForTenant,
} from "@/features/property-matches/repository";
import { AppError } from "@/lib/errors";
import type { Viewing } from "./types";

export async function getViewingsForMatches(
  matchIds: string[]
): Promise<Record<string, Viewing[]>> {
  return repository.getViewingsByMatchIds(matchIds);
}

export async function getViewingsForMatch(
  matchId: string,
  ownerProfileId: string
): Promise<Viewing[]> {
  const match = await getMatchById(matchId, ownerProfileId);
  if (!match) {
    throw new AppError(
      "NOT_FOUND",
      "Match not found or you do not have permission to access it"
    );
  }
  return repository.getViewingsByMatchId(matchId);
}

/** Tenant shares a handful of times they're free for a viewing, once an owner has
 * approved the match. Ownership is re-verified via `getMatchByIdForTenant` rather than
 * trusted from the caller. */
export async function proposeViewingSlots(
  matchId: string,
  tenantId: string,
  slots: string[]
): Promise<Viewing[]> {
  const match = await getMatchByIdForTenant(matchId, tenantId);
  if (!match) {
    throw new AppError(
      "NOT_FOUND",
      "Match not found or you do not have permission to access it"
    );
  }
  if (match.status !== "approved") {
    throw new AppError(
      "CONFLICT",
      "You can only share viewing times once the owner has approved this match"
    );
  }

  const existing = await repository.getViewingsByMatchId(matchId);
  if (existing.some((v) => v.status === "confirmed")) {
    throw new AppError("CONFLICT", "A viewing time is already confirmed");
  }

  return repository.replaceProposedSlots(matchId, slots);
}

/** Owner picks one of the tenant's proposed times. Ownership is re-verified via
 * `getMatchById` — the same permission gate `property-matches/service.ts` uses for status
 * updates — rather than trusted from the caller. */
export async function confirmViewingSlot(
  matchId: string,
  viewingId: string,
  ownerProfileId: string
): Promise<Viewing> {
  const match = await getMatchById(matchId, ownerProfileId);
  if (!match) {
    throw new AppError(
      "NOT_FOUND",
      "Match not found or you do not have permission to access it"
    );
  }
  if (match.status !== "approved") {
    throw new AppError(
      "CONFLICT",
      "A viewing can only be confirmed on an approved match"
    );
  }

  return repository.confirmSlot(matchId, viewingId);
}
