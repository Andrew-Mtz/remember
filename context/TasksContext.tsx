// context/TasksContext.ts
import { createContext } from "react";
import { Task } from "../models/Task";

type TasksContextType = {
  tasks: Task[];
  addTask: (task: Task) => Promise<void>;
  bulkAdd: (newTasks: Task[]) => Promise<void>; // 👈 NUEVO
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTasksForToday: () => Task[];
  getTasksByGoal: (goalId: string) => Task[];
};

export const TasksContext = createContext<TasksContextType>({
  tasks: [],
  addTask: async () => {},
  bulkAdd: async () => {}, // 👈 NUEVO
  updateTask: async () => {},
  deleteTask: async () => {},
  getTasksForToday: () => [],
  getTasksByGoal: () => [],
});
