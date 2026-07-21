import Link from "next/link";
import { getCurrentUser } from "@/features/auth/service";

export default async function DashboardPage() {
  const { profile, user } = await getCurrentUser();

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        Welcome, {profile?.full_name ?? user?.email}
      </h1>
      <p className="text-muted-foreground mt-2">
        Role: {profile?.role ?? "tenant"}
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profile?.role !== "tenant" && (
          <Link href="/list-property" className="block">
            <div className="bg-card ring-foreground/10 hover:ring-primary/50 rounded-xl p-6 ring-1 transition-colors">
              <h2 className="font-medium">List Property</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Create a new property listing
              </p>
            </div>
          </Link>
        )}
        <Link href="/dashboard/properties" className="block">
          <div className="bg-card ring-foreground/10 hover:ring-primary/50 rounded-xl p-6 ring-1 transition-colors">
            <h2 className="font-medium">My Properties</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage your property listings
            </p>
          </div>
        </Link>
        <Link href="/dashboard/messages" className="block">
          <div className="bg-card ring-foreground/10 hover:ring-primary/50 rounded-xl p-6 ring-1 transition-colors">
            <h2 className="font-medium">Messages</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              View your conversations
            </p>
          </div>
        </Link>
        <Link href="/dashboard/settings" className="block">
          <div className="bg-card ring-foreground/10 hover:ring-primary/50 rounded-xl p-6 ring-1 transition-colors">
            <h2 className="font-medium">Settings</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Update your profile and preferences
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
