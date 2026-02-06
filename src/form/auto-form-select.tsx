// Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface AutoFormSelectOption {
  label: string;
  value: string;
}

export interface AutoFormSelectProps {
  id: string;
  value?: string;
  placeholder?: string;
  error?: string;
  options: AutoFormSelectOption[];
  onChange: (value: string | undefined) => void;
  onBlur?: () => void;
}

export function AutoFormSelect({
  id,
  value,
  placeholder = 'Select an option',
  error,
  options,
  onChange,
  onBlur,
}: AutoFormSelectProps) {
  return (
    <Select value={value ?? ''} onValueChange={next => onChange(next || undefined)}>
      <SelectTrigger id={id} className={error ? 'border-red-500' : ''} onBlur={onBlur}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
