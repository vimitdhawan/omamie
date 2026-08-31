import { z } from "zod";

/**
 * Viewing Request Validation Schemas
 *
 * Enforces:
 * - Required fields and formats
 * - Date/time validations
 * - Email format
 * - Phone number optional format
 * - Status transitions
 */

export const viewingRequestStatusSchema = z.enum([
  "pending",
  "accepted",
  "declined",
  "cancelled",
  "completed",
]);

export const createViewingRequestSchema = z
  .object({
    propertyId: z.string().uuid("Invalid property ID"),
    requesterName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters")
      .trim(),
    requesterEmail: z
      .string()
      .email("Invalid email address")
      .max(255, "Email must not exceed 255 characters")
      .toLowerCase()
      .trim(),
    requesterPhone: z
      .string()
      .max(20, "Phone number must not exceed 20 characters")
      .trim()
      .optional()
      .nullable(),
    requestedDate: z.string().date("Invalid date format (YYYY-MM-DD)"),
    requestedTimeStart: z.string().time("Invalid time format (HH:MM)"),
    requestedTimeEnd: z.string().time("Invalid time format (HH:MM)"),
    notes: z
      .string()
      .max(1000, "Notes must not exceed 1000 characters")
      .trim()
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      // Validate that end time is after start time
      const start = new Date(`2000-01-01T${data.requestedTimeStart}`);
      const end = new Date(`2000-01-01T${data.requestedTimeEnd}`);
      return end > start;
    },
    {
      message: "End time must be after start time",
      path: ["requestedTimeEnd"],
    }
  )
  .refine(
    (data) => {
      // Validate that requested date is not in the past
      const requestedDate = new Date(data.requestedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return requestedDate >= today;
    },
    {
      message: "Requested date cannot be in the past",
      path: ["requestedDate"],
    }
  );

export const updateViewingRequestStatusSchema = z.object({
  requestId: z.string().uuid("Invalid request ID"),
  status: viewingRequestStatusSchema,
});

export const viewingRequestFilterSchema = z.object({
  status: viewingRequestStatusSchema.optional(),
  search: z.string().trim().optional(),
  propertyId: z.string().uuid("Invalid property ID").optional(),
});

// Type inference
export type CreateViewingRequestInput = z.infer<
  typeof createViewingRequestSchema
>;
export type UpdateViewingRequestStatusInput = z.infer<
  typeof updateViewingRequestStatusSchema
>;
export type ViewingRequestFilter = z.infer<typeof viewingRequestFilterSchema>;
