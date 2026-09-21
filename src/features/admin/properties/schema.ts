import { z } from "zod";

export const reviewDecisionSchema = z.object({
  propertyId: z.string().uuid(),
});

export type ReviewDecisionInput = z.infer<typeof reviewDecisionSchema>;

export const rejectDecisionSchema = z.object({
  propertyId: z.string().uuid(),
  reason: z.string().trim().min(1, "Please explain what's missing"),
});

export type RejectDecisionInput = z.infer<typeof rejectDecisionSchema>;
