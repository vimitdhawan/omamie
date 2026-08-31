import { z } from "zod";

/**
 * Schema for saving/unsaving a property
 */
export const savePropertySchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
});

export type SavePropertyData = z.infer<typeof savePropertySchema>;
