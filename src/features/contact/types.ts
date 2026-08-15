import type { ContactSubject } from "./schema";

export type ContactInput = {
  fullName: string;
  email: string;
  phone: string | null;
  subject: ContactSubject;
  message: string;
};

export type Contact = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  subject: ContactSubject;
  message: string;
  createdAt: string;
};
