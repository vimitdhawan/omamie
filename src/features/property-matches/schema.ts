import { z } from "zod";

export const matchStatusSchema = z.enum([
  "curated",
  "dismissed",
  "interested",
  "approved",
  "rejected",
]);

/** The subset an owner may ever set explicitly via `updateMatchStatusAction`. */
export const ownerSettableMatchStatusSchema = z.enum(["approved", "rejected"]);

export const leaseDecisionSchema = z.enum(["confirmed", "declined"]);

export const createMatchSchema = z
  .object({
    propertyId: z.string().uuid("Invalid property ID"),
    tenantId: z.string().uuid("Invalid tenant ID"),
    notes: z.string().optional(),
    requestedMoveInDate: z.string().date().optional(),
    requestedMoveOutDate: z.string().date().optional(),
  })
  .refine(
    (data) =>
      !data.requestedMoveInDate ||
      !data.requestedMoveOutDate ||
      data.requestedMoveOutDate > data.requestedMoveInDate,
    {
      message: "Move-out date must be after the move-in date",
      path: ["requestedMoveOutDate"],
    }
  );

export const updateMatchStatusSchema = z.object({
  matchId: z.string().uuid("Invalid match ID"),
  status: ownerSettableMatchStatusSchema,
  notes: z.string().optional(),
});

export const matchFilterSchema = z.object({
  status: matchStatusSchema.optional(),
  search: z.string().optional(),
  propertyId: z.string().uuid().optional(),
});

export const matchIdSchema = z.string().uuid("Invalid match ID");

export const decideLeaseSchema = z.object({
  matchId: matchIdSchema,
  decision: leaseDecisionSchema,
});
