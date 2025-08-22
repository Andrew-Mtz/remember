// providers/GoalsProvider.tsx
import React, { useCallback, useEffect, useState } from "react";
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

export const GoalsProvider = ({ children }: { children: React.ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>([]);

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

  /**
   * Opcional: al abrir la app o cambiar de día
   * recalcular pérdidas de racha si hubo días planificados no cumplidos.
   */
  const runDailyRollover = useCallback(
    async (allTasks: Task[], todayISO: string) => {
      const next = goals.map(goal => {
        if (goal.type !== "habit") return goal;
        let g = ensureWeeklyWindowHabit(goal, todayISO) as HabitGoal;
        g = applyHabitRollOver(g, allTasks, todayISO) as HabitGoal;
        return g;
      });
      await persist(next);
    },
    [goals]
  );

  const runWeeklyRollover = useCallback(
    async (_allTasks: Task[], _todayISO: string) => {
      // Para hábitos, el reseteo de semana lo maneja ensureWeeklyWindow.
      return;
    },
    []
  );

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
