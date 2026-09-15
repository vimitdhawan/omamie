"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, LayoutGrid, Table } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertiesTable } from "./properties-table";
import { PropertiesGrid } from "./properties-grid";
import { PropertyListContext } from "./property-row-actions";
import { PROPERTY_TYPES } from "../../schema";
import type { Property, PropertyStatus } from "../../types";

type ViewType = "table" | "grid";

const STATUS_OPTIONS: { label: string; value: PropertyStatus | "all" }[] = [
  { label: "All statuses", value: "all" },
  { label: "Published", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "In review", value: "review" },
  { label: "Rented", value: "rented" },
];

interface PropertiesClientProps {
  initialProperties: Property[];
}

export function PropertiesClient({ initialProperties }: PropertiesClientProps) {
  const searchParams = useSearchParams();
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Initialize from URL params, fallback to defaults
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

  // Client-side filtering of already-loaded properties
  const filteredProperties = useMemo(() => {
    return initialProperties.filter((property) => {
      if (deletedIds.has(property.id)) return false;
      const matchesStatus =
        currentStatus === "all" || property.status === currentStatus;
      const matchesType =
        currentType === "all" || property.propertyType === currentType;
      const matchesSearch =
        localSearch === "" ||
        property.title.toLowerCase().includes(localSearch.toLowerCase()) ||
        property.location?.toLowerCase().includes(localSearch.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [initialProperties, currentStatus, currentType, localSearch, deletedIds]);

  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setCurrentStatus(value);
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setCurrentType(value);
  }, []);

  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view);
  }, []);

  const listContext = useMemo(
    () => ({
      onDeleted: (propertyId: string) => {
        setDeletedIds((prev) => new Set([...prev, propertyId]));
      },
    }),
    []
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
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-muted-foreground text-xs font-medium">
              Search
            </label>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search by name or location"
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-xs font-medium">
                Property Type
              </label>
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
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-xs font-medium">
                Status
              </label>
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
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground text-xs font-medium">
                View
              </label>
              <div className="border-border bg-card flex items-center gap-1 rounded-md border">
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
      </div>

      {/* Showing info */}
      <div className="text-muted-foreground mb-4 flex items-center gap-2 text-sm">
        <span>📋</span>
        <span>
          Showing {filteredProperties.length} of {initialProperties.length}{" "}
          properties
        </span>
      </div>

      {/* Properties View */}
      {filteredProperties.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground text-[16px]">
              No properties found.
            </p>
          </div>
        </div>
      ) : (
        <PropertyListContext.Provider value={listContext}>
          {currentView === "table" ? (
            <PropertiesTable properties={filteredProperties} />
          ) : (
            <PropertiesGrid properties={filteredProperties} />
          )}
        </PropertyListContext.Provider>
      )}
    </>
  );
}
