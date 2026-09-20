"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { adminMatchColumns } from "./admin-requests-columns";
import type { AdminMatchSummary } from "../types";
import type { MatchStatus } from "@/features/property-matches/types";

const STATUS_OPTIONS: { label: string; value: MatchStatus | "all" }[] = [
  { label: "All statuses", value: "all" },
  { label: "Interested", value: "interested" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

interface ColumnSort {
  id: string;
  desc: boolean;
}

export function AdminRequestsTable({
  matches,
}: {
  matches: AdminMatchSummary[];
}) {
  const router = useRouter();
  const [status, setStatus] = React.useState<string>("all");
  const [sorting, setSorting] = React.useState<ColumnSort[]>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const filtered = React.useMemo(() => {
    return matches.filter(
      (match) => status === "all" || match.status === status
    );
  }, [matches, status]);

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
    getAllColumns: () => adminMatchColumns,
    getHeaderGroups: () => [
      {
        id: "header",
        headers: adminMatchColumns.map((col, idx) => ({
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
          adminMatchColumns.map((col, cidx) => ({
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

      <div className="border-border overflow-x-auto rounded-lg border">
        <Table>
          <DataTableHeader table={table} />
          <DataTableBody
            table={table}
            emptyMessage="No matching requests found"
            onRowClick={(row: Row) =>
              router.push(
                `/properties/${(row.original as AdminMatchSummary).propertyId}`
              )
            }
          />
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
