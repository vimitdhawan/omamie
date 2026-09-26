"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table } from "@/components/ui/table";
import {
  DataTableHeader,
  DataTableBody,
  DataTablePagination,
} from "@/components/custom/data-table";
import type { Row } from "@/components/custom/data-table/types";
import { adminContactMessageColumns } from "./admin-contact-messages-columns";
import { ContactMessageDialog } from "./contact-message-dialog";
import { fetchCompletedContactMessagesAction } from "../actions";
import { MAX_COMPLETED_RANGE_DAYS } from "../schema";
import type { AdminContactMessage } from "../types";

const DAY_MS = 1000 * 60 * 60 * 24;

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface ColumnSort {
  id: string;
  desc: boolean;
}

export function AdminContactMessagesTable({
  openMessages,
}: {
  openMessages: AdminContactMessage[];
}) {
  const [tab, setTab] = React.useState<"open" | "completed">("open");
  const [sorting, setSorting] = React.useState<ColumnSort[]>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [selected, setSelected] = React.useState<AdminContactMessage | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const today = React.useMemo(() => new Date(), []);
  const todayValue = React.useMemo(() => toDateInputValue(today), [today]);

  function fromForTo(toValue: string): string {
    return toDateInputValue(
      new Date(new Date(toValue).getTime() - MAX_COMPLETED_RANGE_DAYS * DAY_MS)
    );
  }
  function toForFrom(fromValue: string): string {
    const capped = new Date(
      new Date(fromValue).getTime() + MAX_COMPLETED_RANGE_DAYS * DAY_MS
    );
    const cappedValue = toDateInputValue(capped);
    // Never push "To" past today, even if "From" + 92 days would land in the future.
    return cappedValue > todayValue ? todayValue : cappedValue;
  }

  const [rangeTo, setRangeTo] = React.useState(todayValue);
  const [rangeFrom, setRangeFrom] = React.useState(() => fromForTo(todayValue));
  const [completedMessages, setCompletedMessages] = React.useState<
    AdminContactMessage[]
  >([]);
  const [hasLoadedCompleted, setHasLoadedCompleted] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  // Each field can be picked freely for its own day, but the pair is always kept within the
  // 3-month cap: moving one edge that would widen the span past 92 days pulls the other edge
  // along with it rather than allowing an out-of-range query.
  const handleFromChange = (value: string) => {
    setRangeFrom(value);
    if (new Date(value) > new Date(rangeTo)) {
      setRangeTo(toForFrom(value));
    } else if (
      (new Date(rangeTo).getTime() - new Date(value).getTime()) / DAY_MS >
      MAX_COMPLETED_RANGE_DAYS
    ) {
      setRangeTo(toForFrom(value));
    }
  };

  const handleToChange = (value: string) => {
    setRangeTo(value);
    if (new Date(value) < new Date(rangeFrom)) {
      setRangeFrom(fromForTo(value));
    } else if (
      (new Date(value).getTime() - new Date(rangeFrom).getTime()) / DAY_MS >
      MAX_COMPLETED_RANGE_DAYS
    ) {
      setRangeFrom(fromForTo(value));
    }
  };

  const fetchCompleted = () => {
    startTransition(async () => {
      const result = await fetchCompletedContactMessagesAction(
        rangeFrom,
        rangeTo
      );
      if (result.errorMessage) {
        toast.error(result.errorMessage);
        return;
      }
      setCompletedMessages(result.messages ?? []);
      setHasLoadedCompleted(true);
      setPagination((old) => ({ ...old, pageIndex: 0 }));
    });
  };

  const data = tab === "open" ? openMessages : completedMessages;

  const sortedData = React.useMemo(() => {
    const rows = [...data];
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      rows.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[id];
        const bVal = (b as Record<string, unknown>)[id];
        if (aVal === bVal) return 0;
        if (aVal == null || bVal == null) return 0;
        const result = String(aVal) > String(bVal) ? 1 : -1;
        return desc ? -result : result;
      });
    }
    return rows;
  }, [data, sorting]);

  const paginatedData = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return sortedData.slice(start, start + pagination.pageSize);
  }, [sortedData, pagination]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table: any = {
    getAllColumns: () => adminContactMessageColumns,
    getHeaderGroups: () => [
      {
        id: "header",
        headers: adminContactMessageColumns.map((col, idx) => ({
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
          adminContactMessageColumns.map((col, cidx) => ({
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
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as "open" | "completed");
          setSorting([]);
          setPagination((old) => ({ ...old, pageIndex: 0 }));
        }}
      >
        <TabsList className="bg-primary/10">
          <TabsTrigger
            value="open"
            className="text-foreground hover:text-foreground data-active:bg-primary data-active:text-primary-foreground data-active:hover:text-primary-foreground font-semibold"
          >
            Open
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="text-foreground hover:text-foreground data-active:bg-primary data-active:text-primary-foreground data-active:hover:text-primary-foreground font-semibold"
          >
            Completed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "completed" && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <label className="text-muted-foreground text-xs font-medium">
              From
            </label>
            <Input
              type="date"
              value={rangeFrom}
              max={todayValue}
              onChange={(event) => handleFromChange(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-muted-foreground text-xs font-medium">
              To
            </label>
            <Input
              type="date"
              value={rangeTo}
              max={todayValue}
              onChange={(event) => handleToChange(event.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={fetchCompleted}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Fetch
          </Button>
          <p className="text-muted-foreground text-xs">
            Up to {MAX_COMPLETED_RANGE_DAYS} days at a time
          </p>
        </div>
      )}

      <div className="border-border overflow-x-auto rounded-lg border">
        <Table>
          <DataTableHeader table={table} />
          <DataTableBody
            table={table}
            emptyMessage={
              tab === "completed" && !hasLoadedCompleted
                ? "Pick a date range and load completed messages"
                : tab === "open"
                  ? "No open contact messages"
                  : "No completed messages in this range"
            }
            onRowClick={(row: Row) => {
              setSelected(row.original as AdminContactMessage);
              setDialogOpen(true);
            }}
          />
        </Table>
      </div>
      <DataTablePagination table={table} />

      <ContactMessageDialog
        message={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
