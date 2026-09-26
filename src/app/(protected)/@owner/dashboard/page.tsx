import Link from "next/link";
import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/features/owner/dashboard/service";
import { MetricCard } from "@/features/owner/dashboard/components/metric-card";
import { EmptyState } from "@/features/owner/dashboard/components/empty-state";
import { RevenueChart } from "@/features/owner/dashboard/components/revenue-chart";
import { ActivityFeed } from "@/features/owner/dashboard/components/activity-feed";
import { Home, Clock, KeyRound, Building2, Plus, DoorOpen } from "lucide-react";

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session?.profileId) {
    redirect("/login");
  }

  const data = await getDashboardData(session.profileId);

  if (data.metrics.totalProperties === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <h1 className="text-foreground text-[21px] font-bold">
            No properties yet
          </h1>
          <p className="text-muted-foreground mt-2 text-[14px] leading-relaxed">
            Start by creating a listing to see your occupancy, revenue, and
            tenant interest here.
          </p>
          <Link
            href="/properties/create"
            className="bg-primary text-primary-foreground mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold hover:opacity-90"
          >
            <Plus className="size-4" />
            Create your first listing
          </Link>
        </div>
      </div>
    );
  }

  const vacantProperties = data.metrics.activeListings;

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-[28px] leading-tight font-bold">
            Good morning.
          </h1>
          <p className="text-muted-foreground mt-2 text-[16px] leading-relaxed">
            Here&apos;s what&apos;s happening with your properties today.
          </p>
        </div>
        <Link
          href="/properties/create"
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold hover:opacity-90"
        >
          <Plus className="size-4" />
          Add Property
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          icon={<Building2 className="size-8" />}
          label="Total Properties"
          value={data.metrics.totalProperties}
          bgColor="bg-gray-50"
          iconColor="text-gray-600"
        />
        <MetricCard
          icon={<KeyRound className="size-8" />}
          label="Occupied"
          value={data.metrics.rentedProperties}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <MetricCard
          icon={<DoorOpen className="size-8" />}
          label="Vacant"
          value={vacantProperties}
          bgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <MetricCard
          icon={<Home className="size-8" />}
          label="Monthly Revenue"
          value={`$${data.overview.monthlyRevenue.toLocaleString()}`}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          icon={<Clock className="size-8" />}
          label="Pending Requests"
          value={data.metrics.pendingRequests}
          bgColor="bg-blue-100"
          iconColor="text-blue-700"
        />
      </div>

      {/* Needs your attention */}
      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-foreground text-[21px] font-bold">
            Needs your attention
            {data.pendingRequests.length > 0 && (
              <span className="bg-primary/10 text-primary ml-2 rounded-full px-2.5 py-0.5 text-[13px] font-semibold">
                {data.pendingRequests.length}
              </span>
            )}
          </h3>
          <Link
            href="/matches"
            className="text-primary text-[16px] font-semibold hover:underline"
          >
            View All
          </Link>
        </div>
        {data.pendingRequests.length === 0 ? (
          <EmptyState message="No pending requests at the moment." />
        ) : (
          <div className="space-y-3">
            {data.pendingRequests.map((request) => (
              <Link
                key={request.id}
                href="/matches"
                className="border-border bg-muted/30 hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
              >
                <div>
                  <p className="text-foreground text-[15px] font-semibold">
                    {request.propertyTitle}
                  </p>
                  <p className="text-muted-foreground mt-1 text-[13px]">
                    {request.tenantName} is interested
                  </p>
                </div>
                <span className="text-primary text-[14px] font-semibold">
                  Review →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Property overview + Revenue */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="text-foreground mb-4 text-[21px] font-bold">
            Property overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[14px]">
                Occupancy Rate
              </span>
              <span className="text-foreground text-[16px] font-semibold">
                {data.overview.occupancyRate}%
              </span>
            </div>
            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${data.overview.occupancyRate}%` }}
              />
            </div>
            <p className="text-muted-foreground text-[13px]">
              {data.metrics.rentedProperties} occupied · {vacantProperties}{" "}
              vacant
            </p>
          </div>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-foreground text-[21px] font-bold">Revenue</h3>
            <span className="text-muted-foreground text-[13px]">
              ${data.overview.monthlyRevenue.toLocaleString()} / mo
            </span>
          </div>
          {data.revenueByProperty.length === 0 ? (
            <EmptyState message="No rented properties yet." />
          ) : (
            <RevenueChart data={data.revenueByProperty} />
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        <h3 className="text-foreground mb-4 text-[21px] font-bold">
          Recent activity
        </h3>
        <ActivityFeed items={data.recentActivity} />
      </div>
    </div>
  );
}
