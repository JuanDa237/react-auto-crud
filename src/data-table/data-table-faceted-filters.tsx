// Libs
import { ColumnFiltersState, OnChangeFn } from '@tanstack/react-table';

// Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

// Icons
import { Check, PlusCircle } from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';
import { FacetedOption } from '../utils/types';

export interface DataTableFacetedFiltersProps {
  facetedFilters: Record<string, FacetedOption[]>;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
}

export function DataTableFacetedFilters({
  facetedFilters,
  columnFilters,
  onColumnFiltersChange,
}: DataTableFacetedFiltersProps) {
  const entries = Object.entries(facetedFilters);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-4">
      {entries.map(([columnId, options]) => (
        <DataTableFacetedFilter
          key={columnId}
          columnId={columnId}
          options={options}
          columnFilters={columnFilters}
          onColumnFiltersChange={onColumnFiltersChange}
        />
      ))}
    </div>
  );
}

interface DataTableFacetedFilterProps {
  columnId: string;
  options: FacetedOption[];
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
}

function DataTableFacetedFilter({
  columnId,
  options,
  columnFilters,
  onColumnFiltersChange,
}: DataTableFacetedFilterProps) {
  const selectedValues = getSelectedValues(columnId, columnFilters);
  const selectedSize = selectedValues.size;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          <span className="capitalize">{columnId}</span>
          {selectedSize > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedSize}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedSize > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedSize} selected
                  </Badge>
                ) : (
                  options
                    .filter(option => selectedValues.has(option.value))
                    .map(option => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder={`Filter ${columnId}`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map(option => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() =>
                      toggleFilterValue(
                        columnId,
                        option.value,
                        columnFilters,
                        onColumnFiltersChange
                      )
                    }
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    <span>{option.label}</span>
                    <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                      {option.count}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedSize > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => clearFilter(columnId, columnFilters, onColumnFiltersChange)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function getSelectedValues(columnId: string, columnFilters: ColumnFiltersState) {
  const filter = columnFilters.find(item => item.id === columnId);
  if (!filter) return new Set<string>();

  const values = Array.isArray(filter.value) ? filter.value : [filter.value];
  return new Set(values.map(value => String(value)));
}

function toggleFilterValue(
  columnId: string,
  value: string,
  columnFilters: ColumnFiltersState,
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
) {
  const currentValues = getSelectedValues(columnId, columnFilters);
  if (currentValues.has(value)) {
    currentValues.delete(value);
  } else {
    currentValues.add(value);
  }

  const nextValues = Array.from(currentValues);
  const nextFilters = columnFilters.filter(item => item.id !== columnId);

  if (nextValues.length > 0) {
    nextFilters.push({ id: columnId, value: nextValues });
  }

  onColumnFiltersChange(nextFilters);
}

function clearFilter(
  columnId: string,
  columnFilters: ColumnFiltersState,
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
) {
  onColumnFiltersChange(columnFilters.filter(item => item.id !== columnId));
}
