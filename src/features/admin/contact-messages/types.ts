import type { ContactSubject } from "@/features/contact/schema";

export type ContactMessageStatus = "open" | "completed";

export type AdminContactMessage = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  subject: ContactSubject;
  message: string;
  createdAt: string;
  status: ContactMessageStatus;
  resolutionNote: string | null;
  resolvedAt: string | null;
};

export type AdminContactMessageFilter = {
  status: ContactMessageStatus;
  from?: string;
  to?: string;
};
