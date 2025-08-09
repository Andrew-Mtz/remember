import { useEffect, useState } from "react";
import { Goal } from "../models/Goal";
import { loadGoals, saveGoals } from "../services/storage";
import { GoalsContext } from "../context/GoalsContext";
import {
  registerActivityToday,
  ensureWeeklyWindow,
  applyWeeklyProgressOnly,
} from "../services/progress";

export const GoalsProvider = ({ children }: { children: React.ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    (async () => {
      const loaded = await loadGoals();
      setGoals(loaded);
    })();
  }, []);

  const addGoal = async (goal: Goal) => {
    const updated = [...goals, goal];
    setGoals(updated);
    await saveGoals(updated);
  };

  const updateGoal = async (goal: Goal) => {
    const updated = goals.map(g => (g.id === goal.id ? goal : g));
    setGoals(updated);
    await saveGoals(updated);
  };

  const deleteGoal = async (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    await saveGoals(updated);
  };

  const registerGoalActivity = async (goalId: string, todayISO: string) => {
    const g = goals.find(x => x.id === goalId);
    if (!g) return;

    let updated = registerActivityToday(g, todayISO);
    updated = { ...updated, updatedAt: new Date().toISOString() };

    await updateGoal(updated);
  };

  const adjustWeeklyOnly = async (
    goalId: string,
    delta: number,
    todayISO: string
  ) => {
    const g = goals.find(x => x.id === goalId);
    if (!g) return;

    let ensured = ensureWeeklyWindow(g, todayISO);
    ensured = applyWeeklyProgressOnly(ensured, delta, todayISO);
    ensured = { ...ensured, updatedAt: new Date().toISOString() };

    await updateGoal(ensured);
  };

  return (
    <GoalsContext.Provider
      value={{
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        registerGoalActivity, // nuevo
        adjustWeeklyOnly, // nuevo
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
};
