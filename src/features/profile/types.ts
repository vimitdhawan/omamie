import type { UserRole } from "@/types/auth";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};

export type UserProfileForAuth = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};
