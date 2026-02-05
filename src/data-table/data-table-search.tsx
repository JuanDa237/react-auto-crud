// Components
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';

// Icons
import { Search, X } from 'lucide-react';

export interface DataTableSearchInputProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function DataTableSearchInput({
  value,
  placeholder = 'Search...',
  onChange,
  onClear,
}: DataTableSearchInputProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 max-w-sm">
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText className="px-1.5">
              <Search />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        </InputGroup>
      </div>
      {value && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
          <X className="ml-1 h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
