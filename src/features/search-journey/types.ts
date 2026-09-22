import type { PropertyMatchWithProperty } from "@/features/property-matches/types";
import type { Viewing } from "@/features/viewings/types";
import type {
  TenantProfile,
  TenantRequirements,
} from "@/features/requirements/types";
import type { LeaseWithProperty } from "@/features/leases/types";
import type { Property } from "@/features/properties/types";

/**
 * Which of the four tabs a match belongs in. Never stored — always derived from
 * `property_matches.status`, its viewings, and whether a `leases` row exists.
 * `"closed"` covers a rejected match, a dismissed suggestion, or a declined final
 * decision — it has no tab of its own, so a closed match simply drops off the page.
 */
export type JourneyStage =
  "searching" | "matches" | "viewing" | "completed" | "closed";

export interface MatchJourney {
  match: PropertyMatchWithProperty;
  /** Full listing (image, beds/baths, amenities, …) for the match's property, when it's
   * still readable — a property that has since gone inactive simply has `property: null`
   * here, and the card falls back to the narrow `match.property` summary. */
  property: Property | null;
  /** Every viewing row for this match — proposed (`requested`), confirmed, cancelled. */
  viewings: Viewing[];
  stage: JourneyStage;
}

export interface StageCounts {
  searching: number;
  matches: number;
  viewing: number;
  completed: number;
}

export interface TenantJourney {
  profile: TenantProfile | null;
  requirements: TenantRequirements | null;
  requestCode: string | null;
  matches: MatchJourney[];
  counts: StageCounts;
  lease: LeaseWithProperty | null;
}
