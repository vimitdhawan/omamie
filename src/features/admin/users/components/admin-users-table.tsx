"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table } from "@/components/ui/table";
import {
  DataTableHeader,
  DataTableBody,
  DataTablePagination,
} from "@/components/custom/data-table";
import { adminUserColumns } from "./admin-users-columns";
import type { AdminUserSummary } from "../types";
import type { UserRole } from "@/features/auth/schema";

const ROLE_TABS: { label: string; value: UserRole | "all" }[] = [
  { label: "All Users", value: "all" },
  { label: "Tenants", value: "tenant" },
  { label: "Owners", value: "owner" },
  { label: "Agents", value: "agent" },
  { label: "Admins", value: "admin" },
];

interface ColumnSort {
  id: string;
  desc: boolean;
}

export function AdminUsersTable({ users }: { users: AdminUserSummary[] }) {
  const [tab, setTab] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [sorting, setSorting] = React.useState<ColumnSort[]>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const filtered = React.useMemo(() => {
    return users.filter((user) => {
      const matchesTab = tab === "all" || user.role === tab;
      const term = search.toLowerCase();
      const matchesSearch =
        term === "" ||
        (user.fullName ?? "").toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);
      return matchesTab && matchesSearch;
    });
  }, [users, tab, search]);

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
    getAllColumns: () => adminUserColumns,
    getHeaderGroups: () => [
      {
        id: "header",
        headers: adminUserColumns.map((col, idx) => ({
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
          adminUserColumns.map((col, cidx) => ({
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {ROLE_TABS.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative sm:w-72">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search users, emails…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border-border overflow-x-auto rounded-lg border">
        <Table>
          <DataTableHeader table={table} />
          <DataTableBody table={table} emptyMessage="No users found" />
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
