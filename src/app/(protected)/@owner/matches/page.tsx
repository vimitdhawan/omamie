import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import {
  getMatchesAction,
  getMatchCountsAction,
} from "@/features/property-matches/actions";
import { MatchesClient } from "./matches-client";
import { MetricCard } from "@/features/owner/dashboard/components/metric-card";
import { MessageCircle } from "lucide-react";

export default async function MatchesPage() {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "owner") {
    redirect("/login");
  }

  // Fetch all matches on first load
  const initialMatches = await getMatchesAction();
  const counts = await getMatchCountsAction();

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-foreground text-[28px] leading-tight font-bold">
          Matches
        </h1>
        <p className="text-muted-foreground mt-2 text-[16px] leading-relaxed">
          Manage property matches and tenant interests
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<MessageCircle className="size-6" />}
          label="Total Matches"
          value={counts.all}
          bgColor="bg-primary/10"
          iconColor="text-primary"
        />
        <MetricCard
          icon={<MessageCircle className="size-6" />}
          label="Interested"
          value={counts.interested}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          icon={<MessageCircle className="size-6" />}
          label="Approved"
          value={counts.approved}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <MetricCard
          icon={<MessageCircle className="size-6" />}
          label="Rejected"
          value={counts.rejected}
          bgColor="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      {/* Client-side filtering and table */}
      <MatchesClient
        initialMatches={initialMatches}
        profileId={session.profileId}
      />
    </div>
  );
}
