import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-session";

export default async function ProtectedLayout({
  tenant,
  owner,
  admin,
}: {
  tenant: React.ReactNode;
  owner: React.ReactNode;
  admin: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role === "tenant") return tenant;
  if (session.role === "owner") return owner;
  if (session.role === "admin") return admin;

  // An unrecognized role means the session cookie is malformed — never fall
  // through to a default slot, since that would grant one role's UI to a
  // session we can't actually validate.
  redirect("/login");
}
