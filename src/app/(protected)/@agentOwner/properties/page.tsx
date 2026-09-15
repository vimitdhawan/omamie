import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, KeyRound, PencilLine, Plus } from "lucide-react";
import { listProperties } from "@/features/properties/service";
import { deriveStatusCounts } from "@/features/properties/utils/display";
import { PropertiesClient } from "@/features/properties/components/property-list/properties-client";
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
  // The parent layout already dispatches by role, but this page owns
  // sensitive listing data, so it re-checks rather than trusting that
  // dispatch alone.
  if (session.role !== "agent" && session.role !== "owner") {
    redirect("/login");
  }

  // Fetch all properties on first load. Counts are derived from this same
  // list rather than a second query — see below.
  const initialProperties = await listProperties(session.profileId);
  const counts = deriveStatusCounts(initialProperties);

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

      {/* Status Cards — the listing lifecycle, in order. A total is already implied by the
          "Showing N properties" line below, so it earns no card of its own. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: <PencilLine className="size-6" />,
            label: "Drafts",
            value: counts.draft,
            bgColor: "bg-yellow-50",
            iconColor: "text-yellow-600",
          },
          {
            icon: <Clock className="size-6" />,
            label: "In review",
            value: counts.review,
            bgColor: "bg-orange-50",
            iconColor: "text-orange-600",
          },
          {
            icon: <CheckCircle2 className="size-6" />,
            label: "Published",
            value: counts.active,
            bgColor: "bg-green-50",
            iconColor: "text-green-600",
          },
          {
            icon: <KeyRound className="size-6" />,
            label: "Rented",
            value: counts.rented,
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
          },
        ].map((metric) => (
          <MetricCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            bgColor={metric.bgColor}
            iconColor={metric.iconColor}
          />
        ))}
      </div>

      {/* Client-side filtering and table/grid - instant updates, no full page reload */}
      <PropertiesClient initialProperties={initialProperties} />

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
