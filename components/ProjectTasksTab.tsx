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
import { Task } from "../models/Task";
import { TasksContext } from "../context/TasksContext";
import { ConfirmDialog } from "./ConfirmDialog";

const pr = { high: 0, medium: 1, low: 2 } as const;

export const ProjectTasksTab = ({
  tasks,
  goalId,
}: {
  tasks: Task[];
  goalId: string;
}) => {
  const navigation = useNavigation();
  const { updateTask, deleteTask } = useContext(TasksContext);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  const projectTasks = useMemo(
    () => tasks.filter(t => t.type === "project"),
    [tasks]
  );

  const tasksSorted = useMemo(() => {
    return [...projectTasks].sort((a, b) => {
      const ao =
        (a.order ?? Number.MAX_SAFE_INTEGER) -
        (b.order ?? Number.MAX_SAFE_INTEGER);
      if (ao !== 0) return ao;
      const ap = pr[a.priority ?? "medium"] - pr[b.priority ?? "medium"];
      if (ap !== 0) return ap;
      // incompletas primero
      if (!!a.completed !== !!b.completed) return a.completed ? 1 : -1;
      return a.title.localeCompare(b.title);
    });
  }, [projectTasks]);

  const toggleCompleted = async (t: Task) => {
    const updated: Task = {
      ...t,
      completed: !t.completed,
      updatedAt: new Date().toISOString(),
    };
    await updateTask(updated);
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
    if (toDeleteId) await deleteTask(toDeleteId);
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {tasksSorted.length === 0 ?
          <Text style={styles.noTasks}>Este proyecto aún no tiene tareas.</Text>
        : tasksSorted.map(task => (
            <View key={task.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.taskTitle}>🧩 {task.title}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {task.order ?? "—"}
                    {task.priority ? ` · ${task.priority}` : ""}
                  </Text>
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

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[
                    styles.doneBtn,
                    task.completed && styles.doneBtnActive,
                  ]}
                  onPress={() => toggleCompleted(task)}
                >
                  <Ionicons
                    name={
                      task.completed ? "checkmark-circle" : "ellipse-outline"
                    }
                    size={18}
                    color={task.completed ? "#fff" : "#2bb673"}
                  />
                  <Text
                    style={[
                      styles.doneText,
                      task.completed && { color: "#fff" },
                    ]}
                  >
                    {task.completed ? "Completada" : "Completar"}
                  </Text>
                </TouchableOpacity>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    style={styles.linkBtn}
                    onPress={() => handleEdit(task.id)}
                  >
                    <Ionicons name="pencil" size={16} color="#2b73ff" />
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
  noTasks: { fontSize: 15, color: "#666", textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "#f4fff7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTitle: { fontSize: 16, fontWeight: "700", color: "#233" },
  badge: {
    backgroundColor: "#dff3e7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 12, color: "#2bb673", fontWeight: "600" },
  subtask: { fontSize: 14, color: "#234", marginLeft: 8, marginTop: 2 },
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
    borderColor: "#2bb673",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  doneBtnActive: { backgroundColor: "#2bb673", borderColor: "#2bb673" },
  doneText: { color: "#2bb673", fontWeight: "700", fontSize: 12 },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  linkText: { color: "#2b73ff", fontWeight: "700", fontSize: 12 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#2b73ff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    elevation: 3,
  },
  fabText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
});
