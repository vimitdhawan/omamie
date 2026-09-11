import {
  getMatchById,
  updateMatchStatus as updateMatchStatusInRepository,
} from "./repository";
import type { PropertyMatchWithProperty } from "./types";
import { AppError } from "@/lib/errors";

const VALID_TRANSITIONS: Record<string, string[]> = {
  interested: ["approved", "rejected"],
  approved: [],
  rejected: [],
};

export async function updateMatchStatus(
  matchId: string,
  newStatus: string,
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

  return updated;
}
