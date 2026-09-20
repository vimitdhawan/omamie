import { z } from "zod";

export const reviewDecisionSchema = z.object({
  propertyId: z.string().uuid(),
});

export type ReviewDecisionInput = z.infer<typeof reviewDecisionSchema>;
