import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { getTenantJourneyAction } from "@/features/search-journey/actions";
import { MatchesClient } from "./matches-client";

export const dynamic = "force-dynamic";

export default async function TenantMatchesPage() {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  const journey = await getTenantJourneyAction();

  return (
    <main className="flex-1 bg-white px-4 pt-6 pb-12">
      <div className="mx-auto max-w-[1100px]">
        <MatchesClient journey={journey} />
      </div>
    </main>
  );
}
