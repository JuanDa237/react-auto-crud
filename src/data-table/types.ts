// Libs
import {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    PaginationState,
    OnChangeFn,
} from '@tanstack/react-table';

// Types
import { FacetedOption } from '../utils/types';

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
