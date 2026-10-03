// The only place dates are formatted for display in the doctor app. Data stays ISO 8601.

const pad = (n: number) => String(n).padStart(2, '0');

/** `2026-10-03` or full ISO → `03.10.2026` (local time for full timestamps). */
export function formatDate(iso: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
  }
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

/** Full ISO → `03.10.2026, 18:40`. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${formatDate(iso)}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const formatNumber = (v: number): string => v.toLocaleString('pl-PL');
