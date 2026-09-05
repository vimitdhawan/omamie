import { z } from "zod";

export const matchStatusSchema = z.enum(["interested", "approved", "rejected"]);

export const createMatchSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  tenantId: z.string().uuid("Invalid tenant ID"),
  notes: z.string().optional(),
});

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
