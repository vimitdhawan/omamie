import { getAuthSession } from "@/lib/auth-session";
import { AppError } from "@/lib/errors";

/**
 * Every admin domain's service.ts must call this first — it is the one place that checks
 * the caller is actually an admin before a repository's service-role client bypasses RLS.
 */
export async function requireAdmin(): Promise<string> {
  const session = await getAuthSession();
  if (!session?.profileId) {
    throw new AppError("UNAUTHORIZED", "You must be signed in");
  }
  if (session.role !== "admin") {
    throw new AppError("FORBIDDEN", "Admin access required");
  }
  return session.profileId;
}
