import { ClipboardList, Building2, Users, MessagesSquare } from "lucide-react";
import { getDashboardSummary } from "@/features/admin/dashboard/service";
import { MetricCard } from "@/features/agents/dashboard/components/metric-card";
import { ReviewQueueTable } from "@/features/admin/dashboard/components/review-queue-table";

export default async function AdminDashboardPage() {
  const { counts, reviewQueue } = await getDashboardSummary();

  return (
    <div className="flex-1 space-y-8 p-8">
      <div>
        <h1 className="text-foreground text-[28px] leading-tight font-bold">
          Good morning
        </h1>
        <p className="text-muted-foreground mt-2 text-[16px] leading-relaxed">
          Here&apos;s what&apos;s happening across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<ClipboardList className="size-6" />}
          label="Pending Reviews"
          value={counts.pendingReview}
          bgColor="bg-orange-50"
          iconColor="text-orange-600"
        />
        <MetricCard
          icon={<Building2 className="size-6" />}
          label="Active Listings"
          value={counts.activeListings}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <MetricCard
          icon={<MessagesSquare className="size-6" />}
          label="Open Requests"
          value={counts.openRequests}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          icon={<Users className="size-6" />}
          label="Active Users"
          value={counts.activeUsers}
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground text-xl font-semibold">
            Review Queue
          </h2>
        </div>
        <ReviewQueueTable properties={reviewQueue} />
      </div>
    </div>
  );
}
