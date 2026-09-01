import { z } from "zod";

// Schema for replying to contact messages
export const replyEmailSchema = z.object({
  to: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(254, "Email must be less than 254 characters"),
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(200, "Subject must be less than 200 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be less than 5000 characters"),
  originalMessageId: z.string().uuid("Invalid message ID"),
});

export type ReplyEmailFormData = z.infer<typeof replyEmailSchema>;

// Schema for property rejection with reason
export const propertyRejectionSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  reason: z
    .string()
    .trim()
    .min(10, "Rejection reason must be at least 10 characters")
    .max(500, "Rejection reason must be less than 500 characters")
    .optional(),
});

export type PropertyRejectionData = z.infer<typeof propertyRejectionSchema>;

// Action state types for server actions
export type ReplyEmailActionState = {
  errors?: {
    to?: string[];
    subject?: string[];
    message?: string[];
    originalMessageId?: string[];
  };
  errorMessage?: string;
  success?: boolean;
};

export type PropertyActionState = {
  errorMessage?: string;
  success?: boolean;
};
