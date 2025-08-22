// providers/TasksProvider.tsx
import React, { useEffect, useState } from "react";
import { Task } from "../models/Task";
import { loadTasks, saveTasks } from "../services/storage";
import { TasksContext } from "../context/TasksContext";
import { isHabit, isStandalone } from "../models/typeGuards";

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

  const bulkAdd = async (newTasks: Task[]) => {
    if (!newTasks?.length) return;
    await persist([...tasks, ...newTasks]);
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
    const todayISO = new Date().toISOString().slice(0, 10);
    const todayIdx = new Date(todayISO).getDay();

    return tasks.filter(t => {
      if (isHabit(t)) return t.dayOfWeek === todayIdx;
      if (isStandalone(t)) {
        const r = t.recurrence?.type;
        if (!r || r === "once") return t.completedDates?.includes(todayISO);
        if (r === "daily") return true;
        if (r === "custom")
          return t.recurrence?.daysOfWeek?.includes(todayIdx) ?? false;
        // weekly/monthly: acá podrías calcular por intervalo si querés
        return false;
      }
      return false; // los project no son “para hoy” por recurrencia
    });
  };

  const getTasksByGoal = (goalId: string) =>
    tasks.filter(t => (t as any).goalId === goalId);

  return (
    <TasksContext.Provider
      value={{
        tasks,
        addTask,
        bulkAdd, // 👈 expuesto
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
