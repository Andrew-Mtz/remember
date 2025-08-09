// utils/dates.ts
export const DAY_LETTERS = ["D", "L", "M", "X", "J", "V", "S"]; // 0..6

export function formatCustomDays(days: number[]): string {
  if (!Array.isArray(days) || days.length === 0) return "";
  return days
    .sort((a, b) => a - b)
    .map(d => DAY_LETTERS[d] ?? String(d))
    .join(", ");
}

export function toISODate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function isSameDay(aISO?: string, bISO?: string): boolean {
  if (!aISO || !bISO) return false;
  return aISO.slice(0, 10) === bISO.slice(0, 10);
}

export function addDaysISO(iso: string, delta: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + delta);
  return toISODate(d);
}

// Semana Lunes–Domingo
export function startOfWeekISO(iso: string): string {
  const d = new Date(iso);
  const day = d.getDay(); // 0..6
  const diff = day === 0 ? -6 : 1 - day; // mover a lunes
  d.setDate(d.getDate() + diff);
  return toISODate(d);
}

export function isSameWeek(aISO: string, bISO: string): boolean {
  return startOfWeekISO(aISO) === startOfWeekISO(bISO);
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
