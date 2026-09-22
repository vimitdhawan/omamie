import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { getPublishedPropertiesAction } from "@/features/properties/actions";
import { getMatchedPropertyIdsAction } from "@/features/property-matches/actions";
import { ExploreClient } from "./explore-client";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  const [properties, matchedPropertyIds] = await Promise.all([
    getPublishedPropertiesAction(),
    getMatchedPropertyIdsAction(),
  ]);

  return (
    <main className="flex-1 bg-white px-4 pt-6 pb-12">
      <div className="mx-auto max-w-[1200px]">
        <ExploreClient
          initialProperties={properties}
          matchedPropertyIds={matchedPropertyIds}
        />
      </div>
    </main>
  );
}
