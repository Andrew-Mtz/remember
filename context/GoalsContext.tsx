import { createContext } from "react";
import { Goal } from "../models/Goal";
import { Task } from "../models/Task";

export type GoalsContextType = {
  goals: Goal[];
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // NUEVO – núcleo del modelo
  recomputeAfterTaskToggle: (
    goalId: string,
    allTasks: Task[],
    todayISO: string
  ) => Promise<void>;

  runDailyRollover: (allTasks: Task[], todayISO: string) => Promise<void>;
  runWeeklyRollover: (allTasks: Task[], todayISO: string) => Promise<void>;
};

export const GoalsContext = createContext<GoalsContextType>({
  goals: [],
  addGoal: async () => {},
  updateGoal: async () => {},
  deleteGoal: async () => {},

  recomputeAfterTaskToggle: async () => {},
  runDailyRollover: async () => {},
  runWeeklyRollover: async () => {},
});
