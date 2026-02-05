// Libs
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
  OnChangeFn,
} from '@tanstack/react-table';

// Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Icons
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, Search } from 'lucide-react';

// Types
import { FacetedOption } from '../utils/types';
import { useEffect, useState } from 'react';

export interface DataTableProps<TData> {
  /** Column definitions */
  columns: ColumnDef<TData>[];
  /** Data for current page */
  data: TData[];
  /** Total number of rows across all pages */
  rowCount: number;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Pagination state */
  pagination: PaginationState;
  /** Pagination change handler */
  onPaginationChange: OnChangeFn<PaginationState>;
  /** Sorting state */
  sorting: SortingState;
  /** Sorting change handler */
  onSortingChange: OnChangeFn<SortingState>;
  /** Column filters state */
  columnFilters: ColumnFiltersState;
  /** Column filters change handler */
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  /** Page size options for pagination */
  pageSizeOptions?: number[];
  /** Faceted filter options */
  facetedFilters?: Record<string, FacetedOption[]>;
  /** Column to search (e.g., 'name', 'email') */
  searchColumn?: string;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
  /** Debounce delay for search in milliseconds */
  searchDebounceMs?: number;
}

export function DataTable<TData>({
  columns,
  data,
  rowCount,
  isLoading = false,
  error = null,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  pageSizeOptions = [5, 10, 25, 50, 100],
  facetedFilters,
  searchColumn,
  searchPlaceholder = 'Search...',
  searchDebounceMs = 500,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
    state: {
      pagination,
      sorting,
      columnFilters,
    },
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading data</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  const toggleFilter = (columnId: string, value: string) => {
    const existingFilter = columnFilters.find(f => f.id === columnId);

    if (existingFilter) {
      const currentValues = Array.isArray(existingFilter.value)
        ? existingFilter.value
        : [existingFilter.value];

      if (currentValues.includes(value)) {
        // Remove value
        const newValues = currentValues.filter(v => v !== value);
        if (newValues.length === 0) {
          // Remove filter entirely
          onColumnFiltersChange(columnFilters.filter(f => f.id !== columnId));
        } else {
          // Update with remaining values
          onColumnFiltersChange(
            columnFilters.map(f => (f.id === columnId ? { ...f, value: newValues } : f))
          );
        }
      } else {
        // Add value
        onColumnFiltersChange(
          columnFilters.map(f =>
            f.id === columnId ? { ...f, value: [...currentValues, value] } : f
          )
        );
      }
    } else {
      // Create new filter
      onColumnFiltersChange([...columnFilters, { id: columnId, value: [value] }]);
    }
  };

  const clearFilter = (columnId: string) => {
    onColumnFiltersChange(columnFilters.filter(f => f.id !== columnId));
  };

  const isFilterActive = (columnId: string, value: string) => {
    const filter = columnFilters.find(f => f.id === columnId);
    if (!filter) return false;
    const values = Array.isArray(filter.value) ? filter.value : [filter.value];
    return values.includes(value);
  };

  // Local state for search input (debounced)
  const [searchInputValue, setSearchInputValue] = useState(() => {
    if (!searchColumn) return '';
    const filter = columnFilters.find(f => f.id === searchColumn);
    return filter ? String(filter.value) : '';
  });

  // Sync local search state with external filter changes
  useEffect(() => {
    if (!searchColumn) return;
    const filter = columnFilters.find(f => f.id === searchColumn);
    const filterValue = filter ? String(filter.value) : '';
    if (filterValue !== searchInputValue) {
      setSearchInputValue(filterValue);
    }
  }, [columnFilters, searchColumn]);

  // Debounced search effect
  useEffect(() => {
    if (!searchColumn) return;

    const handler = setTimeout(() => {
      if (searchInputValue === '') {
        // Remove search filter
        onColumnFiltersChange(columnFilters.filter(f => f.id !== searchColumn));
      } else {
        // Update or add search filter
        const existingFilter = columnFilters.find(f => f.id === searchColumn);
        if (existingFilter) {
          onColumnFiltersChange(
            columnFilters.map(f => (f.id === searchColumn ? { ...f, value: searchInputValue } : f))
          );
        } else {
          onColumnFiltersChange([...columnFilters, { id: searchColumn, value: searchInputValue }]);
        }
      }
    }, searchDebounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInputValue, searchColumn, searchDebounceMs]);

  const handleSearchInputChange = (value: string) => {
    setSearchInputValue(value);
  };

  const clearSearch = () => {
    setSearchInputValue('');
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      {searchColumn && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchInputValue}
              onChange={e => handleSearchInputChange(e.target.value)}
              className="pl-8"
            />
          </div>
          {searchInputValue && (
            <Button variant="ghost" size="sm" onClick={clearSearch}>
              Clear
              <X className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      {/* Faceted Filters */}
      {facetedFilters && Object.keys(facetedFilters).length > 0 && (
        <div className="flex flex-wrap gap-4">
          {Object.entries(facetedFilters).map(([columnId, options]) => {
            const activeFilter = columnFilters.find(f => f.id === columnId);
            const hasActiveFilters = !!activeFilter;

            return (
              <div key={columnId} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{columnId}</span>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter(columnId)}
                      className="h-6 px-2 text-xs"
                    >
                      Clear
                      <X className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {options.map(option => {
                    const isActive = isFilterActive(columnId, option.value);
                    return (
                      <Button
                        key={option.value}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleFilter(columnId, option.value)}
                        className="h-8"
                      >
                        {option.label}
                        <span className="ml-1.5 text-xs opacity-70">({option.count})</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header
                        ? typeof header.column.columnDef.header === 'function'
                          ? header.column.columnDef.header(header.getContext())
                          : header.column.columnDef.header
                        : null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {typeof cell.column.columnDef.cell === 'function'
                        ? cell.column.columnDef.cell(cell.getContext())
                        : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
            {Math.min((pagination.pageIndex + 1) * pagination.pageSize, rowCount)} of {rowCount}{' '}
            results
          </div>
          <div className="flex items-center space-x-2">
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
        <div className="flex items-center space-x-2">
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
            Page {pagination.pageIndex + 1} of {table.getPageCount()}
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
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
