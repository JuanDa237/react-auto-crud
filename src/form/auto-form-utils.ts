export function omitReadOnly(
    values: Record<string, any>,
    readOnlyKeys: Set<string>
): Record<string, any> {
    const next: Record<string, any> = {};
    for (const [key, value] of Object.entries(values)) {
        if (!readOnlyKeys.has(key)) {
            next[key] = value;
        }
    }
    return next;
}
