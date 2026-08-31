"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface PropertySearchBarProps {
  initialLocation?: string;
  onSearch: (location: string) => void;
}

export function PropertySearchBar({
  initialLocation = "",
  onSearch,
}: PropertySearchBarProps) {
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(location);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl">
      <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by location (e.g., Berlin, Kreuzberg)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button type="submit" size="sm" className="rounded-full">
          Search
        </Button>
      </div>
    </form>
  );
}
