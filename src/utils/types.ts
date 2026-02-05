/**
 * Server-side pagination, sorting, and filtering contract
 */

export interface ApiRequest {
    /** Page index (0-based) */
    pageIndex: number;
    /** Number of items per page */
    pageSize: number;
    /** Sorting configuration */
    sorting?: Array<{
        id: string;
        desc: boolean;
    }>;
    /** Column filters */
    filters?: Array<{
        id: string;
        value: unknown;
    }>;
}

export interface FacetedOption {
    value: string;
    label: string;
    count: number;
}

export interface ApiResponse<T> {
    /** Array of data items for current page */
    data: T[];
    /** Total number of items (for pagination) */
    total: number;
    /** Faceted filter options (optional) */
    faceted?: Record<string, FacetedOption[]>;
}

/**
 * Generic API fetcher function type
 */
export type ApiFetcher<T> = (
    request: ApiRequest
) => Promise<ApiResponse<T>>;

/**
 * Mutation functions for CRUD operations
 */
export interface CrudMutations<T> {
    create?: (data: Partial<T>) => Promise<T>;
    update?: (id: string | number, data: Partial<T>) => Promise<T>;
    delete?: (id: string | number) => Promise<void>;
}
