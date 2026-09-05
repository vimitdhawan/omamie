import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export default async function TenantsPage() {
  const session = await getAuthSession();
  if (!session?.profileId) redirect("/login");

  return (
    <div className="flex-1 space-y-8 p-8">
      <div>
        <h1 className="text-foreground text-[28px] font-bold">Tenants</h1>
        <p className="text-muted-foreground mt-2 text-[16px]">
          Manage tenant information and documents.
        </p>
      </div>
      <div className="border-border bg-card rounded-xl border p-12 text-center shadow-sm">
        <p className="text-muted-foreground">
          Tenant management coming soon...
        </p>
      </div>
    </div>
  );
}
