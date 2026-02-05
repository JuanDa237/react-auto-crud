// Libs
import { PaginationState, Table } from '@tanstack/react-table';

// Components
import { Button } from '@/components/ui/button';

// Icons
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pagination: PaginationState;
  rowCount: number;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  pagination,
  rowCount,
  pageSizeOptions = [5, 10, 25, 50, 100],
}: DataTablePaginationProps<TData>) {
  const totalPages = table.getPageCount();
  const start = rowCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, rowCount);

  return (
    <div className="flex flex-col gap-4 px-2 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-sm text-muted-foreground">
          Showing {start} to {end} of {rowCount} results
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-sm text-muted-foreground">
            Rows per page
          </label>
          <select
            id="page-size"
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={pagination.pageSize}
            onChange={event => table.setPageSize(Number(event.target.value))}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          Page {pagination.pageIndex + 1} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(totalPages - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
