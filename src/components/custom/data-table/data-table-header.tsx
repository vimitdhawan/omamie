import {
  TableHead,
  TableHeader as TableHeaderUI,
  TableRow,
} from "@/components/ui/table";
import type { DataTable } from "./types";

interface DataTableHeaderProps {
  table: DataTable;
}

export function DataTableHeader({ table }: DataTableHeaderProps) {
  return (
    <TableHeaderUI className="bg-primary/10 sticky top-0 z-10">
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead
              key={header.id}
              onClick={
                header.column?.getCanSort?.()
                  ? header.column?.getToggleSortingHandler?.()
                  : undefined
              }
              className={
                header.column?.getCanSort?.()
                  ? "cursor-pointer select-none"
                  : ""
              }
            >
              {header.column?.columnDef?.header}
              {{
                asc: " ↑",
                desc: " ↓",
              }[header.column?.getIsSorted?.() as string] ?? null}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeaderUI>
  );
}
