import { Task, HabitTask, ProjectTask, StandaloneTask } from "../models/Task";

export const isHabit = (t: Task): t is HabitTask => t.type === "habit";
export const isProject = (t: Task): t is ProjectTask => t.type === "project";
export const isStandalone = (t: Task): t is StandaloneTask =>
  t.type === "standalone";
