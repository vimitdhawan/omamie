import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export default async function SettingsProfilePage() {
  const session = await getAuthSession();
  if (!session?.profileId) redirect("/login");

  return (
    <div className="flex-1 space-y-8 p-8">
      <div>
        <h1 className="text-foreground text-[28px] font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2 text-[16px]">
          Manage your account preferences and profile.
        </p>
      </div>
      <div className="border-border bg-card rounded-xl border p-12 text-center shadow-sm">
        <p className="text-muted-foreground">Settings coming soon...</p>
      </div>
    </div>
  );
}
