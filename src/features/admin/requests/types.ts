import type { MatchStatus } from "@/features/property-matches/types";

export type AdminMatchSummary = {
  id: string;
  status: MatchStatus;
  createdAt: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string | null;
  tenantId: string;
  tenantName: string | null;
  tenantEmail: string | null;
};

export type AdminMatchFilter = {
  status?: MatchStatus;
};
