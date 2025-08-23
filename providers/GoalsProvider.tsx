// providers/GoalsProvider.tsx
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { GoalsContext } from "../context/GoalsContext";
import { Goal, HabitGoal } from "../models/Goal";
import { Task } from "../models/Task";
import { loadGoals, saveGoals } from "../services/storage";
import {
  ensureWeeklyWindowHabit,
  applyHabitRollOver,
  isHabitDayComplete,
  registerHabitDayIfNeeded,
  uncountHabitDayIfBroken,
} from "../services/progress";
import { todayISOLocal } from "../utils/dates";
import { TasksContext } from "../context/TasksContext";

export const GoalsProvider = ({ children }: { children: React.ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const { tasks } = useContext(TasksContext);

  useEffect(() => {
    (async () => {
      const loaded = await loadGoals();
      setGoals(loaded);
    })();
  }, []);

  const persist = async (next: Goal[]) => {
    setGoals(next);
    await saveGoals(next);
  };

  const addGoal = useCallback(
    async (goal: Goal) => {
      await persist([...goals, goal]);
    },
    [goals]
  );

  const updateGoal = useCallback(
    async (goal: Goal) => {
      const next = goals.map(g => (g.id === goal.id ? goal : g));
      await persist(next);
    },
    [goals]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      const next = goals.filter(g => g.id !== id);
      await persist(next);
    },
    [goals]
  );

  // -----------------------------
  // ROLLOVER DIARIO (cambia de día local)
  // -----------------------------
  const [dayKey, setDayKey] = useState<string>(todayISOLocal());

  useEffect(() => {
    const tick = () => {
      const nowISO = todayISOLocal();
      if (nowISO !== dayKey) {
        setDayKey(nowISO);
      }
    };
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [dayKey]);

  // Cuando dayKey cambia => correr rollover diario para HÁBITOS
  useEffect(() => {
    const run = async () => {
      const todayISO = dayKey;
      const next = goals.map(goal => {
        if (goal.type !== "habit") return goal;
        let g = ensureWeeklyWindowHabit(goal as HabitGoal, todayISO);
        g = applyHabitRollOver(g, tasks, todayISO);
        return { ...g, updatedAt: new Date().toISOString() } as HabitGoal;
      });
      await persist(next);
    };
    if (goals.length) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKey]); // solo al cambiar de día

  // -----------------------------
  // RE-EVALUAR HOY cuando cambian tasks
  // (cubre: agregar una task de HOY descompleta el día)
  // -----------------------------
  const tasksHash = useMemo(() => JSON.stringify(tasks.map(t => ({
    id: t.id, type: t.type, goalId: (t as any).goalId, dayOfWeek: (t as any).dayOfWeek,
    completed: (t as any).completed, completedDates: t.completedDates
  }))), [tasks]);

  useEffect(() => {
    const run = async () => {
      const todayISO = todayISOLocal();
      let changed = false;
      const next = goals.map(goal => {
        if (goal.type !== "habit") return goal;
        let g = ensureWeeklyWindowHabit(goal as HabitGoal, todayISO);

        if (isHabitDayComplete(g.id, tasks, todayISO)) {
          g = registerHabitDayIfNeeded(g, tasks, todayISO);
        } else {
          g = uncountHabitDayIfBroken(g, tasks, todayISO);
        }

        if (JSON.stringify(g) !== JSON.stringify(goal)) {
          changed = true;
          return { ...g, updatedAt: new Date().toISOString() } as HabitGoal;
        }
        return goal;
      });
      if (changed) await persist(next);
    };

    if (goals.length) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksHash]); // cada vez que “cambie” la forma relevante de tasks

  /**
   * Se llama al marcar/desmarcar una tarea de HOY.
   * Solo aplica a objetivos de tipo HÁBITO:
   * - mantiene la ventana semanal
   * - aplica rollover de días perdidos
   * - incrementa/decrementa progreso semanal
   * - avanza racha si corresponde
   */
  const recomputeAfterTaskToggle = useCallback(
    async (goalId: string, allTasks: Task[], todayISO: string) => {
      const idx = goals.findIndex(g => g.id === goalId);
      if (idx === -1) return;

      const g0 = goals[idx];
      if (g0.type !== "habit") return; // solo hábitos

      let g = { ...g0 } as HabitGoal;

      // 1) mantener ventana semanal y rollover de días intermedios no cumplidos
      g = ensureWeeklyWindowHabit(g, todayISO) as HabitGoal;
      g = applyHabitRollOver(g, allTasks, todayISO) as HabitGoal;

      // 2) según el estado actual del día, contamos o “descontamos” progreso
      if (isHabitDayComplete(goalId, allTasks, todayISO)) {
        g = registerHabitDayIfNeeded(g, allTasks, todayISO) as HabitGoal;
      } else {
        g = uncountHabitDayIfBroken(g, allTasks, todayISO) as HabitGoal;
      }

      g.updatedAt = new Date().toISOString();

      const next = [...goals];
      next[idx] = g;
      await persist(next);
    },
    [goals]
  );

  const runDailyRollover = useCallback(async (_allTasks: Task[], _todayISO: string) => {
    // ya manejado por el efecto de dayKey
    return;
  }, []);

  const runWeeklyRollover = useCallback(async (_allTasks: Task[], _todayISO: string) => {
    // para hábitos lo maneja ensureWeeklyWindow; proyectos no usan streak semanal aquí
    return;
  }, []);

  return (
    <GoalsContext.Provider
      value={{
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        recomputeAfterTaskToggle,
        runDailyRollover,
        runWeeklyRollover,
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
};
