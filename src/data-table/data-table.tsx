// Libs
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

// Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Data table components
import { DataTableSearchInput } from './data-table-search';
import { DataTableFacetedFilters } from './data-table-faceted-filters';
import { DataTablePagination } from './data-table-pagination';

// Types
import { useEffect, useRef, useState } from 'react';
import { DataTableProps } from './types';

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

  // Local state for search input (debounced)
  const [searchInputValue, setSearchInputValue] = useState(() => {
    if (!searchColumn) return '';
    const filter = columnFilters.find(f => f.id === searchColumn);
    return filter ? String(filter.value) : '';
  });
  const lastSearchFilterRef = useRef<string>('');

  // Sync local search state with external filter changes
  useEffect(() => {
    if (!searchColumn) return;
    const filter = columnFilters.find(f => f.id === searchColumn);
    const filterValue = filter ? String(filter.value) : '';
    if (filterValue === lastSearchFilterRef.current) return;
    lastSearchFilterRef.current = filterValue;
    setSearchInputValue(filterValue);
  }, [columnFilters, searchColumn]);

  // Debounced search effect
  useEffect(() => {
    if (!searchColumn) return;

    const handler = setTimeout(() => {
      const existingFilter = columnFilters.find(f => f.id === searchColumn);

      if (searchInputValue === '') {
        if (!existingFilter) return;
        // Remove search filter
        onColumnFiltersChange(columnFilters.filter(f => f.id !== searchColumn));
        return;
      }

      if (existingFilter && String(existingFilter.value) === searchInputValue) {
        return;
      }

      // Update or add search filter
      if (existingFilter) {
        onColumnFiltersChange(
          columnFilters.map(f => (f.id === searchColumn ? { ...f, value: searchInputValue } : f))
        );
      } else {
        onColumnFiltersChange([...columnFilters, { id: searchColumn, value: searchInputValue }]);
      }
    }, searchDebounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInputValue, searchColumn, searchDebounceMs, columnFilters, onColumnFiltersChange]);

  const handleSearchInputChange = (value: string) => {
    setSearchInputValue(value);
  };

  const clearSearch = () => {
    setSearchInputValue('');
  };

  return (
    <div className="space-y-4">
      <div className="flex w-full flex-wrap items-center gap-3 md:flex-nowrap md:justify-between">
        {/* Search Input */}
        {searchColumn && (
          <div className="w-full md:max-w-sm md:flex-1">
            <DataTableSearchInput
              value={searchInputValue}
              placeholder={searchPlaceholder}
              onChange={handleSearchInputChange}
              onClear={clearSearch}
            />
          </div>
        )}
        {/* Faceted Filters */}
        {facetedFilters && Object.keys(facetedFilters).length > 0 && (
          <div className="w-full md:flex-1 md:justify-end">
            <DataTableFacetedFilters
              facetedFilters={facetedFilters}
              columnFilters={columnFilters}
              onColumnFiltersChange={onColumnFiltersChange}
            />
          </div>
        )}
      </div>

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
      <DataTablePagination
        table={table}
        pagination={pagination}
        rowCount={rowCount}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
}
