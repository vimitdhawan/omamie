import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-session";

export default async function ProtectedLayout({
  tenant,
  agentOwner,
  admin,
}: {
  tenant: React.ReactNode;
  agentOwner: React.ReactNode;
  admin: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role === "admin") return admin;
  if (session.role === "tenant") return tenant;
  return agentOwner;
}
