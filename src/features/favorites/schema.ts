import { z } from "zod";

export const toggleFavoriteSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID"),
  propertyId: z.string().uuid("Invalid property ID"),
});
