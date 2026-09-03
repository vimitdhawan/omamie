import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import {
  getPropertiesList,
  getPropertiesCountByStatus,
} from "@/features/properties/repository";
import { MetricCard } from "@/features/agents/dashboard/components/metric-card";
import { PropertiesFilters } from "@/features/properties/components/properties-filters";
import { PropertiesTable } from "@/features/properties/components/properties-table";
import { PropertiesGrid } from "@/features/properties/components/properties-grid";
import { Button } from "@/components/ui/button";
import type { PropertyStatus, PropertyType } from "@/features/properties/types";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    type?: string;
    view?: string;
  }>;
}) {
  const session = await getAuthSession();
  if (!session?.profileId) {
    redirect("/login");
  }

  const params = await searchParams;
  const view = (params.view || "table") as "table" | "grid";

  const properties = await getPropertiesList(session.profileId, {
    status: params.status ? (params.status as PropertyStatus) : undefined,
    propertyType: params.type ? (params.type as PropertyType) : undefined,
    search: params.search,
  });

  const counts = await getPropertiesCountByStatus(session.profileId);

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-foreground text-[28px] leading-tight font-bold">
            Properties
          </h1>
          <p className="text-muted-foreground mt-2 text-[16px] leading-relaxed">
            Manage your rental listings and their status
          </p>
        </div>
        <Link href="/properties/create">
          <Button className="gap-2">
            <Plus className="size-5" />
            Add property
          </Button>
        </Link>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Building2 className="size-6" />}
          label="Total Properties"
          value={counts.all}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
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
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Filters */}
      <PropertiesFilters />

      {/* Showing info */}
      <div className="text-muted-foreground flex items-center gap-1 text-sm">
        <span>📋</span>
        Showing {properties.length} of {counts.all} properties
      </div>

      {/* Properties View */}
      {properties.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground text-[16px]">
              No properties found.
            </p>
            <Link
              href="/properties/create"
              className="text-primary mt-4 inline-flex items-center gap-2 text-[16px] font-semibold hover:underline"
            >
              <Plus className="size-5" />
              Create your first property
            </Link>
          </div>
        </div>
      ) : view === "table" ? (
        <PropertiesTable properties={properties} />
      ) : (
        <PropertiesGrid properties={properties} />
      )}
    </div>
  );
}
