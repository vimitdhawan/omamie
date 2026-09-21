import { cookies } from "next/headers";
import { z } from "zod";
import { roleEnum } from "@/features/auth/schema";
import type { AuthSession, UserRole } from "@/types/auth";

const authSessionSchema = z.object({
  profileId: z.string().min(1),
  role: roleEnum,
});

const ROLE_BASED_DEFAULTS: Record<UserRole, string> = {
  tenant: "/find-property",
  owner: "/properties/create",
  admin: "/dashboard",
};

export function getRoleBasedRedirectPath(role: UserRole): string {
  return ROLE_BASED_DEFAULTS[role];
}

export async function setAuthSession(profileId: string, role: UserRole) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session: AuthSession = { profileId, role };
  const cookieStore = await cookies();

  cookieStore.set("auth_session", JSON.stringify(session), {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("auth_session")?.value;
  if (!session) return null;

  try {
    const parsed = authSessionSchema.safeParse(JSON.parse(session));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function deleteAuthSession() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
}
