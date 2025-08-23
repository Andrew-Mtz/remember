// services/progress.ts
import { HabitGoal } from "../models/Goal";
import { Task } from "../models/Task";
import { addDaysISO, isSameWeek, parseLocalISODate } from "../utils/dates";

// --- helpers ---
const isHabitTask = (
  t: Task
): t is Task & { type: "habit"; goalId: string; dayOfWeek: number } =>
  t.type === "habit";

// Solo tiene sentido para hábitos
export function ensureWeeklyWindowHabit(
  goal: HabitGoal,
  todayISO: string
): HabitGoal {
  if (!isSameWeek(goal.weeklyProgress.updatedAt, todayISO)) {
    return {
      ...goal,
      weeklyProgress: { count: 0, updatedAt: todayISO },
    };
  }
  return goal;
}

// 1) ¿Qué tareas del objetivo aplican a una fecha? (ahora con dayOfWeek: number)
export function goalTasksForDate(
  goalId: string,
  all: Task[],
  dayIndex: number
): Task[] {
  return all.filter(
    t => isHabitTask(t) && t.goalId === goalId && t.dayOfWeek === dayIndex
  );
}

function isTaskDoneOn(task: Task, iso: string): boolean {
  return task.completedDates?.includes(iso) ?? false;
}

// Un día está “cumplido” si TODAS las tareas planificadas para ese día están hechas.
export function isHabitDayComplete(
  goalId: string,
  all: Task[],
  iso: string
): boolean {
  const d = parseLocalISODate(iso);
  const dayIndex = d.getDay(); // 0..6
  const planned = goalTasksForDate(goalId, all, dayIndex);
  if (planned.length === 0) return false; // sin plan → no cuenta
  return planned.every(t => isTaskDoneOn(t, iso));
}

// Al abrir la app (o cambiar de día), verificar si hubo días planificados sin cumplir desde el último registro.
export function applyHabitRollOver(
  goal: HabitGoal,
  allTasks: Task[],
  todayISO: string
): HabitGoal {
  const last = goal.streak.lastCheck;
  if (!last) return goal;

  let cursor = addDaysISO(last, 1);
  let g: HabitGoal = { ...goal };

  while (cursor < todayISO) {
    const dayIdx = parseLocalISODate(cursor).getDay();
    const plannedThatDay =
      goalTasksForDate(goal.id, allTasks, dayIdx).length > 0;
    if (plannedThatDay && !isHabitDayComplete(goal.id, allTasks, cursor)) {
      g = {
        ...g,
        streak: {
          current: 0,
          highest: g.streak.highest,
          active: false,
          lastCheck: g.streak.lastCheck,
          highestAt: g.streak.highestAt,
        },
      };
      break;
    }
    cursor = addDaysISO(cursor, 1);
  }
  return g;
}

// Cuando el día pasa a “cumplido”, si nunca lo contamos hoy: sumamos 1 a weeklyProgress y avanzamos racha.
export function registerHabitDayIfNeeded(
  goal: HabitGoal,
  allTasks: Task[],
  todayISO: string
): HabitGoal {
  let g = ensureWeeklyWindowHabit(goal, todayISO);
  if (!isHabitDayComplete(goal.id, allTasks, todayISO)) return g;

  if (g.streak.lastCheck === todayISO) return g; // ya contado hoy

  const nextCurrent = g.streak.current + 1;
  const bumpedHighest = nextCurrent > g.streak.highest;

  g = {
    ...g,
    streak: {
      current: nextCurrent,
      highest: bumpedHighest ? nextCurrent : g.streak.highest,
      active: true,
      lastCheck: todayISO,
      highestAt: bumpedHighest ? todayISO : g.streak.highestAt,
    },
    weeklyProgress: {
      count: Math.min(g.weeklyProgress.count + 1, g.weeklyTarget),
      updatedAt: todayISO,
    },
  };

  return g;
}

// Si desmarcás y el día deja de estar completo, bajamos el weeklyProgress (no tocamos racha retroactivamente).
export function uncountHabitDayIfBroken(
  goal: HabitGoal,
  allTasks: Task[],
  todayISO: string
): HabitGoal {
  let g = ensureWeeklyWindowHabit(goal, todayISO);
  if (isHabitDayComplete(goal.id, allTasks, todayISO)) return g; // sigue completo

  // 1) bajar progreso semanal
  g = {
    ...g,
    weeklyProgress: {
      count: Math.max(0, g.weeklyProgress.count - 1),
      updatedAt: todayISO,
    },
  };

  // 2) si lo que se deshace es el "día de hoy", revertir la racha de hoy
  if (g.streak.lastCheck === todayISO) {
    const prevCurrent = Math.max(0, g.streak.current - 1);

    // bajar 'highest' solo si el máximo se había subido HOY
    const shouldDropHighest =
      g.streak.highestAt === todayISO && g.streak.highest === g.streak.current;

    const newHighest = shouldDropHighest
      ? Math.max(0, g.streak.highest - 1)
      : g.streak.highest;

    g = {
      ...g,
      streak: {
        current: prevCurrent,
        highest: newHighest,
        active: prevCurrent > 0,
        // mejor aproximación: el último día contado fue "ayer"
        lastCheck: addDaysISO(todayISO, -1),
        highestAt: shouldDropHighest ? undefined : g.streak.highestAt,
      },
    };
  }

  return g;
}

// ---- PROJECT ----
export function projectPercent(all: Task[], goalId: string): number {
  const tasks = all.filter(
    t => t.type === "project" && "goalId" in t && t.goalId === goalId
  );
  if (tasks.length === 0) return 0;
  const done = tasks.filter(t => t.completed).length;
  return Math.round((done / tasks.length) * 100);
}
