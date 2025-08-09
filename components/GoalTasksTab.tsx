// components/GoalTasksTab.tsx
import React, { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Task } from "../models/Task";
import { TasksContext } from "../context/TasksContext";
import { ConfirmDialog } from "./ConfirmDialog";
import { GoalsContext } from "../context/GoalsContext";
import { formatCustomDays } from "../utils/dates";

type Props = {
  tasks: Task[];
  goalId: string;
};

export const GoalTasksTab = ({ tasks, goalId }: Props) => {
  const navigation = useNavigation();
  const { updateTask, deleteTask } = useContext(TasksContext);
  const { registerGoalActivity, adjustWeeklyOnly } = useContext(GoalsContext);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  const tasksSorted = useMemo(() => {
    // Ejemplo: primero las que tienen recurrencia semanal, luego “once”
    return [...tasks].sort((a, b) => {
      const ra = a.recurrence?.type || "zzz";
      const rb = b.recurrence?.type || "zzz";
      return ra.localeCompare(rb);
    });
  }, [tasks]);

  const todayISO = useMemo(() => new Date().toISOString().split("T")[0], []);
  const isDoneToday = (t: Task) => t.completedDates?.includes(todayISO);

  const toggleDoneToday = async (t: Task) => {
    const set = new Set(t.completedDates || []);
    const wasDone = set.has(todayISO);

    if (wasDone) {
      // desmarcar
      set.delete(todayISO);
      await updateTask({
        ...t,
        completedDates: Array.from(set),
        updatedAt: new Date().toISOString(),
      });

      if (t.goalId) {
        // Sólo restamos progreso semanal; no tocamos racha por simplicidad
        await adjustWeeklyOnly(t.goalId, -1, todayISO);
      }
    } else {
      // marcar
      set.add(todayISO);
      await updateTask({
        ...t,
        completedDates: Array.from(set),
        updatedAt: new Date().toISOString(),
      });

      if (t.goalId) {
        // +1 y actualizar racha
        await registerGoalActivity(t.goalId, todayISO);
      }
    }
  };

  const handleCreate = () => {
    navigation.navigate({ name: "CreateTask", params: { goalId } } as never);
  };

  const handleEdit = (taskId: string) => {
    navigation.navigate({
      name: "CreateTask",
      params: { goalId, taskId, mode: "edit" },
    } as never);
  };

  const askDelete = (taskId: string) => {
    setToDeleteId(taskId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (toDeleteId) {
      await deleteTask(toDeleteId);
    }
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const recurrenceLabel = (t: Task) => {
    const r = t.recurrence?.type;
    if (!r || r === "once") return "Única";
    if (r === "daily") return "Diaria";
    if (r === "weekdays") return "Lun‑Vie";
    if (r === "custom")
      return `Días: ${formatCustomDays(t.recurrence?.daysOfWeek || [])}`;
    return "Única";
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {tasksSorted.length === 0 ?
          <Text style={styles.noTasks}>Este objetivo aún no tiene tareas.</Text>
        : tasksSorted.map(task => (
            <View key={task.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.taskTitle}>📝 {task.title}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{recurrenceLabel(task)}</Text>
                </View>
              </View>

              {task.subtasks?.length ?
                <View style={{ marginTop: 6 }}>
                  {task.subtasks.map(sub => (
                    <Text key={sub.id} style={styles.subtask}>
                      • {sub.title}
                    </Text>
                  ))}
                </View>
              : <Text style={styles.noSubtasks}>Sin subtareas</Text>}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[
                    styles.doneBtn,
                    isDoneToday(task) && styles.doneBtnActive,
                  ]}
                  onPress={() => toggleDoneToday(task)}
                >
                  <Ionicons
                    name={
                      isDoneToday(task) ? "checkmark-circle" : "ellipse-outline"
                    }
                    size={18}
                    color={isDoneToday(task) ? "#fff" : "#4e88ff"}
                  />
                  <Text
                    style={[
                      styles.doneText,
                      isDoneToday(task) && { color: "#fff" },
                    ]}
                  >
                    {isDoneToday(task) ? "Hecha hoy" : "Marcar hoy"}
                  </Text>
                </TouchableOpacity>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    style={styles.linkBtn}
                    onPress={() => handleEdit(task.id)}
                  >
                    <Ionicons name="pencil" size={16} color="#4e88ff" />
                    <Text style={styles.linkText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.linkBtn}
                    onPress={() => askDelete(task.id)}
                  >
                    <Ionicons name="trash" size={16} color="#ff4d4f" />
                    <Text style={[styles.linkText, { color: "#ff4d4f" }]}>
                      Eliminar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        }
      </ScrollView>

      {/* FAB crear */}
      <TouchableOpacity style={styles.fab} onPress={handleCreate}>
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.fabText}>Nueva tarea</Text>
      </TouchableOpacity>

      {/* Confirmación borrar */}
      <ConfirmDialog
        visible={confirmOpen}
        title="Eliminar tarea"
        message="¿Seguro que querés eliminar esta tarea? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 100 },
  noTasks: { fontSize: 15, color: "#666", textAlign: "center", marginTop: 40 },

  card: {
    backgroundColor: "#f5faff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTitle: { fontSize: 16, fontWeight: "700", color: "#333" },

  badge: {
    backgroundColor: "#e6f0ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 12, color: "#3f73ff", fontWeight: "600" },

  subtask: { fontSize: 14, color: "#444", marginLeft: 8, marginTop: 2 },
  noSubtasks: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    marginTop: 4,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#4e88ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  doneBtnActive: { backgroundColor: "#4e88ff", borderColor: "#4e88ff" },
  doneText: { color: "#4e88ff", fontWeight: "700", fontSize: 12 },

  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  linkText: { color: "#4e88ff", fontWeight: "700", fontSize: 12 },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#4e88ff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    elevation: 3,
  },
  fabText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
});
