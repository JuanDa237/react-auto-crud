// Components
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AutoFormDatePicker } from './auto-form-date-picker';
import { AutoFormSelect } from './auto-form-select';

export interface FormFieldProps {
  name: string;
  label: string;
  type: string;
  value: any;
  error?: string;
  placeholder?: string;
  description?: string;
  readOnly?: boolean;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  onChange: (value: any) => void;
  onBlur?: () => void;
}

/**
 * Auto-generated form field component
 */
export function AutoFormField({
  name,
  label,
  type,
  value,
  error,
  placeholder,
  description,
  readOnly,
  required,
  options,
  onChange,
  onBlur,
}: FormFieldProps) {
  const renderInput = () => {
    if (readOnly) {
      return (
        <div className="px-3 py-2 bg-muted rounded-md text-sm">
          {formatReadOnlyValue(value, type)}
        </div>
      );
    }

    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={name}
              checked={!!value}
              onChange={e => onChange(e.target.checked)}
              onBlur={onBlur}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor={name} className="font-normal">
              {label}
            </Label>
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            id={name}
            value={value ?? ''}
            onChange={e => onChange(e.target.value ? Number(e.target.value) : undefined)}
            onBlur={onBlur}
            placeholder={placeholder}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'date':
        return (
          <AutoFormDatePicker
            id={name}
            value={value}
            placeholder={placeholder}
            error={error}
            onChange={next => onChange(next ? next.toISOString() : undefined)}
            onBlur={onBlur}
          />
        );

      case 'enum':
        return (
          <AutoFormSelect
            id={name}
            value={value ?? undefined}
            placeholder={placeholder}
            error={error}
            options={options ?? []}
            onChange={next => onChange(next)}
            onBlur={onBlur}
          />
        );

      case 'string':
      default:
        // Use textarea for long text
        if (placeholder?.includes('description') || placeholder?.includes('notes')) {
          return (
            <Textarea
              id={name}
              value={value ?? ''}
              onChange={e => onChange(e.target.value || undefined)}
              onBlur={onBlur}
              placeholder={placeholder}
              className={error ? 'border-red-500' : ''}
            />
          );
        }

        return (
          <Input
            type="text"
            id={name}
            value={value ?? ''}
            onChange={e => onChange(e.target.value || undefined)}
            onBlur={onBlur}
            placeholder={placeholder}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  if (type === 'boolean' && !readOnly) {
    return (
      <div className="space-y-2">
        {renderInput()}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderInput()}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function formatReadOnlyValue(value: any, type: string): React.ReactNode {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  switch (type) {
    case 'date':
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return '—';
      }
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'array':
      return Array.isArray(value) ? `${value.length} items` : '—';
    case 'object':
      return '[Object]';
    default:
      return String(value);
  }
}
