"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { MatchCard } from "@/features/property-matches/components/match-card";
import { RequirementsSummaryCard } from "@/features/requirements/components/requirements-summary-card";
import type { PropertyMatchWithProperty } from "@/features/property-matches/types";
import type { TenantRequirements } from "@/features/requirements/types";

interface MatchesClientProps {
  matches: PropertyMatchWithProperty[];
  requirements: TenantRequirements | null;
}

function CreateSearchRequestCard() {
  return (
    <Card className="bg-surface-soft/50 flex h-fit flex-col items-start gap-3 border-gray-200 p-6">
      <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
        <Search className="size-6" />
      </div>
      <h3 className="text-foreground text-lg font-semibold">
        Can&apos;t find the perfect place?
      </h3>
      <p className="text-muted-foreground text-sm">
        Tell us what you&apos;re looking for and we&apos;ll curate property
        matches for you.
      </p>
      <Link
        href="/find-property"
        className={buttonVariants({ variant: "default", className: "mt-2" })}
      >
        Create Search Request
        <ArrowRight className="size-4" />
      </Link>
    </Card>
  );
}

export function MatchesClient({ matches, requirements }: MatchesClientProps) {
  // `property_matches.status` has no terminal "completed"/"rented" outcome yet
  // (only interested/approved/rejected). Once that concept lands in the schema,
  // filter matches by that status here instead of always showing the empty state.
  const completedMatches: PropertyMatchWithProperty[] = [];

  return (
    <Tabs defaultValue="interest" className="mt-8 w-full">
      <TabsList variant="line">
        <TabsTrigger value="interest">Property Interest</TabsTrigger>
        <TabsTrigger value="requests">Property Search Requests</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>

      <TabsContent value="interest" className="mt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {matches.length === 0 ? (
              <p className="text-muted-foreground py-12 text-center text-sm">
                No property interests yet. Explore listings to get started.
              </p>
            ) : (
              matches.map((match) => <MatchCard key={match.id} match={match} />)
            )}
          </div>
          <CreateSearchRequestCard />
        </div>
      </TabsContent>

      <TabsContent value="requests" className="mt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {requirements === null ? (
              <p className="text-muted-foreground py-12 text-center text-sm">
                No search request yet.
              </p>
            ) : (
              <RequirementsSummaryCard requirements={requirements} />
            )}
          </div>
          <CreateSearchRequestCard />
        </div>
      </TabsContent>

      <TabsContent value="completed" className="mt-6">
        {completedMatches.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            No completed requests yet.
          </p>
        ) : (
          <div className="space-y-4">
            {completedMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
