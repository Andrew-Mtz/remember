import { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { Task } from "../models/Task";
import { TasksContext } from "../context/TasksContext";
import { GoalsContext } from "../context/GoalsContext";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  DAY_LETTERS,
  todayISOLocal,
  dayIndexFromISO,
} from "../utils/dates";
import { isHabit } from "../models/typeGuards";

type HabitTask = Task & { type: "habit"; goalId: string; dayOfWeek: number };

type Props = {
  tasks: Task[];
  goalId: string;
};

type SectionItem = {
  task: HabitTask;
  label: string;     // "Hoy" | "Próx: X" | "Últ: L"
  disabled: boolean; // futuras/pasadas no interactúan
};

export const HabitTasksTab = ({ tasks, goalId }: Props) => {
  const navigation = useNavigation();
  const { tasks: tasksAll, updateTask, deleteTask } = useContext(TasksContext);
  const { recomputeAfterTaskToggle } = useContext(GoalsContext);

  // Fechas y día SIEMPRE en local
  const todayISO = useMemo(() => todayISOLocal(), []);
  const todayIdx = useMemo(() => dayIndexFromISO(todayISO), [todayISO]);

  // Solo hábitos con dayOfWeek:number
  const habitTasks = useMemo(() => tasks.filter(isHabit), [tasks]);

  // Agrupación: hoy / futuras / pasadas (sin duplicar tareas)
  const { today, future, past } = useMemo(() => {
    const t: SectionItem[] = [];
    const f: SectionItem[] = [];
    const p: SectionItem[] = [];

    habitTasks.forEach(task => {
      const d = task.dayOfWeek; // 0..6 local
      if (d === todayIdx) {
        t.push({ task, label: "Hoy", disabled: false });
      } else if (d > todayIdx) {
        f.push({ task, label: `Próx: ${DAY_LETTERS[d]}`, disabled: true });
      } else {
        p.push({ task, label: `Últ: ${DAY_LETTERS[d]}`, disabled: true });
      }
    });

    const sortFn = (a: SectionItem, b: SectionItem) =>
      a.task.dayOfWeek - b.task.dayOfWeek ||
      a.task.title.localeCompare(b.task.title);

    return {
      today: t.sort(sortFn),
      future: f.sort(sortFn),
      past: p.sort(sortFn),
    };
  }, [habitTasks, todayIdx]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  const isDoneToday = (t: HabitTask) =>
    t.completedDates?.includes(todayISO) ?? false;

  const buildAllAfterUpdate = (u: Task) =>
    tasksAll.map(t => (t.id === u.id ? u : t));
  const buildAllAfterDelete = (id: string) =>
    tasksAll.filter(t => t.id !== id);

  // Toggle botón "Marcar hoy"
  const toggleDoneToday = async (t: HabitTask, disabled: boolean) => {
    if (disabled) return;
    if (t.dayOfWeek !== todayIdx) {
      Alert.alert(
        "No corresponde hoy",
        `Esta tarea es para ${DAY_LETTERS[t.dayOfWeek]}.`
      );
      return;
    }

    const now = new Date().toISOString(); // timestamp (no afecta local/UTC de la fecha del día)
    const set = new Set(t.completedDates ?? []);
    set.has(todayISO) ? set.delete(todayISO) : set.add(todayISO);

    const updated: HabitTask = {
      ...t,
      completedDates: Array.from(set),
      updatedAt: now,
    };
    await updateTask(updated);
    const nextAll = buildAllAfterUpdate(updated);
    await recomputeAfterTaskToggle(goalId, nextAll, todayISO);
  };

  // Toggle de subtarea + auto-completar/descompletar el DÍA local
  const toggleSubtask = async (t: HabitTask, subId: string, disabled: boolean) => {
    if (disabled) return;
    if (t.dayOfWeek !== todayIdx) return;

    const now = new Date().toISOString();
    const nextSubtasks = (t.subtasks ?? []).map(s =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );

    const hasSubs = nextSubtasks.length > 0;
    const allChecked = hasSubs && nextSubtasks.every(s => s.completed);

    const set = new Set(t.completedDates ?? []);
    if (allChecked) set.add(todayISO);
    else set.delete(todayISO);

    const updated: HabitTask = {
      ...t,
      subtasks: nextSubtasks,
      completedDates: Array.from(set),
      updatedAt: now,
    };

    await updateTask(updated);
    const nextAll = buildAllAfterUpdate(updated);
    await recomputeAfterTaskToggle(goalId, nextAll, todayISO);
  };

  const handleCreate = () =>
    navigation.navigate({ name: "CreateTask", params: { goalId } } as never);

  const handleEdit = (taskId: string) =>
    navigation.navigate({
      name: "CreateTask",
      params: { goalId, taskId, mode: "edit" },
    } as never);

  const askDelete = (taskId: string) => {
    setToDeleteId(taskId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (toDeleteId) {
      await deleteTask(toDeleteId);
      const nextAll = buildAllAfterDelete(toDeleteId);
      await recomputeAfterTaskToggle(goalId, nextAll, todayISO);
    }
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const Section = ({ title, items }: { title: string; items: SectionItem[] }) => (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.length ? (
        items.map(({ task, label, disabled }) => {
          const done = isDoneToday(task);
          return (
            <View key={task.id} style={[styles.card, disabled && styles.cardDisabled]}>
              <View style={styles.cardHeader}>
                <Text style={styles.taskTitle}>📝 {task.title}</Text>
                <View style={[styles.badge, disabled && styles.badgeMuted]}>
                  <Text style={[styles.badgeText, disabled && styles.badgeTextMuted]}>
                    {label}
                  </Text>
                </View>
              </View>

              {/* Subtareas con toggle */}
              {task.subtasks?.length ? (
                <View style={{ marginTop: 8 }}>
                  {task.subtasks.map(s => {
                    const checked = !!s.completed;
                    const icon = checked ? "checkbox" : "square-outline";
                    const iconColor = disabled ? "#9db6ff" : "#4e88ff";
                    return (
                      <TouchableOpacity
                        key={s.id}
                        style={[styles.subtaskRow, disabled && { opacity: 0.7 }]}
                        disabled={disabled}
                        onPress={() => toggleSubtask(task, s.id, disabled)}
                      >
                        <Ionicons name={icon as any} size={18} color={iconColor} />
                        <Text
                          style={[
                            styles.subtaskText,
                            disabled && { color: "#889" },
                            checked && { textDecorationLine: "line-through" },
                          ]}
                        >
                          {s.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.noSubtasks}>Sin subtareas</Text>
              )}

              <Text style={styles.planNote}>
                Plan: {DAY_LETTERS[task.dayOfWeek]}
              </Text>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[
                    styles.doneBtn,
                    done && styles.doneBtnActive,
                    disabled && styles.doneBtnDisabled,
                  ]}
                  disabled={disabled}
                  onPress={() => toggleDoneToday(task, disabled)}
                >
                  <Ionicons
                    name={done ? "checkmark-circle" : "ellipse-outline"}
                    size={18}
                    color={disabled ? "#9db6ff" : done ? "#fff" : "#4e88ff"}
                  />
                  <Text
                    style={[
                      styles.doneText,
                      done && { color: "#fff" },
                      disabled && { color: "#9db6ff" },
                    ]}
                  >
                    {disabled ? "No disponible" : done ? "Hecha hoy" : "Marcar hoy"}
                  </Text>
                </TouchableOpacity>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity style={styles.linkBtn} onPress={() => handleEdit(task.id)}>
                    <Ionicons name="pencil" size={16} color="#4e88ff" />
                    <Text style={styles.linkText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.linkBtn} onPress={() => askDelete(task.id)}>
                    <Ionicons name="trash" size={16} color="#ff4d4f" />
                    <Text style={[styles.linkText, { color: "#ff4d4f" }]}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })
      ) : (
        <Text style={styles.noTasks}>No hay tareas.</Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Section title="Tareas de hoy" items={today} />
        <Section title="Tareas futuras" items={future} />
        <Section title="Tareas pasadas" items={past} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleCreate}>
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.fabText}>Nueva tarea</Text>
      </TouchableOpacity>

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
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#333" },
  noTasks: { fontSize: 14, color: "#666", marginTop: 6 },

  card: {
    backgroundColor: "#f5faff",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  cardDisabled: { opacity: 0.85 },

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
  badgeMuted: { backgroundColor: "#edf2ff" },
  badgeText: { fontSize: 12, color: "#3f73ff", fontWeight: "600" },
  badgeTextMuted: { color: "#8aa6ff" },

  subtaskRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  subtaskText: { fontSize: 14, color: "#333" },
  noSubtasks: { fontSize: 14, color: "#888", fontStyle: "italic", marginTop: 4 },

  planNote: { marginTop: 8, fontSize: 12, color: "#789", fontStyle: "italic" },

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
  doneBtnDisabled: { borderColor: "#b9c8ff", backgroundColor: "#f0f4ff" },
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
