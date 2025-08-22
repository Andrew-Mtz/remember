import { QuitGoal } from "../models/Goal";
import { addDaysISO } from "../utils/dates";

export function applyQuitDailyRollover(
  goal: QuitGoal,
  todayISO: string
): QuitGoal {
  let g = { ...goal };
  const last = g.streak.lastCheck || g.startDate.slice(0, 10);
  if (last === todayISO) return g;

  // avanzar día a día desde el siguiente a 'last' hasta 'todayISO'
  let cursor = addDaysISO(last, 1);
  const relapsesSet = new Set(g.relapses.map(r => r.date.slice(0, 10)));

  while (cursor <= todayISO) {
    if (relapsesSet.has(cursor)) {
      g.streak = {
        current: 0,
        highest: g.streak.highest,
        active: false,
        lastCheck: cursor,
      };
    } else {
      const cur = g.streak.current + 1;
      g.streak = {
        current: cur,
        highest: Math.max(g.streak.highest, cur),
        active: true,
        lastCheck: cursor,
      };
    }
    cursor = addDaysISO(cursor, 1);
  }
  return g;
}

export function registerRelapse(
  goal: QuitGoal,
  reason: string,
  dayISO: string
): QuitGoal {
  const g = { ...goal };
  g.relapses = [...(g.relapses ?? []), { date: dayISO, reason }];
  // reset inmediato
  g.streak = {
    current: 0,
    highest: g.streak.highest,
    active: false,
    lastCheck: dayISO,
  };
  return g;
}
