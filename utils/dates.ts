// utils/dates.ts
export const DAY_LETTERS = ["D", "L", "M", "X", "J", "V", "S"]; // 0..6

export function formatCustomDays(days: number[]): string {
  if (!Array.isArray(days) || days.length === 0) return "";
  return days
    .slice()
    .sort((a, b) => a - b)
    .map(d => DAY_LETTERS[d] ?? String(d))
    .join(", ");
}

/** YYYY-MM-DD en *hora local* (NO UTC) */
export function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parsear "YYYY-MM-DD" a Date en *local* (NO usar new Date(iso)) */
export function parseLocalISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function isSameLocalDay(aISO?: string, bISO?: string): boolean {
  if (!aISO || !bISO) return false;
  return aISO === bISO;
}

export function addDaysISO(iso: string, delta: number): string {
  const d = parseLocalISODate(iso);
  d.setDate(d.getDate() + delta);
  return toISODateLocal(d);
}

// Semana Lunes–Domingo en *local*
export function startOfWeekISO(iso: string): string {
  const d = parseLocalISODate(iso);
  const day = d.getDay(); // 0..6 (local)
  const diff = day === 0 ? -6 : 1 - day; // mover a lunes
  d.setDate(d.getDate() + diff);
  return toISODateLocal(d);
}

export function isSameWeek(aISO: string, bISO: string): boolean {
  return startOfWeekISO(aISO) === startOfWeekISO(bISO);
}

export function dayIndexFromISO(iso: string): number {
  return parseLocalISODate(iso).getDay(); // 0..6 local
}

export function todayISOLocal(): string {
  return toISODateLocal(new Date());
}
