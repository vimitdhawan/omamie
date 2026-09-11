"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMatchesAction } from "@/features/property-matches/actions";
import { MatchesTable } from "@/features/property-matches/components/matches-table";
import type { PropertyMatchWithProperty } from "@/features/property-matches/types";
import type { MatchStatus } from "@/features/property-matches/types";

interface MatchesClientProps {
  initialMatches: PropertyMatchWithProperty[];
  profileId: string;
}

const STATUS_OPTIONS: { label: string; value: MatchStatus | "all" }[] = [
  { label: "All statuses", value: "all" },
  { label: "Interested", value: "interested" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export function MatchesClient({
  initialMatches,
  profileId: _profileId,
}: MatchesClientProps) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [matches, setMatches] =
    useState<PropertyMatchWithProperty[]>(initialMatches);
  const [localSearch, setLocalSearch] = useState("");
  const [currentStatus, setCurrentStatus] = useState<MatchStatus | "all">(
    "all"
  );
  const [isPending, startTransition] = useTransition();

  const refetchMatches = useCallback(
    (status: MatchStatus | "all" | undefined, search: string | undefined) => {
      startTransition(async () => {
        const result = await getMatchesAction({
          status:
            status && status !== "all" ? (status as MatchStatus) : undefined,
          search: search || undefined,
        });
        setMatches(result);
      });
    },
    []
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      // Only search if 3+ characters or empty (reset)
      if (value.length >= 3 || value.length === 0) {
        debounceTimer.current = setTimeout(() => {
          refetchMatches(currentStatus, value);
        }, 500);
      }
    },
    [refetchMatches, currentStatus]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      const newStatus = (value || "all") as MatchStatus | "all";
      setCurrentStatus(newStatus);
      refetchMatches(newStatus, localSearch);
    },
    [refetchMatches, localSearch]
  );

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search by property name or location (min 3 characters)"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={currentStatus}
            onValueChange={(value) => handleStatusChange(value || "all")}
          >
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Showing info */}
      <div className="text-muted-foreground mb-4 flex items-center gap-2 text-sm">
        <span>📋</span>
        <span>Showing {matches.length} matches</span>
        {isPending && <Loader2 className="text-primary size-4 animate-spin" />}
      </div>

      {/* Matches View - with subtle pending state */}
      <div className={isPending ? "opacity-60 transition-opacity" : ""}>
        {matches.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border">
            <div className="text-center">
              <p className="text-muted-foreground text-[16px]">
                No matches found.
              </p>
            </div>
          </div>
        ) : (
          <MatchesTable matches={matches} />
        )}
      </div>
    </>
  );
}
