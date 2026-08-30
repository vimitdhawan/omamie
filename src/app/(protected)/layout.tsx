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

  return session.role === "tenant" ? tenant : agentOwner;
}
