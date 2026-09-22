import type { PropertyMatch } from "@/features/property-matches/types";
import type { Viewing } from "@/features/viewings/types";
import type { JourneyStage, StageCounts } from "./types";

/** A short human-facing handle for a tenant's request, e.g. "REQ-8821" — same idiom as
 * `derivePropertyCode` in `src/features/properties/utils/display.ts`. */
export function deriveRequestCode(profileId: string): string {
  return `REQ-${profileId.slice(-4).toUpperCase()}`;
}

/** The confirmed viewing for a match, if the owner has picked one of the tenant's
 * proposed times. */
export function getConfirmedViewing(viewings: Viewing[]): Viewing | null {
  return viewings.find((v) => v.status === "confirmed") ?? null;
}

/** The tenant's still-open proposed times — not yet confirmed or cancelled. */
export function getPendingProposals(viewings: Viewing[]): Viewing[] {
  return viewings.filter((v) => v.status === "requested");
}

/**
 * Which of the four tabs — Searching, Matches, Viewing, Completed — a match belongs in,
 * derived from its status, its viewings, and whether a lease already exists for the same
 * property/tenant pair. `now` is injectable for testing.
 */
export function deriveMatchStage(
  match: PropertyMatch,
  viewings: Viewing[],
  hasLease: boolean,
  now: Date = new Date()
): JourneyStage {
  if (
    match.status === "rejected" ||
    match.status === "dismissed" ||
    match.leaseDecision === "declined"
  ) {
    return "closed";
  }

  if (match.status === "curated") return "searching";
  if (match.status === "interested") return "matches";

  // status === "approved" from here on.
  const confirmed = getConfirmedViewing(viewings);
  const viewingHasPassed = Boolean(
    confirmed?.scheduledAt && new Date(confirmed.scheduledAt) <= now
  );

  if (hasLease || match.leaseDecision === "confirmed") return "completed";
  if (viewingHasPassed) return "completed";
  return "viewing";
}

export function deriveStageCounts(matchStages: JourneyStage[]): StageCounts {
  const counts: StageCounts = {
    searching: 0,
    matches: 0,
    viewing: 0,
    completed: 0,
  };

  for (const stage of matchStages) {
    if (stage === "closed") continue;
    counts[stage] += 1;
  }

  return counts;
}
