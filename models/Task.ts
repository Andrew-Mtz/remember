import { Subtask } from "./Subtask";

export type Priority = "high" | "medium" | "low";

export type TaskBase = {
  id: string;
  title: string;
  description?: string;

  reminder?: {
    enabled: boolean;
    time?: string;
  };

  subtasks?: Subtask[];
  completed: boolean;
  completedDates: string[]; // útil para hábitos o recurrentes

  createdAt: string;
  updatedAt: string;
};

/** ---------------- HABITS ---------------- **/
export type HabitTask = TaskBase & {
  type: "habit";
  goalId: string; // siempre ligado a un hábito
  dayOfWeek: number; // día en el que corresponde esta tarea (ej: 1=lunes)
};

/** ---------------- PROJECTS ---------------- **/
export type ProjectTask = TaskBase & {
  type: "project";
  goalId: string;
  priority?: Priority; // alta, media, baja
  order?: number; // 1..N (puede repetirse)
};

export type StandaloneTask = TaskBase & {
  type: "standalone";
  recurrence: {
    type: "once" | "daily" | "weekly" | "monthly" | "custom";
    interval?: number; // ej: cada 2 semanas, cada 3 meses
    daysOfWeek?: number[]; // ej: lunes y jueves
  };
};

export type Task = HabitTask | ProjectTask | StandaloneTask;
