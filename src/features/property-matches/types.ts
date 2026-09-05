export type MatchStatus = "interested" | "approved" | "rejected";
export type InitiatedBy = "tenant" | "agent";

export interface PropertyMatch {
  id: string;
  propertyId: string;
  tenantId: string;
  initiatedBy: InitiatedBy;
  status: MatchStatus;
  notes: string | null;
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
