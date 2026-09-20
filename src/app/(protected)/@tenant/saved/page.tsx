import Link from "next/link";
import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { listFavoritedIdsAction } from "@/features/favorites/actions";
import { getPropertiesByIdsAction } from "@/features/properties/actions";
import { getMatchedPropertyIdsAction } from "@/features/property-matches/actions";
import { PropertyExploreCard } from "@/features/properties/components/property-list/property-explore-card";

export const dynamic = "force-dynamic";

export default async function SavedPropertiesPage() {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  const favoritedPropertyIds = await listFavoritedIdsAction();
  const [properties, matchedPropertyIds] = await Promise.all([
    getPropertiesByIdsAction(favoritedPropertyIds),
    getMatchedPropertyIdsAction(),
  ]);

  const matchedSet = new Set(matchedPropertyIds);
  const favoritedSet = new Set(favoritedPropertyIds);

  return (
    <main className="flex-1 bg-white px-4 pt-6 pb-12">
      <div className="mx-auto max-w-[1200px]">
        {properties.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border text-center">
            <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
              <Heart className="size-6" />
            </div>
            <div>
              <p className="text-foreground text-base font-semibold">
                No saved properties yet
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Save listings you like while browsing to find them here later.
              </p>
            </div>
            <Link
              href="/explore"
              className={buttonVariants({ variant: "default" })}
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <PropertyExploreCard
                key={property.id}
                property={property}
                isFavorited={favoritedSet.has(property.id)}
                isInterested={matchedSet.has(property.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
