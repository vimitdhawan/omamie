export interface Row {
  id: string;
  original: unknown;
  getVisibleCells(): Cell[];
}

export interface Cell {
  id: string;
  column: {
    columnDef: ColumnDef;
  };
  getContext(): CellContext;
}

export interface CellContext {
  row: {
    original: unknown;
    index: number;
  };
}

export interface ColumnDef {
  id?: string;
  header?: string | React.ReactNode;
  cell?: (context: CellContext) => React.ReactNode;
  enableSorting?: boolean;
}

export interface HeaderGroup {
  id: string;
  headers: Header[];
}

export interface Header {
  id: string;
  column: {
    columnDef: ColumnDef;
    getCanSort?: () => boolean;
    getIsSorted?: () => boolean | string;
    getToggleSortingHandler?: () => (() => void) | undefined;
  };
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface TableState {
  pagination: PaginationState;
  sorting: Array<{ id: string; desc: boolean }>;
}

export interface DataTable {
  getAllColumns(): ColumnDef[];
  getHeaderGroups(): HeaderGroup[];
  getRowModel(): { rows: Row[] };
  getFilteredRowModel(): { rows: Row[] };
  getState(): TableState;
  getPageCount(): number;
  getCanPreviousPage(): boolean;
  getCanNextPage(): boolean;
  setPageSize(size: number): void;
  setPageIndex(index: number): void;
  previousPage(): void;
  nextPage(): void;
}
