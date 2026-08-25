import type { UserRole } from "@/features/auth/schema";

export { type UserRole, USER_ROLES } from "@/features/auth/schema";

export type CachedAuthData = {
  role: UserRole;
  profileId: string;
};

export type AuthSession = {
  profileId: string;
  role: UserRole;
};
