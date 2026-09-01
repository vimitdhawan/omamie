import Link from "next/link";
import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/features/dashboard/service";
import { MetricCard } from "@/features/dashboard/components/metric-card";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session?.profileId) {
    redirect("/login");
  }

  const data = await getDashboardData(session.profileId);

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-foreground text-[28px] leading-tight font-bold">
            Good morning.
          </h1>
          <p className="text-muted-foreground mt-2 text-[16px] leading-relaxed">
            Here&apos;s what&apos;s happening with your properties today.
          </p>
        </div>
        <Link href="/properties/create">
          <Button className="gap-2">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Quick Listing
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon="home"
          iconBgColor="bg-primary/10 text-primary"
          label="Active Listings"
          value={data.metrics.activeListings}
          subtitle={`+${data.metrics.activeListingsChange} this month`}
          subtitleColor="text-primary"
        />
        <MetricCard
          icon="pending_actions"
          iconBgColor="bg-destructive/10 text-destructive"
          label="Pending Requests"
          value={data.metrics.pendingRequests}
          subtitle={`${data.metrics.pendingRequestsUrgent} need attention`}
          subtitleColor="text-destructive"
        />
        <MetricCard
          icon="event"
          iconBgColor="bg-secondary/10 text-secondary"
          label="Upcoming Viewings"
          value={data.metrics.upcomingViewings}
          subtitle={data.metrics.nextViewing || "No viewings scheduled"}
          subtitleColor="text-muted-foreground"
        />
        <MetricCard
          icon="domain"
          iconBgColor="bg-muted text-muted-foreground"
          label="Total Properties"
          value={data.metrics.totalProperties}
          subtitle={`${data.metrics.totalPropertiesActive} active`}
          subtitleColor="text-muted-foreground"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content - 2/3 */}
        <div className="space-y-8 lg:col-span-2">
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
              <div className="space-y-2">
                {data.pendingRequests.map((request) => (
                  <a
                    key={request.id}
                    href={`/viewing-requests/${request.id}`}
                    className="border-border hover:bg-muted/50 block flex items-start justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="text-foreground text-[16px] font-semibold">
                        {request.title}
                      </p>
                      <p className="text-muted-foreground text-[14px]">
                        {request.requester} • {request.date} at {request.time}
                      </p>
                    </div>
                  </a>
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
              <div className="space-y-2">
                {data.upcomingViewings.map((viewing) => (
                  <a
                    key={viewing.id}
                    href={`/viewing-requests/${viewing.id}`}
                    className="border-border hover:bg-muted/50 block flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="bg-primary/10 text-primary flex h-12 w-12 flex-col items-center justify-center rounded-lg">
                      <span className="text-sm font-bold">
                        {new Date(viewing.date).getDate()}
                      </span>
                      <span className="text-xs uppercase">
                        {new Date(viewing.date).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground text-[16px] font-semibold">
                        {viewing.propertyTitle}
                      </p>
                      <p className="text-muted-foreground text-[14px]">
                        {viewing.time} • {viewing.requesterName}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - 1/3 */}
        <div className="space-y-8 lg:col-span-1">
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

          {/* Recent Activity */}
          <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
            <h3 className="text-foreground mb-4 text-[21px] font-bold">
              Recent Activity
            </h3>
            {data.recentActivity.length === 0 ? (
              <EmptyState message="No recent activity." />
            ) : (
              <ul className="space-y-4">
                {data.recentActivity.map((activity) => (
                  <li key={activity.id} className="flex gap-2">
                    <span
                      className={`material-symbols-outlined mt-1 text-${activity.iconColor}`}
                    >
                      {activity.icon}
                    </span>
                    <div>
                      <p className="text-foreground text-[14px]">
                        {activity.title}
                      </p>
                      <p className="text-muted-foreground text-[13px]">
                        {activity.timestamp}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
