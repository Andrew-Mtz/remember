import React from "react";
import { Task } from "../models/Task";
import { HabitTasksTab } from "./HabitTasksTab";
import { ProjectTasksTab } from "./ProjectTasksTab";

export const GoalTasksTab = ({
  tasks,
  goalId,
  goalType,
}: {
  tasks: Task[];
  goalId: string;
  goalType: "habit" | "project" | "quit";
}) => {
  if (goalType === "project")
    return <ProjectTasksTab tasks={tasks} goalId={goalId} />;
  // para "quit" no hay tareas; si luego agregamos retos, hacemos otro tab
  return <HabitTasksTab tasks={tasks} goalId={goalId} />;
};
