import { z } from "zod";

export const contactSubjectEnum = z.enum([
  "listing",
  "finding",
  "partnership",
  "general",
  "feedback",
  "issue",
  "other",
]);

export type ContactSubject = z.infer<typeof contactSubjectEnum>;

export const CONTACT_SUBJECT_OPTIONS: {
  value: ContactSubject;
  label: string;
}[] = [
  { value: "listing", label: "Listing a Property" },
  { value: "finding", label: "Finding a Property" },
  { value: "partnership", label: "Partnership Opportunity" },
  { value: "general", label: "General Question" },
  { value: "feedback", label: "Feedback or Suggestion" },
  { value: "issue", label: "Report an Issue" },
  { value: "other", label: "Other" },
];

export const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(254, "Email must be less than 254 characters"),
  phone: z
    .string()
    .trim()
    .max(30, "Phone must be less than 30 characters")
    .optional()
    .or(z.literal("")),
  subject: contactSubjectEnum,
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type ContactFormInput = z.input<typeof contactSchema>;

export type ContactActionState = {
  errors?: {
    fullName?: string[];
    email?: string[];
    phone?: string[];
    subject?: string[];
    message?: string[];
  };
  errorMessage?: string;
  success?: boolean;
};
