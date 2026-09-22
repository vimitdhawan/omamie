export type MatchStatus =
  "curated" | "dismissed" | "interested" | "approved" | "rejected";
export type InitiatedBy = "tenant" | "owner" | "system";
export type LeaseDecision = "pending" | "confirmed" | "declined";

export interface PropertyMatch {
  id: string;
  propertyId: string;
  tenantId: string;
  propertyOwnerId: string;
  initiatedBy: InitiatedBy;
  status: MatchStatus;
  notes: string | null;
  requestedMoveInDate: string | null;
  requestedMoveOutDate: string | null;
  /** 0-100, set only on engine-curated matches (`initiatedBy === "system"`). */
  matchScore: number | null;
  curatedAt: string | null;
  leaseDecision: LeaseDecision | null;
  leaseDecisionAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyMatchWithProperty extends PropertyMatch {
  property: {
    id: string;
    title: string;
    location: string;
    monthlyRent: number;
  };
  /** First name of the tenant, populated for the owner's view only (see
   * getMatchesAction). Never sourced from `profiles` — comes from tenant_profile. */
  tenantFirstName?: string;
}

export interface PropertyMatchWithTenant extends PropertyMatch {
  tenant: {
    id: string;
    email: string;
    fullName: string | null;
  };
}

export interface CreateMatchInput {
  propertyId: string;
  tenantId: string;
  notes?: string;
  requestedMoveInDate?: string;
  requestedMoveOutDate?: string;
}

export interface UpdateMatchStatusInput {
  matchId: string;
  status: MatchStatus;
  notes?: string;
}

/** Owner-facing counts only — curated/dismissed rows are tenant-only suggestions the
 * tenant hasn't acted on yet, so they never reach the owner's queue. */
export interface MatchCounts {
  all: number;
  interested: number;
  approved: number;
  rejected: number;
}

export interface MatchFilter {
  status?: MatchStatus;
  search?: string;
  propertyId?: string;
}
