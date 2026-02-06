export function formatDate(date: Date | string | number | null | undefined): string {
    if (!date) return '';

    const resolved = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(resolved.getTime())) return '';

    const pad = (n: number) => String(n).padStart(2, '0');

    return (
        `${pad(resolved.getDate())}/` +
        `${pad(resolved.getMonth() + 1)}/` +
        `${resolved.getFullYear()} ` +
        `${pad(resolved.getHours())}:` +
        `${pad(resolved.getMinutes())}:` +
        `${pad(resolved.getSeconds())}`
    );
}
