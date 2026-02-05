// Libs
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaginationState, SortingState, ColumnFiltersState } from '@tanstack/react-table';

// Components
import { Button } from '@/components/ui/button';

// Icons
import { Plus, Pencil, Trash2 } from 'lucide-react';

// Utils and Types
import { ApiFetcher, ApiRequest, CrudMutations } from '../utils/types';
import { DataTable, generateColumns } from '../data-table';
import { useMemo, useState } from 'react';

export interface AutoCrudTableProps<T extends z.ZodObject<any>> {
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

/**
 * Main AutoTable component
 * Orchestrates table, forms, and mutations
 */
export function AutoTable<T extends z.ZodObject<any>>({
  schema,
  queryKey,
  fetcher,
  mutations = {},
  defaultPageSize = 10,
  enableSelection = false,
  title,
  description,
  searchColumn,
  searchPlaceholder,
}: AutoCrudTableProps<T>) {
  const queryClient = useQueryClient();

  // Table state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<z.infer<T> | null>(null);

  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey, pagination, sorting, columnFilters],
    queryFn: async () => {
      const request: ApiRequest = {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        filters: columnFilters,
      };
      return fetcher(request);
    },
    placeholderData: prev => prev,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: Partial<z.infer<T>>) => {
      if (!mutations.create) {
        throw new Error('Create mutation not provided');
      }
      return mutations.create(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setCreateDialogOpen(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string | number; values: Partial<z.infer<T>> }) => {
      if (!mutations.update) {
        throw new Error('Update mutation not provided');
      }
      return mutations.update(id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setEditDialogOpen(false);
      setEditingItem(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      if (!mutations.delete) {
        throw new Error('Delete mutation not provided');
      }
      return mutations.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  // Generate columns with actions
  const columns = useMemo(
    () =>
      generateColumns(schema, {
        enableSelection,
        enableActions: !!(mutations.update || mutations.delete),
        renderActions: (row: z.infer<T>) => (
          <div className="flex items-center gap-2">
            {mutations.update && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingItem(row);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {mutations.delete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this item?')) {
                    deleteMutation.mutate((row as any).id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
        ),
      }),
    [schema, enableSelection, mutations]
  );

  const handleCreate = async (values: z.infer<T>) => {
    await createMutation.mutateAsync(values);
  };

  const handleUpdate = async (values: z.infer<T>) => {
    if (!editingItem) return;
    const id = (editingItem as any).id;
    await updateMutation.mutateAsync({ id, values });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      {(title || description || mutations.create) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
          {mutations.create && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        rowCount={data?.total || 0}
        isLoading={isLoading}
        error={error as Error}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        facetedFilters={data?.faceted}
        searchColumn={searchColumn}
        searchPlaceholder={searchPlaceholder}
      />

      {/* Create Dialog */}
      {/* {mutations.create && (
        <Dialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          title="Create New Item"
          description="Fill in the form below to create a new item."
        >
          <AutoForm
            schema={schema}
            mode="create"
            onSubmit={handleCreate}
            onCancel={() => setCreateDialogOpen(false)}
            submitLabel="Create"
            isSubmitting={createMutation.isPending}
          />
        </Dialog>
      )} */}

      {/* Edit Dialog */}
      {/* {mutations.update && (
        <Dialog
          open={editDialogOpen}
          onOpenChange={open => {
            setEditDialogOpen(open);
            if (!open) setEditingItem(null);
          }}
          title="Edit Item"
          description="Update the form below to edit the item."
        >
          {editingItem && (
            <AutoForm
              schema={schema}
              initialValues={editingItem}
              mode="edit"
              onSubmit={handleUpdate}
              onCancel={() => {
                setEditDialogOpen(false);
                setEditingItem(null);
              }}
              submitLabel="Update"
              isSubmitting={updateMutation.isPending}
            />
          )}
        </Dialog>
      )} */}
    </div>
  );
}
