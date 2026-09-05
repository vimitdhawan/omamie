import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { DataTable } from "./types";

interface DataTableBodyProps {
  table: DataTable;
  emptyMessage?: string;
}

export function DataTableBody({
  table,
  emptyMessage = "No results found",
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
          className="hover:!bg-primary/5 has-aria-expanded:!bg-primary/10 data-[state=selected]:!bg-primary/10"
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {cell.column?.columnDef?.cell?.(cell.getContext()) || ""}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}
