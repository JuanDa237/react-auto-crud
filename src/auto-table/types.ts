// Libs
import { z } from 'zod';

// Utils and Types
import { ApiFetcher, CrudMutations } from '../utils/types';


export interface AutoTableProps<T extends z.ZodObject<any>> {
    /** Zod schema defining the data structure */
    schema: T;
    /** Query key for TanStack Query caching */
    queryKey: string | string[];
    /** Server-side fetcher function */
    fetcher: ApiFetcher<z.infer<T>>;
    /** CRUD mutation functions */
    mutations?: CrudMutations<z.infer<T>>;
    /** Initial page size */
    defaultPageSize?: number;
    /** Enable row selection */
    enableSelection?: boolean;
    /** Table title */
    title?: string;
    /** Table description */
    description?: string;
    /** Column to search (e.g., 'name', 'email') */
    searchColumn?: string;
    /** Placeholder text for search input */
    searchPlaceholder?: string;
}