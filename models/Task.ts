import { Subtask } from "./Subtask";

export type Task = {
  id: string;
  title: string;
  description?: string;
  date?: string; // formato ISO: "YYYY-MM-DD"
  goalId?: string; // si es una tarea suelta, esto es undefined

  recurrence?: {
    type: "once" | "daily" | "weekdays" | "custom";
    daysOfWeek?: number[]; // ej: [1,3,5] = lunes, miércoles, viernes
  };

  reminder?: {
    enabled: boolean;
    time?: string;
  };

  subtasks?: Subtask[];
  completed: false;
  completedDates: string[]; // cada vez que se completó

  createdAt: string;
  updatedAt: string;
};
