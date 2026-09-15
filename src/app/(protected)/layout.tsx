import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-session";

export default async function ProtectedLayout({
  tenant,
  agentOwner,
}: {
  tenant: React.ReactNode;
  agentOwner: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role === "tenant") return tenant;
  if (session.role === "agent" || session.role === "owner") return agentOwner;

  // An unrecognized role means the session cookie is malformed — never fall
  // through to a default slot, since that would grant one role's UI to a
  // session we can't actually validate.
  redirect("/login");
}
