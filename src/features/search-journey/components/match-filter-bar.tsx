"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MatchFilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
}

/** Search over whichever tab is active, cloned from the icon-inside-input pattern in
 * `properties-client.tsx`. */
export function MatchFilterBar({
  search,
  onSearchChange,
}: MatchFilterBarProps) {
  return (
    <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
      <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        placeholder="Search by area or property"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="pl-9"
      />
    </div>
  );
}
