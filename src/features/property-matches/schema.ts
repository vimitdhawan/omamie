import { z } from "zod";

export const matchStatusSchema = z.enum(["interested", "approved", "rejected"]);

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
  status: matchStatusSchema,
  notes: z.string().optional(),
});

export const matchFilterSchema = z.object({
  status: matchStatusSchema.optional(),
  search: z.string().optional(),
  propertyId: z.string().uuid().optional(),
});
