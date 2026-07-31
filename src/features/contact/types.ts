import type { ContactSubject } from "./schema";

export type ContactMessage = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: ContactSubject;
  message: string;
  created_at: string;
};

export type ContactInsert = {
  full_name: string;
  email: string;
  phone?: string | null;
  subject: ContactSubject;
  message: string;
};

export type ContactResult = {
  data: ContactMessage | null;
  error: { message: string } | null;
};
