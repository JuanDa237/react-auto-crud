import { useMemo, useState } from 'react';

// Libs
import { z } from 'zod';

// Components
import { AutoFormField } from './auto-form-field';
import { Button } from '@/components/ui/button';

// Utils
import {
  extractSchemaFields,
  getEnumOptions,
  getFieldType,
  isFieldOptional,
} from '../utils/schema';
import { omitReadOnly } from './auto-form-utils';

export interface AutoFormProps<T extends z.ZodObject<any>> {
  schema: T;
  initialValues?: Partial<z.infer<T>>;
  onSubmit: (values: z.infer<T>) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

/**
 * Auto-generated form from Zod schema
 */
export function AutoForm<T extends z.ZodObject<any>>({
  schema,
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  mode = 'create',
}: AutoFormProps<T>) {
  const fields = extractSchemaFields(schema);
  const readOnlyKeys = useMemo(
    () =>
      new Set(
        Array.from(fields.entries())
          .filter(([_, { metadata }]) => metadata.readOnly)
          .map(([key]) => key)
      ),
    [fields]
  );

  const readOnlyMask = useMemo(() => {
    const mask: Record<string, true> = {};
    for (const key of readOnlyKeys) {
      mask[key] = true;
    }
    return mask;
  }, [readOnlyKeys]);

  const effectiveSchema = useMemo(() => {
    if (mode === 'create' && readOnlyKeys.size > 0) {
      return schema.partial(readOnlyMask);
    }
    return schema;
  }, [schema, mode, readOnlyKeys, readOnlyMask]);

  // State for form values
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    for (const [key] of fields.entries()) {
      initial[key] = initialValues[key] ?? undefined;
    }
    return initial;
  });

  // State for validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Sort fields by order metadata
  const sortedFields = Array.from(fields.entries()).sort((a, b) => {
    const orderA = a[1].metadata.order ?? 999;
    const orderB = b[1].metadata.order ?? 999;
    return orderA - orderB;
  });

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateForm = (): boolean => {
    try {
      const valuesToValidate = mode === 'create' ? omitReadOnly(values, readOnlyKeys) : values;
      effectiveSchema.parse(valuesToValidate);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach(err => {
          if (err.path.length > 0) {
            const field = err.path[0] as string;
            newErrors[field] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    for (const [key] of fields.entries()) {
      allTouched[key] = true;
    }
    setTouched(allTouched);

    if (validateForm()) {
      const valuesToSubmit = mode === 'create' ? omitReadOnly(values, readOnlyKeys) : values;
      await onSubmit(valuesToSubmit as z.infer<T>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        {sortedFields.map(([key, { schema: fieldSchema, metadata }]) => {
          if (metadata.hidden) return null;
          if (mode === 'create' && metadata.readOnly) return null;

          const fieldType = getFieldType(fieldSchema);
          const isOptional = isFieldOptional(fieldSchema);
          const enumOptions = getEnumOptions(fieldSchema);

          return (
            <AutoFormField
              key={key}
              name={key}
              label={metadata.label || key}
              type={fieldType}
              value={values[key]}
              error={touched[key] ? errors[key] : undefined}
              placeholder={metadata.placeholder}
              description={metadata.description}
              readOnly={metadata.readOnly}
              required={!isOptional}
              options={enumOptions}
              onChange={value => handleChange(key, value)}
              onBlur={() => handleBlur(key)}
            />
          );
        })}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
