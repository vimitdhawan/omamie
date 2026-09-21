import Link from "next/link";
import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/features/owner/dashboard/service";
import { MetricCard } from "@/features/owner/dashboard/components/metric-card";
import { EmptyState } from "@/features/owner/dashboard/components/empty-state";
import { Home, Clock, KeyRound, Building2, Plus } from "lucide-react";

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

  return (
    <div className="flex-1 space-y-8 p-8">
      <div>
        <h1 className="text-foreground text-[28px] leading-tight font-bold">
          Good morning.
        </h1>
        <p className="text-muted-foreground mt-2 text-[16px] leading-relaxed">
          Here&apos;s what&apos;s happening with your properties today.
        </p>
      </div>

      {/* Top Row: Overview + Metrics */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Overview */}
        <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="text-foreground mb-4 text-[21px] font-bold">
            Overview
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

            <div className="flex items-center justify-between pt-4">
              <span className="text-muted-foreground text-[14px]">
                Total Revenue (MTD)
              </span>
              <span className="text-foreground text-[16px] font-semibold">
                ${data.overview.monthlyRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Card */}
        <div className="border-border bg-card rounded-xl border p-4 shadow-sm">
          <h3 className="text-foreground mb-2.5 text-[14px] font-bold">
            Metrics
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            <MetricCard
              icon={<Home className="size-8" />}
              label="Active Listings"
              value={`${data.metrics.activeListings}`}
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
            <MetricCard
              icon={<KeyRound className="size-8" />}
              label="Rented"
              value={data.metrics.rentedProperties}
              bgColor="bg-green-50"
              iconColor="text-green-600"
            />
            <MetricCard
              icon={<Building2 className="size-8" />}
              label="Total Properties"
              value={data.metrics.totalProperties}
              bgColor="bg-gray-50"
              iconColor="text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-foreground text-[21px] font-bold">
            Pending Requests
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
                className="border-border bg-muted/30 hover:bg-muted/50 block rounded-lg border p-4 transition-colors"
              >
                <p className="text-foreground text-[15px] font-semibold">
                  {request.propertyTitle}
                </p>
                <p className="text-muted-foreground mt-1 text-[13px]">
                  {request.tenantName} is interested
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
