import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import {
  getMatchesAction,
  getMatchCountsAction,
} from "@/features/property-matches/actions";
import { MatchesClient } from "./matches-client";

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    search?: string;
  }>;
}) {
  const session = await getAuthSession();
  if (
    !session?.profileId ||
    (session.role !== "agent" && session.role !== "owner")
  ) {
    redirect("/login");
  }

  const params = await searchParams;
  const matches = await getMatchesAction({
    status:
      (params.status as "interested" | "approved" | "rejected" | undefined) ||
      undefined,
    search: params.search,
  });
  const counts = await getMatchCountsAction();

  return (
    <div className="flex-1 space-y-8 p-8">
      <div>
        <h1 className="text-[28px] font-bold">Matches</h1>
        <p className="text-muted-foreground mt-2 text-[16px]">
          Manage property matches and tenant interests
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Total Matches</p>
          <p className="mt-2 text-2xl font-bold">{counts.all}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Interested</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {counts.interested}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Approved</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {counts.approved}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Rejected</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {counts.rejected}
          </p>
        </div>
      </div>

      <MatchesClient
        initialMatches={matches}
        initialStatus={params.status}
        initialSearch={params.search}
      />
    </div>
  );
}
