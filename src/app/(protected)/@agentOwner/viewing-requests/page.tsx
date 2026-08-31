import { Suspense } from "react";
import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { ViewingRequestsClient } from "./ViewingRequestsClient";
import {
  getViewingRequestsAction,
  getViewingRequestCountsAction,
} from "@/features/viewing-requests/actions";

export default async function ViewingRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const session = await getAuthSession();
  if (!session?.profileId) {
    redirect("/login");
  }

  const params = await searchParams;
  const status = params.status;
  const search = params.search;

  // Fetch initial data
  const [requests, counts] = await Promise.all([
    getViewingRequestsAction({ status, search }),
    getViewingRequestCountsAction(),
  ]);

  return (
    <div className="flex-1 space-y-8 p-8">
      <div>
        <h1 className="text-foreground text-[28px] font-bold">
          Viewing Requests
        </h1>
        <p className="text-muted-foreground mt-2 text-[16px]">
          Review and coordinate incoming viewing requests from prospective
          tenants.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ViewingRequestsClient
          initialRequests={requests}
          initialCounts={counts}
          initialStatus={status}
          initialSearch={search}
        />
      </Suspense>
    </div>
  );
}
