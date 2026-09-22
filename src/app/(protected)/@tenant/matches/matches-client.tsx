"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequirementsEditDrawer } from "@/features/requirements/components/requirements-edit-drawer";
import { SearchSummaryPanel } from "@/features/search-journey/components/search-summary-panel";
import { CuratedMatchCard } from "@/features/search-journey/components/curated-match-card";
import { ViewingFlowPanel } from "@/features/search-journey/components/viewing-flow-panel";
import { CompletedPanel } from "@/features/search-journey/components/completed-panel";
import { MatchFilterBar } from "@/features/search-journey/components/match-filter-bar";
import type {
  MatchJourney,
  TenantJourney,
} from "@/features/search-journey/types";

interface MatchesClientProps {
  journey: TenantJourney;
}

const TABS = [
  { value: "searching", label: "Searching" },
  { value: "matches", label: "Matches" },
  { value: "viewing", label: "Viewing" },
  { value: "completed", label: "Completed" },
] as const;

type StageValue = (typeof TABS)[number]["value"];

function sortByBestMatch(matches: MatchJourney[]) {
  return [...matches].sort(
    (a, b) => (b.match.matchScore ?? 0) - (a.match.matchScore ?? 0)
  );
}

export function MatchesClient({ journey }: MatchesClientProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<StageValue>("searching");
  const { profile, requirements, requestCode, matches, counts } = journey;

  const refresh = () => router.refresh();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const byTerm = term
      ? matches.filter(
          (mj) =>
            mj.match.property.title.toLowerCase().includes(term) ||
            mj.match.property.location.toLowerCase().includes(term)
        )
      : matches;
    return sortByBestMatch(byTerm.filter((mj) => mj.stage !== "closed"));
  }, [matches, search]);

  const byStage = {
    searching: filtered.filter((mj) => mj.stage === "searching"),
    matches: filtered.filter((mj) => mj.stage === "matches"),
    viewing: filtered.filter((mj) => mj.stage === "viewing"),
    completed: filtered.filter((mj) => mj.stage === "completed"),
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as StageValue)}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
              <TabsList className="bg-primary/10 shrink-0">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.value;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={cn(
                        "gap-1.5 font-semibold",
                        isActive &&
                          "!bg-primary !text-primary-foreground hover:!text-primary-foreground"
                      )}
                    >
                      {tab.label}
                      <Badge
                        variant="secondary"
                        className={cn(
                          "h-4 min-w-4 px-1 text-[10px]",
                          isActive && "!bg-white/25 !text-white"
                        )}
                      >
                        {counts[tab.value]}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <MatchFilterBar search={search} onSearchChange={setSearch} />
            </div>

            <TabsContent value="searching" className="mt-4">
              {byStage.searching.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  {requirements
                    ? "Our match engine is scanning active listings for you — check back shortly."
                    : "Create a search request and we'll start scanning active listings for you."}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {byStage.searching.map((mj) => (
                    <CuratedMatchCard
                      key={mj.match.id}
                      journey={mj}
                      onChanged={refresh}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="matches" className="mt-4">
              {byStage.matches.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  No properties you&apos;re interested in yet. Browse{" "}
                  <Link href="/explore" className="text-primary font-medium">
                    Explore
                  </Link>{" "}
                  to send interest directly.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {byStage.matches.map((mj) => (
                    <CuratedMatchCard
                      key={mj.match.id}
                      journey={mj}
                      onChanged={refresh}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="viewing" className="mt-4 space-y-3">
              {byStage.viewing.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  No viewings in progress.
                </p>
              ) : (
                byStage.viewing.map((mj) => (
                  <ViewingFlowPanel
                    key={mj.match.id}
                    journey={mj}
                    onChanged={refresh}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-4 space-y-3">
              {byStage.completed.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  No completed viewings yet.
                </p>
              ) : (
                byStage.completed.map((mj) => (
                  <CompletedPanel
                    key={mj.match.id}
                    journey={mj}
                    onChanged={refresh}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
        <SearchSummaryPanel
          counts={counts}
          requirements={requirements}
          requestCode={requestCode}
          onOpenDrawer={() => setEditOpen(true)}
        />
      </div>

      <RequirementsEditDrawer
        profile={profile}
        requirements={requirements}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
