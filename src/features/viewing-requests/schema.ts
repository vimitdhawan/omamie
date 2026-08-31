import { z } from "zod";
import { VIEWING_REQUEST_STATUS_VALUES } from "./types";

/**
 * Schema for creating a viewing request
 */
export const createViewingRequestSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  message: z
    .string()
    .max(500, "Message must be less than 500 characters")
    .optional(),
});

/**
 * Schema for updating viewing request status
 */
export const viewingRequestStatusSchema = z.enum(VIEWING_REQUEST_STATUS_VALUES);

export type CreateViewingRequestData = z.infer<
  typeof createViewingRequestSchema
>;
