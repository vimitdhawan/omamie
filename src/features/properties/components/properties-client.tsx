"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Search, LayoutGrid, Table, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPropertiesListAction } from "../actions";
import { PropertiesTable } from "./properties-table";
import { PropertiesGrid } from "./properties-grid";
import { PROPERTY_TYPES } from "../schema";
import type { Property, PropertyStatus, PropertyType } from "../types";

type ViewType = "table" | "grid";

const STATUS_OPTIONS: { label: string; value: PropertyStatus | "all" }[] = [
  { label: "All statuses", value: "all" },
  { label: "Published", value: "active" },
  { label: "Draft", value: "pending" },
  { label: "Rented", value: "rented" },
];

interface PropertiesClientProps {
  initialProperties: Property[];
  profileId: string;
}

export function PropertiesClient({
  initialProperties,
  profileId,
}: PropertiesClientProps) {
  const searchParams = useSearchParams();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize from URL params, fallback to defaults
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [localSearch, setLocalSearch] = useState(
    (searchParams.get("search") || "") as string
  );
  const [currentStatus, setCurrentStatus] = useState(
    (searchParams.get("status") || "all") as string
  );
  const [currentType, setCurrentType] = useState(
    (searchParams.get("type") || "all") as string
  );
  const [currentView, setCurrentView] = useState(
    (searchParams.get("view") || "table") as ViewType
  );

  const [isPending, startTransition] = useTransition();

  // Fetch filtered data on any filter change
  const refetchProperties = useCallback(
    (
      status: string | undefined,
      type: string | undefined,
      search: string | undefined
    ) => {
      startTransition(async () => {
        const result = await getPropertiesListAction(profileId, {
          status:
            status && status !== "all" ? (status as PropertyStatus) : undefined,
          propertyType:
            type && type !== "all" ? (type as PropertyType) : undefined,
          search: search || undefined,
        });
        setProperties(result);
      });
    },
    [profileId]
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
          refetchProperties(currentStatus, currentType, value);
        }, 500);
      }
    },
    [refetchProperties, currentStatus, currentType]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      setCurrentStatus(value);
      refetchProperties(value, currentType, localSearch);
    },
    [refetchProperties, currentType, localSearch]
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      setCurrentType(value);
      refetchProperties(currentStatus, value, localSearch);
    },
    [refetchProperties, currentStatus, localSearch]
  );

  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view);
  }, []);

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
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search by name or location (min 3 characters)"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Select
              value={currentType}
              onValueChange={(v) => handleTypeChange(v || "all")}
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
              onValueChange={(v) => handleStatusChange(v || "all")}
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

      {/* Showing info */}
      <div className="text-muted-foreground mb-4 flex items-center gap-2 text-sm">
        <span>📋</span>
        <span>Showing {properties.length} properties</span>
        {isPending && <Loader2 className="text-primary size-4 animate-spin" />}
      </div>

      {/* Properties View - with subtle pending state */}
      <div className={isPending ? "opacity-60 transition-opacity" : ""}>
        {properties.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-[16px]">
                No properties found.
              </p>
            </div>
          </div>
        ) : currentView === "table" ? (
          <PropertiesTable properties={properties} />
        ) : (
          <PropertiesGrid properties={properties} />
        )}
      </div>
    </>
  );
}
