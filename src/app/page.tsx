import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-session";

export default async function HomePage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "tenant") {
    redirect("/find-property");
  }

  // owner or admin
  redirect("/dashboard");
}
