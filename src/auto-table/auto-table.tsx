import { useMemo, useState } from 'react';

// Libs
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { PaginationState, SortingState, ColumnFiltersState } from '@tanstack/react-table';

// Components
import { Button } from '@/components/ui/button';
import { DeleteAction, EditAction } from './auto-table-actions';
import { DataTable, generateColumns } from '../data-table';
import { AutoForm } from '../form/auto-form';
import { AutoTableSheet } from './auto-table-sheet';
import { useCrudMutations } from './use-crud-mutations';

// Icons
import { Plus } from 'lucide-react';

// Utils and Types
import { ApiRequest } from '../utils/types';
import { AutoTableProps } from './types';

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
}: AutoTableProps<T>) {
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
  const { createMutation, updateMutation, deleteMutation } = useCrudMutations(mutations, queryKey, {
    onCreateSuccess: () => setCreateDialogOpen(false),
    onUpdateSuccess: () => {
      setEditDialogOpen(false);
      setEditingItem(null);
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
              <EditAction
                row={row}
                onEdit={item => {
                  setEditingItem(item);
                  setEditDialogOpen(true);
                }}
              />
            )}
            {mutations.delete && (
              <DeleteAction
                row={row}
                onDelete={item => deleteMutation.mutate((item as any).id)}
                isDeleting={deleteMutation.isPending}
              />
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
    <>
      {/* Header */}
      {(title || description || mutations.create) && (
        <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <div className="space-y-1">
            {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
          {mutations.create && (
            <div className="md:flex md:justify-end">
              <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                <Plus />
                Create
              </Button>
            </div>
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

      {/* Create Sheet */}
      {mutations.create && (
        <AutoTableSheet
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
        </AutoTableSheet>
      )}

      {/* Edit Sheet */}
      {mutations.update && (
        <AutoTableSheet
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
        </AutoTableSheet>
      )}
    </>
  );
}
