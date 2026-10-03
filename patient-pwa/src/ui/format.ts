// Jedno miejsce formatowania dat do wyświetlenia (CLAUDE.md). W danych zawsze ISO 8601.

const pad = (n: number) => String(n).padStart(2, '0');

/** Dzisiejsza data w strefie użytkownika, `RRRR-MM-DD` (nie UTC – inaczej po północy byłby „wczoraj”). */
export function todayIso(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** `2026-10-03` albo pełny ISO → `03.10.2026`. */
export function formatDate(iso: string): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : todayIso(new Date(iso));
  const [y, m, d] = date.split('-');
  return `${d}.${m}.${y}`;
}

/** Pełny ISO → `03.10.2026, 18:40` (czas lokalny). */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${formatDate(todayIso(d))}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
