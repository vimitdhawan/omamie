import type { UserRole } from "@/features/auth/schema";

export type AdminUserSummary = {
  id: string;
  fullName: string | null;
  email: string;
  role: UserRole;
  createdAt: string;
  propertyCount: number;
};

export type AdminUserFilter = {
  role?: UserRole;
  search?: string;
};
