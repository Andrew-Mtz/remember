// screens/tasks/CreateTaskScreen.tsx
import { useContext, useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import uuid from "react-native-uuid";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GoalsContext } from "../../context/GoalsContext";
import { TasksContext } from "../../context/TasksContext";
import { HabitGoal, ProjectGoal, Goal } from "../../models/Goal";
import { Subtask } from "../../models/Subtask";
import { DAY_LETTERS } from "../../utils/dates";

type Params = {
  goalId?: string; // si viene, define modo habit o project según el goal
  taskId?: string;
  mode?: "edit" | "create";
};

const RECURRENCE_TYPES = [
  "once",
  "daily",
  "weekly",
  "monthly",
  "custom",
] as const;

export const CreateTaskScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<Record<string, Params>, string>>();

  const { goals, recomputeAfterTaskToggle } = useContext(GoalsContext);
  const { tasks, addTask, bulkAdd, updateTask, deleteTask } =
    useContext(TasksContext);

  const editingId = route.params?.taskId;
  const isEdit = route.params?.mode === "edit" && !!editingId;
  const goalIdParam = route.params?.goalId;

  const parentGoal: Goal | undefined = useMemo(
    () => goals.find(g => g.id === goalIdParam),
    [goals, goalIdParam]
  );

  // Deducción de modo:
  // - Si viene goalId y goal.type === "habit" → HabitTask.
  // - Si viene goalId y goal.type === "project" → ProjectTask.
  // - Si NO viene goalId → StandaloneTask.
  const mode: "habit" | "project" | "standalone" =
    !parentGoal ? "standalone"
    : parentGoal.type === "habit" ? "habit"
    : "project";

  useEffect(() => {
    if (parentGoal?.type === "habit") {
      setHabitDays([...(parentGoal as HabitGoal).daysOfWeek]);
      setAssignedDays([]); // reseteamos selección al cambiar de objetivo
    }
  }, [parentGoal?.id]);

  // Estado básico
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Habit-only: días disponibles = parentGoal.daysOfWeek
  const [habitDays, setHabitDays] = useState<number[]>(
    mode === "habit" ? [...(parentGoal as HabitGoal).daysOfWeek] : []
  );
  const [assignedDays, setAssignedDays] = useState<number[]>(
    mode === "habit" ? [] : []
  );

  // Project-only: completed boolean (se mantiene false al crear)
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");

  // Standalone-only
  const [recurrenceType, setRecurrenceType] =
    useState<(typeof RECURRENCE_TYPES)[number]>("once");
  const [interval, setInterval] = useState("1"); // para weekly/monthly
  const [customDays, setCustomDays] = useState<number[]>([]);

  const toggleAssigned = (d: number) => {
    setAssignedDays(prev =>
      prev.includes(d) ?
        prev.filter(x => x !== d)
      : [...prev, d].sort((a, b) => a - b)
    );
  };
  const toggleCustom = (d: number) => {
    setCustomDays(prev =>
      prev.includes(d) ?
        prev.filter(x => x !== d)
      : [...prev, d].sort((a, b) => a - b)
    );
  };

  const addSubtaskLocal = () => {
    if (!newSubtask.trim()) return;
    setSubtasks(prev => [
      ...prev,
      { id: uuid.v4().toString(), title: newSubtask.trim(), completed: false },
    ]);
    setNewSubtask("");
  };
  const removeSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  const canSave = useMemo(() => {
    if (!title.trim()) return false;
    if (mode === "habit") {
      return assignedDays.length > 0; // tiene que asignarse a uno o más días válidos
    }
    // project/standalone: ok con título
    return true;
  }, [title, mode, assignedDays]);

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert(
        "Revisá los datos",
        mode === "habit" ?
          "Elegí al menos un día válido para esta tarea del hábito."
        : "El título es obligatorio."
      );
      return;
    }

    const now = new Date().toISOString();

    if (mode === "habit" && parentGoal?.type === "habit") {
      // Validar que assignedDays ⊆ daysOfWeek del objetivo (si seguís teniendo esa restricción)
      const allowed = new Set((parentGoal as HabitGoal).daysOfWeek);
      if (!assignedDays.every(d => allowed.has(d))) {
        Alert.alert(
          "Días inválidos",
          "Solo podés asignar días definidos por el objetivo."
        );
        return;
      }

      const now = new Date().toISOString();
      const todayISO = now.slice(0, 10);
      const todayIdx = new Date(todayISO).getDay();

      // 👇 crear un task por día seleccionado
      const payloads = assignedDays.map(d => ({
        id: uuid.v4().toString(),
        type: "habit" as const,
        goalId: parentGoal.id,
        title: title.trim(),
        description: description.trim(),
        dayOfWeek: d, // 👈 ahora un único día
        subtasks,
        completed: false,
        completedDates: [],
        createdAt: now,
        updatedAt: now,
      }));

      await bulkAdd(payloads); // 👈 NUEVO

      const nextAllTasks = [...tasks, ...payloads];
      await recomputeAfterTaskToggle(parentGoal.id, nextAllTasks, todayISO);
    } else if (mode === "project" && parentGoal?.type === "project") {
      await addTask({
        id: uuid.v4().toString(),
        type: "project",
        goalId: parentGoal.id,
        title: title.trim(),
        description: description.trim(),
        subtasks,
        completed: false,
        completedDates: [],
        createdAt: now,
        updatedAt: now,
      } as any);
    } else {
      // standalone
      const rec: any =
        recurrenceType === "custom" ? { type: "custom", daysOfWeek: customDays }
        : recurrenceType === "weekly" || recurrenceType === "monthly" ?
          { type: recurrenceType, interval: Number(interval) || 1 }
        : { type: recurrenceType };

      await addTask({
        id: uuid.v4().toString(),
        type: "standalone",
        title: title.trim(),
        description: description.trim(),
        recurrence: rec,
        subtasks,
        completed: false,
        completedDates: [],
        createdAt: now,
        updatedAt: now,
      } as any);
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header propio */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {mode === "habit" ?
            "Nueva tarea de hábito"
          : mode === "project" ?
            "Nuevo paso del proyecto"
          : "Nueva tarea"}
        </Text>
        <TouchableOpacity
          style={{ padding: 8, opacity: canSave ? 1 : 0.5 }}
          disabled={!canSave}
          onPress={handleSave}
        >
          <Text style={styles.save}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Título */}
        <View style={styles.section}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder={
              mode === "project" ? "Ej: Comprar lana" : (
                "Ej: Ver video de inglés"
              )
            }
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, { height: 90, textAlignVertical: "top" }]}
            placeholder="Opcional"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* HÁBITO: asignar días dentro de los del objetivo */}
        {mode === "habit" && parentGoal?.type === "habit" && (
          <View style={styles.section}>
            <Text style={styles.label}>Asignar a días del hábito</Text>
            <View style={styles.daysRow}>
              {habitDays.map(d => (
                <TouchableOpacity
                  key={d}
                  onPress={() => toggleAssigned(d)}
                  style={[
                    styles.dayBtn,
                    assignedDays.includes(d) && styles.dayActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      assignedDays.includes(d) && styles.dayTextActive,
                    ]}
                  >
                    {DAY_LETTERS[d]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.helper}>
              Solo podés elegir entre los días configurados en el objetivo.
            </Text>
          </View>
        )}

        {/* SUBTAREAS: disponible en todos los modos */}
        <View style={styles.section}>
          <Text style={styles.label}>Subtareas (opcional)</Text>
          <View style={styles.subtaskRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Ej: Conseguir el patrón / Calentamiento / Vocabulario"
              value={newSubtask}
              onChangeText={setNewSubtask}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addSubtaskLocal}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          {subtasks.map(s => (
            <View key={s.id} style={styles.subtaskItem}>
              <Text style={styles.subtaskText}>• {s.title}</Text>
              <TouchableOpacity onPress={() => removeSubtask(s.id)}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* STANDALONE: recurrencia */}
        {mode === "standalone" && (
          <View style={styles.section}>
            <Text style={styles.label}>Recurrencia</Text>
            <View style={styles.rowWrap}>
              {RECURRENCE_TYPES.map(rt => (
                <TouchableOpacity
                  key={rt}
                  style={[
                    styles.chip,
                    recurrenceType === rt && styles.chipActive,
                  ]}
                  onPress={() => setRecurrenceType(rt)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      recurrenceType === rt && styles.chipTextActive,
                    ]}
                  >
                    {rt === "once" ?
                      "Única"
                    : rt === "daily" ?
                      "Diaria"
                    : rt === "weekly" ?
                      "Semanal"
                    : rt === "monthly" ?
                      "Mensual"
                    : "Personalizada"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(recurrenceType === "weekly" || recurrenceType === "monthly") && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.label}>
                  Intervalo{" "}
                  {recurrenceType === "weekly" ? "(semanas)" : "(meses)"}
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={interval}
                  onChangeText={setInterval}
                  placeholder="1"
                />
              </View>
            )}

            {recurrenceType === "custom" && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.label}>Días</Text>
                <View style={styles.daysRow}>
                  {[0, 1, 2, 3, 4, 5, 6].map(d => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => toggleCustom(d)}
                      style={[
                        styles.dayBtn,
                        customDays.includes(d) && styles.dayActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          customDays.includes(d) && styles.dayTextActive,
                        ]}
                      >
                        {DAY_LETTERS[d]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  save: { color: "#4e88ff", fontSize: 16, fontWeight: "700" },

  content: { padding: 20, paddingBottom: 60 },

  section: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "700", color: "#333", marginBottom: 8 },

  row: { flexDirection: "row", gap: 8 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f6f6f6",
  },
  chipActive: { backgroundColor: "#4e88ff", borderColor: "#4e88ff" },
  chipText: { color: "#444", fontWeight: "700", fontSize: 12 },
  chipTextActive: { color: "#fff" },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#333",
  },

  daysRow: { flexDirection: "row", justifyContent: "space-between" },
  dayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  dayActive: { backgroundColor: "#4e88ff", borderColor: "#4e88ff" },
  dayText: { color: "#333", fontWeight: "700" },
  dayTextActive: { color: "#fff" },

  subtaskRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  addBtn: {
    backgroundColor: "#4e88ff",
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  subtaskItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f7faff",
    borderWidth: 1,
    borderColor: "#e7efff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 6,
  },
  subtaskText: { fontSize: 14, color: "#333" },

  helper: { fontSize: 12, color: "#666", marginTop: 6 },
});
