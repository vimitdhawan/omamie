"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { Search, LayoutGrid, Table } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPES } from "../schema";
import type { PropertyStatus } from "../types";

type ViewType = "table" | "grid";

const STATUS_OPTIONS: { label: string; value: PropertyStatus | "all" }[] = [
  { label: "All statuses", value: "all" },
  { label: "Published", value: "active" },
  { label: "Draft", value: "pending" },
  { label: "Rented", value: "rented" },
];

export function PropertiesFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [localSearch, setLocalSearch] = useState(
    (searchParams.get("search") || "") as string
  );

  const currentStatus = (searchParams.get("status") || "all") as string;
  const currentType = (searchParams.get("type") || "all") as string;
  const currentView = (searchParams.get("view") || "table") as ViewType;

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

  const handleTypeChange = useCallback(
    (value: string | null) => {
      const val = value || "all";
      updateParams({ type: val === "all" ? null : val });
    },
    [updateParams]
  );

  const handleViewChange = useCallback(
    (view: ViewType) => {
      updateParams({ view: view === "table" ? null : view });
    },
    [updateParams]
  );

  const typeOptions = useMemo(
    () => [
      { label: "All types", value: "all" },
      ...Object.entries(PROPERTY_TYPES).map(([key, label]) => ({
        label,
        value: key,
      })),
    ],
    []
  );

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name or location"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Select
            value={currentType}
            onValueChange={(value) => handleTypeChange(value)}
          >
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentStatus}
            onValueChange={(value) => handleStatusChange(value)}
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

          <div className="border-border bg-card flex items-center gap-1 rounded-md border p-1">
            <button
              onClick={() => handleViewChange("table")}
              className={`rounded p-2 transition-colors ${
                currentView === "table"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table view"
            >
              <Table className="size-4" />
            </button>
            <button
              onClick={() => handleViewChange("grid")}
              className={`rounded p-2 transition-colors ${
                currentView === "grid"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
