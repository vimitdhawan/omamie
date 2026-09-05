"use client";

import * as React from "react";
import { Table } from "@/components/ui/table";
import {
  DataTableHeader,
  DataTableBody,
  DataTablePagination,
} from "@/components/custom/data-table";
import { propertyColumns } from "./properties-columns";
import type { Property } from "../types";

interface PropertiesTableProps {
  properties: Property[];
}

interface ColumnSort {
  id: string;
  desc: boolean;
}

export function PropertiesTable({ properties }: PropertiesTableProps) {
  const [sorting, setSorting] = React.useState<ColumnSort[]>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const sortedData = React.useMemo(() => {
    const data = [...properties];
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      data.sort((a: Property, b: Property) => {
        const aVal = (a as Record<string, unknown>)[id] as unknown;
        const bVal = (b as Record<string, unknown>)[id] as unknown;
        if (aVal === bVal) return 0;
        if (aVal == null || bVal == null) return 0;
        const result = String(aVal) > String(bVal) ? 1 : -1;
        return desc ? -result : result;
      });
    }
    return data;
  }, [properties, sorting]);

  const paginatedData = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return sortedData.slice(start, start + pagination.pageSize);
  }, [sortedData, pagination]);

  const table: Record<string, unknown> = {
    getAllColumns: () => propertyColumns,
    getHeaderGroups: () => [
      {
        id: "header",
        headers: propertyColumns.map((col, idx) => ({
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
          propertyColumns.map((col, cidx) => ({
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
      <div className="border-border overflow-hidden rounded-lg border">
        <Table>
          <DataTableHeader table={table} />
          <DataTableBody table={table} emptyMessage="No properties found" />
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
