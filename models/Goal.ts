import { Task } from "./Task";

export type GoalMessages = {
  fromPast: {
    type: "text" | "audio";
    content: string;
  };
  fromFuture: {
    type: "text" | "video" | "audio";
    content: string;
  };
};

export type Goal = {
  id: string;
  emoji?: string; // opcional, si no se elige uno se usa un emoji por defecto
  title: string;
  description?: string;
  category: string;

  // Métrica principal: "tasks" o "days"
  progressType: "tasks" | "days";
  weeklyTarget: number; // cuántas tareas o días desea lograr por semana

  // Racha total acumulada (días o tareas consecutivos)
  streak: {
    current: number;
    highest: number;
    active: boolean; // ¿sigue en racha?
    lastCheck: string; // fecha de última actividad que contó para la racha
  };

  // Progreso de esta semana
  weeklyProgress: {
    count: number;
    updatedAt: string; // para saber si hay que resetear lunes
  };

  tasks: Task[]; // puede estar vacío si es por días
  startDate: string;
  endDate?: string;

  messages: GoalMessages;
  remindersEnabled: boolean;

  createdAt: string;
  updatedAt: string;
};
