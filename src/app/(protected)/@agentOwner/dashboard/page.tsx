import Link from "next/link";
import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/features/agents/dashboard/service";
import { MetricCard } from "@/features/agents/dashboard/components/metric-card";
import { EmptyState } from "@/features/agents/dashboard/components/empty-state";
import { Home, Clock, Calendar, Building2, MoreVertical } from "lucide-react";

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session?.profileId) {
    redirect("/login");
  }

  const data = await getDashboardData(session.profileId);

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
              subtitle={
                data.metrics.activeListingsChange > 0
                  ? `+${data.metrics.activeListingsChange} this month`
                  : undefined
              }
              subtitleColor="text-blue-600 font-semibold"
              bgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <MetricCard
              icon={<Clock className="size-8" />}
              label="Pending Requests"
              value={data.metrics.pendingRequests}
              subtitle={
                data.metrics.pendingRequestsUrgent > 0
                  ? `${data.metrics.pendingRequestsUrgent} need attention`
                  : undefined
              }
              subtitleColor="text-red-600 font-semibold"
              bgColor="bg-blue-100"
              iconColor="text-blue-700"
            />
            <MetricCard
              icon={<Calendar className="size-8" />}
              label="Upcoming Viewings"
              value={data.metrics.upcomingViewings}
              subtitle={data.metrics.nextViewing || "No viewings scheduled"}
              subtitleColor="text-muted-foreground"
              bgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <MetricCard
              icon={<Building2 className="size-8" />}
              label="Total Properties"
              value={data.metrics.totalProperties}
              subtitle={`${data.metrics.totalPropertiesActive} active`}
              subtitleColor="text-muted-foreground"
              bgColor="bg-gray-50"
              iconColor="text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Pending Requests + Upcoming Viewings */}
      <div className="space-y-8">
        {/* Pending Requests */}
        <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-foreground text-[21px] font-bold">
              Pending Requests
            </h3>
            <Link
              href="/viewing-requests?status=pending"
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
                <div
                  key={request.id}
                  className="border-border bg-muted/30 hover:bg-muted/50 flex items-start justify-between rounded-lg border p-4 transition-colors"
                >
                  <div className="flex-1">
                    <a
                      href={`/viewing-requests/${request.id}`}
                      className="block"
                    >
                      <p className="text-foreground text-[15px] font-semibold hover:underline">
                        {request.title}
                      </p>
                      <p className="text-muted-foreground mt-1 text-[13px]">
                        {request.requester} • {request.date} at {request.time}
                      </p>
                    </a>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <button className="rounded border border-blue-500 px-3 py-1.5 text-[13px] font-medium text-blue-600 transition-colors hover:bg-blue-50">
                      Accept
                    </button>
                    <button className="rounded px-3 py-1.5 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-100">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Viewings */}
        <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-foreground text-[21px] font-bold">
              Upcoming Viewings
            </h3>
            <Link
              href="/viewing-requests?status=accepted"
              className="text-primary text-[16px] font-semibold hover:underline"
            >
              View All
            </Link>
          </div>
          {data.upcomingViewings.length === 0 ? (
            <EmptyState message="No viewings scheduled." />
          ) : (
            <div className="space-y-3">
              {data.upcomingViewings.map((viewing) => (
                <div
                  key={viewing.id}
                  className="border-border hover:bg-muted/30 group flex items-start justify-between rounded-lg border p-4 transition-colors"
                >
                  <a
                    href={`/viewing-requests/${viewing.id}`}
                    className="flex flex-1 items-start gap-4"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <span className="text-sm font-bold">
                        {new Date(viewing.date).getDate()}
                      </span>
                      <span className="text-xs font-medium uppercase">
                        {new Date(viewing.date).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground text-[15px] font-semibold hover:underline">
                        {viewing.propertyTitle}
                      </p>
                      <p className="text-muted-foreground mt-1 text-[13px]">
                        {viewing.time} • {viewing.requesterName}
                      </p>
                    </div>
                  </a>
                  <button className="text-muted-foreground hover:text-foreground p-2 opacity-0 transition-all group-hover:opacity-100">
                    <MoreVertical className="size-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
