import AsyncStorage from "@react-native-async-storage/async-storage";
import { Goal } from "../models/Goal";
import { Task } from "../models/Task";

const STORAGE_KEY = "goals";

export const saveGoals = async (goals: Goal[]): Promise<void> => {
  try {
    const json = JSON.stringify(goals);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    console.error("Error al guardar los objetivos", e);
  }
};

export const loadGoals = async (): Promise<Goal[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Error al cargar los objetivos", e);
    return [];
  }
};

const LAST_MOOD_KEY = "lastMoodDate";

export const saveMoodDate = async (date: string) => {
  try {
    await AsyncStorage.setItem(LAST_MOOD_KEY, date);
  } catch (error) {
    console.error("Error guardando fecha de estado de ánimo", error);
  }
};

export const loadMoodDate = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LAST_MOOD_KEY);
  } catch (error) {
    console.error("Error cargando fecha de estado de ánimo", error);
    return null;
  }
};

const TASKS_KEY = "REMEMBER_TASKS";

export const loadTasks = async (): Promise<Task[]> => {
  try {
    const json = await AsyncStorage.getItem(TASKS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Error loading tasks from storage:", error);
    return [];
  }
};

export const saveTasks = async (tasks: Task[]): Promise<void> => {
  try {
    const json = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_KEY, json);
  } catch (error) {
    console.error("Error saving tasks to storage:", error);
  }
};
