"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import {
  DataTableHeader,
  DataTableBody,
  DataTablePagination,
} from "@/components/custom/data-table";
import type { Row } from "@/components/custom/data-table/types";
import { adminPropertyColumns } from "./admin-properties-columns";
import type { AdminPropertySummary } from "../types";
import type { PropertyStatus } from "@/features/properties/types";

const STATUS_OPTIONS: { label: string; value: PropertyStatus | "all" }[] = [
  { label: "All statuses", value: "all" },
  { label: "Published", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "In review", value: "review" },
  { label: "Rented", value: "rented" },
  { label: "Inactive", value: "inactive" },
];

interface ColumnSort {
  id: string;
  desc: boolean;
}

export function AdminPropertiesTable({
  properties,
}: {
  properties: AdminPropertySummary[];
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");
  const [sorting, setSorting] = React.useState<ColumnSort[]>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const filtered = React.useMemo(() => {
    return properties.filter((property) => {
      const matchesStatus = status === "all" || property.status === status;
      const term = search.toLowerCase();
      const matchesSearch =
        term === "" ||
        property.title.toLowerCase().includes(term) ||
        (property.location ?? "").toLowerCase().includes(term) ||
        (property.ownerName ?? "").toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [properties, status, search]);

  const sortedData = React.useMemo(() => {
    const data = [...filtered];
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      data.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[id];
        const bVal = (b as Record<string, unknown>)[id];
        if (aVal === bVal) return 0;
        if (aVal == null || bVal == null) return 0;
        const result = String(aVal) > String(bVal) ? 1 : -1;
        return desc ? -result : result;
      });
    }
    return data;
  }, [filtered, sorting]);

  const paginatedData = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return sortedData.slice(start, start + pagination.pageSize);
  }, [sortedData, pagination]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table: any = {
    getAllColumns: () => adminPropertyColumns,
    getHeaderGroups: () => [
      {
        id: "header",
        headers: adminPropertyColumns.map((col, idx) => ({
          id: col.id || `col-${idx}`,
          column: {
            columnDef: col,
            getCanSort: () => col.enableSorting !== false,
            getIsSorted: () => {
              const s = sorting.find((s) => s.id === (col.id || `col-${idx}`));
              return s ? (s.desc ? "desc" : "asc") : false;
            },
            getToggleSortingHandler: () => () => {
              setSorting((old) => {
                const sorted = old.find(
                  (s) => s.id === (col.id || `col-${idx}`)
                );
                if (sorted) {
                  if (sorted.desc) {
                    return old.filter((s) => s.id !== (col.id || `col-${idx}`));
                  }
                  return old.map((s) =>
                    s.id === (col.id || `col-${idx}`) ? { ...s, desc: true } : s
                  );
                }
                return [{ id: col.id || `col-${idx}`, desc: false }, ...old];
              });
            },
          },
          getContext: () => ({}),
        })),
      },
    ],
    getRowModel: () => ({
      rows: paginatedData.map((data, idx) => ({
        id: data.id,
        original: data,
        getVisibleCells: () =>
          adminPropertyColumns.map((col, cidx) => ({
            id: `${data.id}-${cidx}`,
            column: { columnDef: col },
            getContext: () => ({ row: { original: data, index: idx } }),
          })),
      })),
    }),
    getFilteredRowModel: () => ({ rows: sortedData }),
    getState: () => ({ pagination, sorting }),
    getPageCount: () => Math.ceil(sortedData.length / pagination.pageSize),
    getCanPreviousPage: () => pagination.pageIndex > 0,
    getCanNextPage: () =>
      pagination.pageIndex <
      Math.ceil(sortedData.length / pagination.pageSize) - 1,
    previousPage: () =>
      setPagination((old) => ({ ...old, pageIndex: old.pageIndex - 1 })),
    nextPage: () =>
      setPagination((old) => ({ ...old, pageIndex: old.pageIndex + 1 })),
    setPageIndex: (index: number) =>
      setPagination((old) => ({ ...old, pageIndex: index })),
    setPageSize: (size: number) =>
      setPagination((old) => ({ ...old, pageIndex: 0, pageSize: size })),
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search by title, location, or owner…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v || "all")}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All statuses" />
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

      <div className="border-border overflow-x-auto rounded-lg border">
        <Table>
          <DataTableHeader table={table} />
          <DataTableBody
            table={table}
            emptyMessage="No properties found"
            onRowClick={(row: Row) =>
              router.push(
                `/properties/${(row.original as AdminPropertySummary).id}`
              )
            }
          />
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
