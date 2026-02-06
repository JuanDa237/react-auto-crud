import { z } from 'zod';

/**
 * Metadata configuration for Zod schema fields
 */
export interface FieldMetadata {
    /** Display label for the field */
    label?: string;
    /** Whether the field should be hidden from the table */
    hidden?: boolean;
    /** Whether the field can be used for filtering */
    filterable?: boolean;
    /** Whether to show faceted filter (for enum/select fields) */
    faceted?: boolean;
    /** Whether the field is read-only in forms */
    readOnly?: boolean;
    /** Placeholder text for inputs */
    placeholder?: string;
    /** Description/helper text */
    description?: string;
    /** Custom render order in forms */
    order?: number;
    /** Column width in table in px (e.g., 200) default auto */
    width?: number;
    /** Enable sorting for this column */
    sortable?: boolean;
}

/**
 * Extended Zod schema with metadata support
 */
export type ZodSchemaWithMeta = z.ZodTypeAny & {
    _def: {
        metadata?: FieldMetadata;
    };
};

/**
 * Helper to add metadata to any Zod schema
 */
export function withMetadata<T extends z.ZodTypeAny>(
    schema: T,
    metadata: FieldMetadata
): T {
    const cloned = schema as ZodSchemaWithMeta;
    if (!cloned._def.metadata) {
        cloned._def.metadata = {};
    }
    Object.assign(cloned._def.metadata, metadata);
    return cloned as T;
}

/**
 * Extract metadata from a Zod schema field
 */
export function getFieldMetadata(
    schema: z.ZodTypeAny
): FieldMetadata | undefined {
    const typed = schema as ZodSchemaWithMeta;
    return typed._def.metadata;
}

/**
 * Extract all fields with their metadata from an object schema
 */
export function extractSchemaFields<T extends z.ZodObject<any>>(schema: T):
    Map<string, { schema: z.ZodTypeAny; metadata: FieldMetadata }> {
    const fields = new Map<string, { schema: z.ZodTypeAny; metadata: FieldMetadata }>();

    const shape = schema.shape;

    for (const [key, fieldSchema] of Object.entries(shape)) {
        const metadata = getFieldMetadata(fieldSchema as z.ZodTypeAny) || {};

        // Generate default label from field name
        if (!metadata.label) {
            metadata.label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())
                .trim();
        }

        // Default values
        if (metadata.hidden === undefined) metadata.hidden = false;
        if (metadata.filterable === undefined) metadata.filterable = true;
        if (metadata.sortable === undefined) metadata.sortable = true;
        if (metadata.readOnly === undefined) metadata.readOnly = false;

        fields.set(key, {
            schema: fieldSchema as z.ZodTypeAny,
            metadata,
        });
    }

    return fields;
}

/**
 * Infer the input type from field schema
 */
export function getFieldType(schema: z.ZodTypeAny): string {
    // Unwrap optional/nullable
    let unwrapped: z.ZodTypeAny = schema;

    while (
        unwrapped instanceof z.ZodDefault ||
        unwrapped instanceof z.ZodOptional ||
        unwrapped instanceof z.ZodNullable
    ) {
        unwrapped = unwrapped.def.innerType as z.ZodTypeAny;
    }

    if (unwrapped instanceof z.ZodString) return 'string';
    if (unwrapped instanceof z.ZodNumber) return 'number';
    if (unwrapped instanceof z.ZodBoolean) return 'boolean';

    if (unwrapped instanceof z.ZodDate) return 'date';
    if (unwrapped instanceof z.ZodISODateTime) return 'date';
    if (unwrapped instanceof z.ZodISODate) return 'date';

    if (unwrapped instanceof z.ZodEnum) return 'enum';
    if (unwrapped instanceof z.ZodArray) return 'array';
    if (unwrapped instanceof z.ZodObject) return 'object';

    return 'string'; // fallback
}

/**
 * Check if field is optional
 */
export function isFieldOptional(schema: z.ZodTypeAny): boolean {
    return schema instanceof z.ZodOptional || schema instanceof z.ZodNullable;
}

/**
 * Get enum options if field is enum
 */
export function getEnumOptions(schema: z.ZodTypeAny): Array<{ label: string; value: string }> | undefined {
    let unwrapped = schema;

    while (
        unwrapped instanceof z.ZodDefault ||
        unwrapped instanceof z.ZodOptional ||
        unwrapped instanceof z.ZodNullable
    ) {
        unwrapped = unwrapped.def.innerType as z.ZodTypeAny;
    }

    if (unwrapped instanceof z.ZodEnum) {
        const values = Array.isArray(unwrapped.options)
            ? unwrapped.options
            : Object.keys(unwrapped.def.entries ?? {});
        return values.map((value) => ({
            label: String(value),
            value: String(value),
        }));
    }

    return undefined;
}
