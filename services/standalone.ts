// services/standalone.ts
import { StandaloneTask } from "../models/Task";

const DAY_MS = 24 * 60 * 60 * 1000;

export function isStandaloneDueToday(
  task: StandaloneTask,
  baseDate = new Date()
): boolean {
  const recurrence = task.recurrence;
  const today = new Date(baseDate);
  const todayIdx = today.getDay(); // 0..6
  const todayISO = today.toISOString().slice(0, 10);

  switch (recurrence.type) {
    case "once":
      // “due” si no está completa nunca
      return !task.completed;

    case "daily":
      if (recurrence.daysOfWeek?.length) {
        return recurrence.daysOfWeek.includes(todayIdx);
      }
      return true;

    case "weekly": {
      const interval = recurrence.interval ?? 1; // cada N semanas
      const lastISO = task.completedDates.at(-1);
      if (!lastISO) return true;
      const last = new Date(lastISO);
      const weeksDiff = Math.floor((+today - +last) / (7 * DAY_MS));
      return weeksDiff >= interval;
    }

    case "monthly": {
      const interval = recurrence.interval ?? 1;
      const lastISO = task.completedDates.at(-1);
      if (!lastISO) return true;
      const last = new Date(lastISO);
      const monthsDiff =
        (today.getFullYear() - last.getFullYear()) * 12 +
        (today.getMonth() - last.getMonth());
      return monthsDiff >= interval;
    }

    case "custom":
      // Por ahora, si definiste días específicos, usamos eso; si no, lo consideramos “due”
      if (recurrence.daysOfWeek?.length) {
        return recurrence.daysOfWeek.includes(todayIdx);
      }
      return true;

    default:
      return false;
  }
}
