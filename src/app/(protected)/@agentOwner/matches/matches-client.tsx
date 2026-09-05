"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MatchesTable } from "@/features/property-matches/components/matches-table";
import type { PropertyMatchWithProperty } from "@/features/property-matches/types";

interface MatchesClientProps {
  initialMatches: PropertyMatchWithProperty[];
  initialStatus?: string;
  initialSearch?: string;
}

export function MatchesClient({
  initialMatches,
  initialStatus,
  initialSearch,
}: MatchesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [localSearch, setLocalSearch] = useState(initialSearch || "");

  const currentStatus = (initialStatus || "all") as string;

  const updateParams = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      router.push(`?${newParams.toString()}`);
    },
    [searchParams, router]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        updateParams({ search: value || null });
      }, 500);
    },
    [updateParams]
  );

  const handleStatusChange = useCallback(
    (value: string | null) => {
      const val = value || "all";
      updateParams({ status: val === "all" ? null : val });
    },
    [updateParams]
  );

  const statusOptions = [
    { label: "All statuses", value: "all" },
    { label: "Interested", value: "interested" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search by property name or location"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={currentStatus}
          onValueChange={(value) => handleStatusChange(value)}
        >
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-muted-foreground flex items-center gap-1 text-sm">
        <span>📋</span>
        Showing {initialMatches.length} matches
      </div>

      <MatchesTable matches={initialMatches} />
    </div>
  );
}
