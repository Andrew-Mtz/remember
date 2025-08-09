import React, { useEffect, useState } from "react";
import { Task } from "../models/Task";
import { loadTasks, saveTasks } from "../services/storage";
import { TasksContext } from "../context/TasksContext";

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    (async () => {
      const loaded = await loadTasks();
      setTasks(loaded);
    })();
  }, []);

  const persist = async (newTasks: Task[]) => {
    setTasks(newTasks);
    await saveTasks(newTasks);
  };

  const addTask = async (task: Task) => {
    await persist([...tasks, task]);
  };

  const updateTask = async (task: Task) => {
    const updated = tasks.map(t => (t.id === task.id ? task : t));
    await persist(updated);
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    await persist(updated);
  };

  const getTasksForToday = () => {
    const today = new Date().toISOString().split("T")[0];
    return tasks.filter(
      t =>
        t.date === today ||
        t.recurrence?.type === "daily" ||
        (t.recurrence?.type === "weekdays" &&
          new Date().getDay() >= 1 &&
          new Date().getDay() <= 5) ||
        (t.recurrence?.type === "custom" &&
          t.recurrence.daysOfWeek?.includes(new Date().getDay()))
    );
  };

  const getTasksByGoal = (goalId: string) =>
    tasks.filter(t => t.goalId === goalId);

  return (
    <TasksContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        getTasksForToday,
        getTasksByGoal,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};
