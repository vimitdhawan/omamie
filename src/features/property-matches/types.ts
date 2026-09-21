export type MatchStatus = "interested" | "approved" | "rejected";
export type InitiatedBy = "tenant" | "owner";

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
