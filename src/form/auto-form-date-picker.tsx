// Libs
import { format } from 'date-fns';

// Components
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Icons
import { Calendar as CalendarIcon } from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';

export interface AutoFormDatePickerProps {
  id: string;
  value?: Date | string | null;
  placeholder?: string;
  error?: string;
  onChange: (value: Date | undefined) => void;
  onBlur?: () => void;
}

export function AutoFormDatePicker({
  id,
  value,
  placeholder = 'Pick a date',
  error,
  onChange,
  onBlur,
}: AutoFormDatePickerProps) {
  const selected = value ? new Date(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !selected && 'text-muted-foreground',
            error && 'border-red-500'
          )}
          onBlur={onBlur}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, 'PPP') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={date => onChange(date ?? undefined)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
