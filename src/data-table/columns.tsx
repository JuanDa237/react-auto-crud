// Libs
import type { Column } from '@tanstack/react-table';
import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';

// Components
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

// Icons
import { ArrowUp, ArrowDown, X, Check } from 'lucide-react';

// Utils
import { extractSchemaFields, getFieldType } from '../utils/schema';

export interface ColumnGeneratorOptions {
  /** Enable row selection */
  enableSelection?: boolean;
  /** Enable actions column */
  enableActions?: boolean;
  /** Custom action renderer */
  renderActions?: (row: any) => React.ReactNode;
}

/**
 * Generate TanStack Table column definitions from Zod schema
 */
export function generateColumns<T extends z.ZodObject<any>>(
  schema: T,
  options: ColumnGeneratorOptions = {}
): ColumnDef<z.infer<T>>[] {
  const columns: ColumnDef<z.infer<T>>[] = [];

  // Selection column
  if (options.enableSelection) {
    columns.push({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    });
  }

  // Data columns
  const fields = extractSchemaFields(schema);

  for (const [key, { schema: fieldSchema, metadata }] of fields.entries()) {
    if (metadata.hidden) continue;

    const fieldType = getFieldType(fieldSchema);

    columns.push({
      accessorKey: key,
      // Sorting
      enableSorting: metadata.sortable,
      header: ({ column }) =>
        renderSortableHeader(metadata.label || key, metadata.sortable, column),
      cell: ({ getValue }) => {
        const value = getValue();
        return formatCellValue(value, fieldType);
      },
      // Set width if specified
      ...(metadata.width && { size: metadata.width }),
    });
  }

  // Actions column
  if (options.enableActions && options.renderActions) {
    columns.push({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => options.renderActions!(row.original),
      enableSorting: false,
      enableHiding: false,
    });
  }

  return columns;
}

function renderSortableHeader<TData>(
  label: string,
  sortable: boolean | undefined,
  column: Column<TData, unknown>
): React.ReactNode {
  if (!sortable) {
    return <div className="font-medium">{label}</div>;
  }

  const isSorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="-ml-4"
    >
      {label}
      <div className="ml-2 flex flex-col">
        <ArrowUp
          className={`h-3 w-3 ${isSorted === 'asc' ? 'text-foreground' : 'text-muted-foreground/40'}`}
        />
        <ArrowDown
          className={`h-3 w-3 -mt-1 ${isSorted === 'desc' ? 'text-foreground' : 'text-muted-foreground/40'}`}
        />
      </div>
    </Button>
  );
}

/**
 * Format cell value based on field type
 */
function formatCellValue(value: any, fieldType: string): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  switch (fieldType) {
    case 'boolean':
      return value ? (
        <span className="text-emerald-600 dark:text-emerald-400">
          <Check />
        </span>
      ) : (
        <span className="text-rose-600 dark:text-rose-400">
          <X />
        </span>
      );
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'array':
      return Array.isArray(value) ? value.length + ' items' : '—';
    case 'object':
      return '[Object]';
    default:
      return String(value);
  }
}
