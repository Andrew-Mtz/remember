import { HabitTask, ProjectTask } from "./Task";

export type GoalType = "habit" | "project";

export type ProjectOrdering = "priority" | "order" | "manual";

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

export type BaseGoal = {
  id: string;
  emoji?: string;
  title: string;
  description?: string;
  category: string;
  startDate: string;
  endDate?: string;
  messages: GoalMessages;
  remindersEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HabitGoal = BaseGoal & {
  type: "habit";
  progressType: "days";
  /** Días activos de la semana (0=Dom ... 6=Sáb) */
  daysOfWeek: number[];
  /** DERIVADO: igual a daysOfWeek.length, se persiste para acceso rápido en UI */
  weeklyTarget: number;

  streak: {
    current: number;
    highest: number;
    active: boolean;
    lastCheck: string;
    highestAt?: string;
  };
  weeklyProgress: {
    count: number;
    updatedAt: string;
  };
  tasks: HabitTask[];
};

export type ProjectGoal = BaseGoal & {
  type: "project";
  taskOrdering: ProjectOrdering;
  progressType: "tasks";
  tasks: ProjectTask[]; // lista de pasos únicos
};

export type QuitGoal = BaseGoal & {
  type: "quit";
  progressType: "streak"; // para diferenciar en UI
  streak: {
    current: number;
    highest: number;
    active: boolean;
    lastCheck: string; // última fecha procesada (ISO)
  };
  relapses: { date: string; reason?: string }[]; // recaídas con motivo
  baselinePerWeek?: number; // estimación inicial de frecuencia
  stats?: {
    rollingPerWeek: number; // frecuencia actual estimada
    updatedAt: string;
  };
};

export type Goal = HabitGoal | ProjectGoal | QuitGoal;
