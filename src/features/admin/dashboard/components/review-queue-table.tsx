"use client";

import * as React from "react";
import { Table } from "@/components/ui/table";
import {
  DataTableHeader,
  DataTableBody,
  DataTablePagination,
} from "@/components/custom/data-table";
import { reviewQueueColumns } from "./review-queue-columns";
import { ReviewQueueContext } from "./review-queue-context";
import type { AdminPropertySummary } from "../../properties/types";

interface ColumnSort {
  id: string;
  desc: boolean;
}

export function ReviewQueueTable({
  properties,
}: {
  properties: AdminPropertySummary[];
}) {
  const [removedIds, setRemovedIds] = React.useState<Set<string>>(new Set());
  const [sorting, setSorting] = React.useState<ColumnSort[]>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const visible = React.useMemo(
    () => properties.filter((p) => !removedIds.has(p.id)),
    [properties, removedIds]
  );

  const sortedData = React.useMemo(() => {
    const data = [...visible];
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
  }, [visible, sorting]);

  const paginatedData = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return sortedData.slice(start, start + pagination.pageSize);
  }, [sortedData, pagination]);

  const onResolved = React.useCallback((propertyId: string) => {
    setRemovedIds((prev) => new Set(prev).add(propertyId));
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table: any = {
    getAllColumns: () => reviewQueueColumns,
    getHeaderGroups: () => [
      {
        id: "header",
        headers: reviewQueueColumns.map((col, idx) => ({
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
          reviewQueueColumns.map((col, cidx) => ({
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

  if (visible.length === 0) {
    return (
      <div className="border-border flex min-h-[160px] items-center justify-center rounded-lg border">
        <p className="text-muted-foreground text-sm">
          No properties are waiting for review.
        </p>
      </div>
    );
  }

  return (
    <ReviewQueueContext.Provider value={{ onResolved }}>
      <div className="space-y-4">
        <div className="border-border overflow-x-auto rounded-lg border">
          <Table>
            <DataTableHeader table={table} />
            <DataTableBody
              table={table}
              emptyMessage="No properties are waiting for review"
            />
          </Table>
        </div>
        <DataTablePagination table={table} />
      </div>
    </ReviewQueueContext.Provider>
  );
}
