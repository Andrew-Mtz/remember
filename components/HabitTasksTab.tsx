// components/HabitTasksTab.tsx
import { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { Task, HabitTask } from "../models/Task";
import { TasksContext } from "../context/TasksContext";
import { GoalsContext } from "../context/GoalsContext";
import { ConfirmDialog } from "./ConfirmDialog";
import { DAY_LETTERS, dayIndexFromISO, todayISOLocal } from "../utils/dates";
import { isHabit } from "../models/typeGuards";

type Props = { tasks: Task[]; goalId: string };

export const HabitTasksTab = ({ tasks, goalId }: Props) => {
  const navigation = useNavigation();
  const { tasks: tasksAll, updateTask, deleteTask } = useContext(TasksContext);
  const { recomputeAfterTaskToggle } = useContext(GoalsContext);

  const todayISO = useMemo(() => todayISOLocal(), []);
  const todayIdx = useMemo(() => dayIndexFromISO(todayISO), [todayISO]);

  const habitTasks = useMemo(() => tasks.filter(isHabit), [tasks]);

  const today = useMemo(
    () => habitTasks.filter(t => t.dayOfWeek === todayIdx),
    [habitTasks, todayIdx]
  );
  const future = useMemo(
    () => habitTasks.filter(t => t.dayOfWeek > todayIdx),
    [habitTasks, todayIdx]
  );
  const past = useMemo(
    () => habitTasks.filter(t => t.dayOfWeek < todayIdx),
    [habitTasks, todayIdx]
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  const isDoneToday = (t: HabitTask) =>
    t.completedDates?.includes(todayISO) ?? false;

  const buildAllAfterUpdate = (u: Task) =>
    tasksAll.map(t => (t.id === u.id ? u : t));
  const buildAllAfterDelete = (id: string) => tasksAll.filter(t => t.id !== id);

  const toggleDoneToday = async (t: HabitTask, disabled: boolean) => {
    if (disabled) return;
    if (t.dayOfWeek !== todayIdx) return; // guard extra

    const now = new Date().toISOString();
    const set = new Set(t.completedDates ?? []);
    set.has(todayISO) ? set.delete(todayISO) : set.add(todayISO);

    const updated: HabitTask = {
      ...t,
      completedDates: Array.from(set),
      updatedAt: now,
    };
    await updateTask(updated);
    await recomputeAfterTaskToggle(
      goalId,
      buildAllAfterUpdate(updated),
      todayISO
    );
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
      await recomputeAfterTaskToggle(
        goalId,
        buildAllAfterDelete(toDeleteId),
        todayISO
      );
    }
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const Section = ({
    title,
    list,
    disabledAll,
    badgePrefix,
  }: {
    title: string;
    list: HabitTask[];
    disabledAll: boolean;
    badgePrefix: string; // "Hoy" | "Día" | "Día"
  }) => (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {list.length ?
        list
          .sort(
            (a, b) =>
              a.dayOfWeek - b.dayOfWeek || a.title.localeCompare(b.title)
          )
          .map(task => {
            const done = isDoneToday(task);
            const disabled = disabledAll;
            return (
              <View
                key={task.id}
                style={[styles.card, disabled && styles.cardDisabled]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.taskTitle}>📝 {task.title}</Text>
                  <View style={[styles.badge, disabled && styles.badgeMuted]}>
                    <Text
                      style={[
                        styles.badgeText,
                        disabled && styles.badgeTextMuted,
                      ]}
                    >{`${badgePrefix}${
                      badgePrefix === "Hoy" ? "" : (
                        `: ${DAY_LETTERS[task.dayOfWeek]}`
                      )
                    }`}</Text>
                  </View>
                </View>

                {task.subtasks?.length ?
                  <View style={{ marginTop: 6 }}>
                    {task.subtasks.map(s => (
                      <Text key={s.id} style={styles.subtask}>
                        • {s.title}
                      </Text>
                    ))}
                  </View>
                : <Text style={styles.noSubtasks}>Sin subtareas</Text>}

                <Text style={styles.planNote}>
                  Día planificado: {DAY_LETTERS[task.dayOfWeek]}
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
                      color={
                        disabled ? "#9db6ff"
                        : done ?
                          "#fff"
                        : "#4e88ff"
                      }
                    />
                    <Text
                      style={[
                        styles.doneText,
                        done && { color: "#fff" },
                        disabled && { color: "#9db6ff" },
                      ]}
                    >
                      {disabled ?
                        "No disponible"
                      : done ?
                        "Hecha hoy"
                      : "Marcar hoy"}
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
            );
          })
      : <Text style={styles.noTasks}>No hay tareas.</Text>}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Section
          title="Tareas de hoy"
          list={today}
          disabledAll={false}
          badgePrefix="Hoy"
        />
        <Section
          title="Tareas futuras"
          list={future}
          disabledAll={true}
          badgePrefix="Día"
        />
        <Section
          title="Tareas pasadas"
          list={past}
          disabledAll={true}
          badgePrefix="Día"
        />
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
  cardDisabled: { opacity: 0.7 },

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

  subtask: { fontSize: 14, color: "#444", marginLeft: 8, marginTop: 2 },
  noSubtasks: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    marginTop: 4,
  },

  planNote: { marginTop: 6, fontSize: 12, color: "#789", fontStyle: "italic" },

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
