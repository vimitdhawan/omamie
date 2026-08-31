import { cookies } from "next/headers";
import type { AuthSession, UserRole } from "@/types/auth";

const ROLE_BASED_DEFAULTS: Record<UserRole, string> = {
  tenant: "/find-property",
  agent: "/properties",
  owner: "/properties",
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
    return JSON.parse(session) as AuthSession;
  } catch {
    return null;
  }
}

export async function deleteAuthSession() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
}
