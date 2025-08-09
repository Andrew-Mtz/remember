import { createContext } from "react";
import { Goal } from "../models/Goal";

type GoalsContextType = {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  registerGoalActivity: (goalId: string, todayISO: string) => Promise<void>;
  adjustWeeklyOnly: (
    goalId: string,
    delta: number,
    todayISO: string
  ) => Promise<void>;
};

export const GoalsContext = createContext<GoalsContextType>({
  goals: [],
  addGoal: () => {},
  updateGoal: () => {},
  deleteGoal: () => {},
  registerGoalActivity: async () => {},
  adjustWeeklyOnly: async () => {},
});
