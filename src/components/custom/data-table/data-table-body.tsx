import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DataTable, Row } from "./types";

interface DataTableBodyProps {
  table: DataTable;
  emptyMessage?: string;
  /**
   * Makes the whole row clickable (e.g. navigating to a detail page), while leaving
   * interactive elements inside the row (links, buttons, selects) to handle their own
   * clicks — those are excluded by checking the click target on the way up.
   */
  onRowClick?: (row: Row) => void;
}

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, select, textarea';

export function DataTableBody({
  table,
  emptyMessage = "No results found",
  onRowClick,
}: DataTableBodyProps) {
  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={table.getAllColumns().length}
            className="text-muted-foreground py-8 text-center"
          >
            {emptyMessage}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {rows.map((row) => (
        <TableRow
          key={row.id}
          onClick={
            onRowClick
              ? (event) => {
                  const target = event.target as HTMLElement;
                  if (target.closest(INTERACTIVE_SELECTOR)) return;
                  onRowClick(row);
                }
              : undefined
          }
          className={cn(
            "hover:!bg-primary/5 has-aria-expanded:!bg-primary/10 data-[state=selected]:!bg-primary/10",
            onRowClick && "cursor-pointer"
          )}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell
              key={cell.id}
              className={cell.column?.columnDef?.className}
            >
              {cell.column?.columnDef?.cell?.(cell.getContext()) || ""}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}
