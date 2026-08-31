import { getAuthSession } from "@/lib/auth-session";
import { getProfile } from "@/features/profile/service";
import { Sidebar } from "@/features/dashboard/components/sidebar";
import { Topbar } from "@/features/dashboard/components/topbar";
import { Toaster } from "@/components/ui/sonner";
import { notFound, redirect } from "next/navigation";

export default async function AgentOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  const profile = await getProfile(session.profileId);
  if (!profile) {
    notFound();
  }

  return (
    <div className="bg-background min-h-svh lg:grid lg:grid-cols-[16rem_1fr]">
      <Sidebar profile={profile} />
      <div className="flex flex-col">
        <Topbar profile={profile} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
