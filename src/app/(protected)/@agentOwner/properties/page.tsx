import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import {
  getPropertiesList,
  getPropertiesCountByStatus,
} from "@/features/properties/repository";
import { PropertiesClient } from "@/features/properties/components/properties-client";
import { MetricCard } from "@/features/agents/dashboard/components/metric-card";

export default async function PropertiesPage({
  params: _params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.profileId) {
    redirect("/login");
  }

  // Fetch all properties on first load
  const initialProperties = await getPropertiesList(session.profileId);
  const counts = await getPropertiesCountByStatus(session.profileId);

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-foreground text-[28px] leading-tight font-bold">
          Properties
        </h1>
        <p className="text-muted-foreground mt-2 text-[16px] leading-relaxed">
          Manage your rental listings and their status
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Building2 className="size-6" />}
          label="Total Properties"
          value={counts.all}
          bgColor="bg-primary/10"
          iconColor="text-primary"
        />
        <MetricCard
          icon={<Building2 className="size-6" />}
          label="Published"
          value={counts.active}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <MetricCard
          icon={<Building2 className="size-6" />}
          label="Drafts"
          value={counts.draft}
          bgColor="bg-yellow-50"
          iconColor="text-yellow-600"
        />
        <MetricCard
          icon={<Building2 className="size-6" />}
          label="Rented"
          value={counts.rented}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
      </div>

      {/* Client-side filtering and table/grid - instant updates, no full page reload */}
      <PropertiesClient
        initialProperties={initialProperties}
        profileId={session.profileId}
      />

      {/* Empty state when no properties exist at all */}
      {initialProperties.length === 0 && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4 text-[16px]">
              No properties found.
            </p>
            <Link
              href="/properties/create"
              className="text-primary inline-flex items-center gap-2 text-[16px] font-semibold hover:underline"
            >
              <Plus className="size-5" />
              Create your first property
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
