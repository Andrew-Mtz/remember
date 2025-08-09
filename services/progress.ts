// services/progress.ts
import { Goal } from "../models/Goal";
import {
  addDaysISO,
  clamp,
  isSameDay,
  isSameWeek,
  toISODate,
} from "../utils/dates";

/**
 * Resetea progreso semanal si cambió de semana.
 */
export function ensureWeeklyWindow(goal: Goal, todayISO: string): Goal {
  if (!isSameWeek(todayISO, goal.weeklyProgress.updatedAt)) {
    return {
      ...goal,
      weeklyProgress: {
        count: 0,
        updatedAt: todayISO,
      },
    };
  }
  return goal;
}

/**
 * Aplica delta (+1 o -1) al progreso semanal y actualiza updatedAt.
 * El count se "cappea" entre 0 y weeklyTarget (para mostrar X de Y).
 */
export function applyWeeklyProgress(
  goal: Goal,
  delta: number,
  todayISO: string
): Goal {
  const next = { ...goal };
  const nextCount = clamp(
    goal.weeklyProgress.count + delta,
    0,
    Math.max(0, goal.weeklyTarget || 0)
  );
  next.weeklyProgress = {
    count: nextCount,
    updatedAt: todayISO,
  };
  return next;
}

/**
 * Actualiza racha a nivel "día con actividad".
 * Regla: si hay actividad hoy y ayer también hubo (según lastCheck), racha++.
 * Si hubo corte (no fue ayer), racha = 1.
 * Si ya se registró hoy, no cambia.
 */
export function applyDailyStreak(goal: Goal, todayISO: string): Goal {
  const g = { ...goal };
  const last = goal.streak.lastCheck;

  if (isSameDay(last, todayISO)) {
    // ya se contó hoy → no tocar
    return g;
  }

  const yesterday = addDaysISO(todayISO, -1);
  let current = 1;

  if (isSameDay(last, yesterday)) {
    current = goal.streak.current + 1;
  }

  g.streak = {
    current,
    highest: Math.max(goal.streak.highest, current),
    active: true,
    lastCheck: todayISO,
  };

  return g;
}

/**
 * Reverso básico al desmarcar: si restamos progreso semanal,
 * no tocamos racha (porque ya hubo actividad ese día). Si querés lógica
 * estricta (quitar racha si "desmarcás" la única actividad del día), habría
 * que llevar un "log diario" en Goals para saber si quedaron actividades.
 */
export function applyWeeklyProgressOnly(
  goal: Goal,
  delta: number,
  todayISO: string
): Goal {
  const ensured = ensureWeeklyWindow(goal, todayISO);
  return applyWeeklyProgress(ensured, delta, todayISO);
}

/**
 * Flujo completo al marcar "hecha hoy":
 * - reset semanal si cambió de semana
 * - +1 al weeklyProgress (cappeado)
 * - actualizar racha diaria (si no se registró hoy)
 */
export function registerActivityToday(goal: Goal, todayISO: string): Goal {
  let g = ensureWeeklyWindow(goal, todayISO);
  g = applyWeeklyProgress(g, +1, todayISO);
  g = applyDailyStreak(g, todayISO);
  return g;
}
