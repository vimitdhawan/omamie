export type ViewingStatus =
  "requested" | "confirmed" | "completed" | "cancelled";

export interface Viewing {
  id: string;
  matchId: string;
  status: ViewingStatus;
  /** ISO datetime. For a `requested` row this is the tenant's proposed time; for a
   * `confirmed` row it's the time the owner picked. */
  scheduledAt: string | null;
  hostName: string | null;
  accessNotes: string | null;
  createdAt: string;
  updatedAt: string;
}
