import { createContext } from "react";
import { Task } from "../models/Task";

type TasksContextType = {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  getTasksForToday: () => Task[];
  getTasksByGoal: (goalId: string) => Task[];
};

export const TasksContext = createContext<TasksContextType>({
  tasks: [],
  addTask: () => {},
  updateTask: () => {},
  deleteTask: () => {},
  getTasksForToday: () => [],
  getTasksByGoal: () => [],
});
