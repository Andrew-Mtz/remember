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
import { HabitGoal, Goal } from "../../models/Goal";
import { Task } from "../../models/Task";
import { Subtask } from "../../models/Subtask";
import { DAY_LETTERS, todayISOLocal } from "../../utils/dates";
import { GoalPicker } from "../../components/GoalPicker";

type Params = {
  goalId?: string; // si viene, se preselecciona
  taskId?: string;
  mode?: "edit" | "create";
};

// ✅ Un solo set de recurrencias (sin “monthly”)
const RECURRENCE_TYPES = ["once", "daily", "weekly", "custom"] as const;
type RecurrenceType = (typeof RECURRENCE_TYPES)[number];

export const CreateTaskScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<Record<string, Params>, string>>();

  const { goals, recomputeAfterTaskToggle } = useContext(GoalsContext);
  const { tasks, addTask, bulkAdd, updateTask } = useContext(TasksContext);

  const editingId = route.params?.taskId;
  const isEdit = route.params?.mode === "edit" && !!editingId;

  // Tarea en edición (si aplica)
  const editingTask: Task | undefined = useMemo(
    () => (isEdit ? tasks.find(t => t.id === editingId) : undefined),
    [isEdit, editingId, tasks]
  );

  // -------------------------
  // Selector de objetivo (unificado)
  // -------------------------
  // Inicial: si vengo con goalId → ese; si edito una tarea con goal (habit/project) lo seteo por efecto.
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(
    route.params?.goalId
  );

  // 🔧 Fix TS: seteamos desde la tarea en edición SOLO si no es standalone
  useEffect(() => {
    if (isEdit && editingTask && editingTask.type !== "standalone") {
      setSelectedGoalId((editingTask as any).goalId);
    }
  }, [isEdit, editingTask]);

  const selectedGoal: Goal | undefined = useMemo(
    () => goals.find(g => g.id === selectedGoalId),
    [goals, selectedGoalId]
  );

  // Deducción de modo (si no hay objetivo → standalone)
  const mode: "habit" | "project" | "standalone" =
    !selectedGoal ? "standalone" : selectedGoal.type === "habit" ? "habit" : "project";

  // -------------------------
  // Estado base + subtareas
  // -------------------------
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");

  // -------------------------
  // HÁBITO
  // -------------------------
  const [habitDays, setHabitDays] = useState<number[]>(
    selectedGoal?.type === "habit" ? [...(selectedGoal as HabitGoal).daysOfWeek] : []
  );
  const [assignedDays, setAssignedDays] = useState<number[]>([]); // CREATE
  const [selectedDayEdit, setSelectedDayEdit] = useState<number | null>(null); // EDIT

  // -------------------------
  // PROJECT
  // -------------------------
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [orderStr, setOrderStr] = useState<string>("");

  // -------------------------
  // STANDALONE (unificado)
  // -------------------------
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("once");
  const [interval, setInterval] = useState("1"); // para weekly
  const [customDays, setCustomDays] = useState<number[]>([]);

  // -------------------------
  // Prefill en edición
  // -------------------------
  useEffect(() => {
    if (!isEdit || !editingTask) return;

    // Base
    setTitle(editingTask.title ?? "");
    setDescription(editingTask.description ?? "");
    setSubtasks(editingTask.subtasks ?? []);

    if (editingTask.type === "habit") {
      if (selectedGoal?.type === "habit") {
        setHabitDays([...(selectedGoal as HabitGoal).daysOfWeek]);
      }
      setSelectedDayEdit((editingTask as any).dayOfWeek ?? null);
    } else if (editingTask.type === "project") {
      setPriority((editingTask.priority as any) ?? "medium");
      setOrderStr(
        typeof editingTask.order === "number" ? String(editingTask.order) : ""
      );
    } else if (editingTask.type === "standalone") {
      const r = editingTask.recurrence;
      const type = (r?.type ?? "once") as RecurrenceType;
      setRecurrenceType(type);
      if (type === "weekly") {
        setInterval(String(r?.interval ?? 1));
      } else if (type === "custom") {
        setCustomDays([...(r?.daysOfWeek ?? [])]);
      }
    }
  }, [isEdit, editingTask, selectedGoal]);

  // Si cambia objetivo en creación → refrescar dependencias
  useEffect(() => {
    if (isEdit) return; // en edición no migramos objetivo
    if (selectedGoal?.type === "habit") {
      setHabitDays([...(selectedGoal as HabitGoal).daysOfWeek]);
      setAssignedDays([]);
    } else {
      setHabitDays([]);
      setAssignedDays([]);
    }
    if (selectedGoal?.type !== "project") {
      setPriority("medium");
      setOrderStr("");
    }
    if (selectedGoal) {
      // no standalone
      setRecurrenceType("once");
      setInterval("1");
      setCustomDays([]);
    }
  }, [isEdit, selectedGoal?.id, selectedGoal?.type]);

  // -------------------------
  // Helpers UI
  // -------------------------
  const toggleAssigned = (d: number) => {
    setAssignedDays(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort((a, b) => a - b)
    );
  };
  const toggleCustom = (d: number) => {
    setCustomDays(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort((a, b) => a - b)
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

  // -------------------------
  // Validación
  // -------------------------
  const canSave = useMemo(() => {
    if (!title.trim()) return false;
    if (mode === "habit") {
      return isEdit ? selectedDayEdit !== null : assignedDays.length > 0;
    }
    return true;
  }, [title, mode, isEdit, assignedDays, selectedDayEdit]);

  // -------------------------
  // Guardado
  // -------------------------
  const handleSave = async () => {
    if (!canSave) {
      Alert.alert(
        "Revisá los datos",
        mode === "habit"
          ? isEdit
            ? "Elegí un día válido para esta tarea del hábito."
            : "Elegí al menos un día válido para esta tarea del hábito."
          : "El título es obligatorio."
      );
      return;
    }

    const now = new Date().toISOString();
    const todayISO = todayISOLocal(); // ✅ local

    // ----- EDICIÓN -----
    if (isEdit && editingTask) {
      if (editingTask.type === "habit") {
        if (selectedGoal?.type !== "habit") return;
        const allowed = new Set((selectedGoal as HabitGoal).daysOfWeek);
        if (selectedDayEdit === null || !allowed.has(selectedDayEdit)) {
          Alert.alert("Día inválido", "Solo podés elegir entre los días del objetivo.");
          return;
        }
        const updated: Task = {
          ...editingTask,
          title: title.trim(),
          description: description.trim(),
          subtasks,
          dayOfWeek: selectedDayEdit as number,
          updatedAt: now,
        } as any;

        await updateTask(updated);
        const nextAll = tasks.map(t => (t.id === updated.id ? updated : t));
        await recomputeAfterTaskToggle(selectedGoal.id, nextAll, todayISO);
        navigation.goBack();
        return;
      }

      if (editingTask.type === "project") {
        const orderNum = Number.isFinite(Number(orderStr)) ? Number(orderStr) : undefined;
        const updated: Task = {
          ...editingTask,
          title: title.trim(),
          description: description.trim(),
          priority,
          order: orderNum,
          subtasks,
          updatedAt: now,
        };
        await updateTask(updated);
        navigation.goBack();
        return;
      }

      if (editingTask.type === "standalone") {
        let rec: any;
        switch (recurrenceType) {
          case "custom":
            rec = { type: "custom", daysOfWeek: customDays };
            break;
          case "weekly":
            rec = { type: "weekly", interval: Number(interval) || 1 };
            break;
          case "daily":
          case "once":
          default:
            rec = { type: recurrenceType };
        }
        const updated: Task = {
          ...editingTask,
          title: title.trim(),
          description: description.trim(),
          subtasks,
          recurrence: rec,
          updatedAt: now,
        };
        await updateTask(updated);
        navigation.goBack();
        return;
      }
    }

    // ----- CREACIÓN -----
    if (mode === "habit" && selectedGoal?.type === "habit") {
      const allowed = new Set((selectedGoal as HabitGoal).daysOfWeek);
      if (!assignedDays.every(d => allowed.has(d))) {
        Alert.alert("Días inválidos", "Solo podés asignar días definidos por el objetivo.");
        return;
      }
      const payloads: Task[] = assignedDays.map(d => ({
        id: uuid.v4().toString(),
        type: "habit",
        goalId: selectedGoal.id,
        title: title.trim(),
        description: description.trim(),
        dayOfWeek: d,
        subtasks,
        completed: false,
        completedDates: [],
        createdAt: now,
        updatedAt: now,
      })) as any;

      await bulkAdd(payloads);
      const nextAll = [...tasks, ...payloads];
      await recomputeAfterTaskToggle(selectedGoal.id, nextAll, todayISO);
      navigation.goBack();
      return;
    }

    if (mode === "project" && selectedGoal?.type === "project") {
      const orderNum = Number.isFinite(Number(orderStr)) ? Number(orderStr) : undefined;
      await addTask({
        id: uuid.v4().toString(),
        type: "project",
        goalId: selectedGoal.id,
        title: title.trim(),
        description: description.trim(),
        priority,
        order: orderNum,
        subtasks,
        completed: false,
        completedDates: [],
        createdAt: now,
        updatedAt: now,
      } as any);
      navigation.goBack();
      return;
    }

    // standalone
    let rec: any;
    switch (recurrenceType) {
      case "custom":
        rec = { type: "custom", daysOfWeek: customDays };
        break;
      case "weekly":
        rec = { type: "weekly", interval: Number(interval) || 1 };
        break;
      case "daily":
      case "once":
      default:
        rec = { type: recurrenceType };
    }
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
    navigation.goBack();
  };

  const StandaloneRecurrence = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Recurrencia</Text>
      <View style={styles.rowWrap}>
        {RECURRENCE_TYPES.map(rt => {
          const active = recurrenceType === rt;
          return (
            <TouchableOpacity
              key={rt}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setRecurrenceType(rt)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {rt === "once"
                  ? "Única"
                  : rt === "daily"
                    ? "Diaria"
                    : rt === "weekly"
                      ? "Semanal"
                      : "Personalizada"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {recurrenceType === "weekly" && (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.label}>Intervalo (semanas)</Text>
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
            {[0, 1, 2, 3, 4, 5, 6].map(d => {
              const selected = customDays.includes(d);
              return (
                <TouchableOpacity
                  key={d}
                  onPress={() => toggleCustom(d)}
                  style={[styles.dayBtn, selected && styles.dayActive]}
                >
                  <Text style={[styles.dayText, selected && styles.dayTextActive]}>
                    {DAY_LETTERS[d]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={{ padding: 8 }} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {isEdit
            ? mode === "habit"
              ? "Editar tarea de hábito"
              : mode === "project"
                ? "Editar paso del proyecto"
                : "Editar tarea"
            : mode === "habit"
              ? "Nueva tarea de hábito"
              : mode === "project"
                ? "Nuevo paso del proyecto"
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
        {/* Selector de objetivo */}
        <GoalPicker
          goals={goals}
          selectedGoalId={selectedGoalId}
          onChange={id => setSelectedGoalId(id)}
          disabled={isEdit} // en edición no migramos objetivo
          onCreateNewGoal={() => navigation.navigate("CreateGoalModal" as never)}
        />

        {/* Título */}
        <View style={styles.section}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder={mode === "project" ? "Ej: Comprar lana" : "Ej: Ver video de inglés"}
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

        {/* PROJECT: prioridad y orden */}
        {mode === "project" && selectedGoal?.type === "project" && (
          <View style={styles.section}>
            <Text style={styles.label}>Prioridad</Text>
            <View style={styles.rowWrap}>
              {(["low", "medium", "high"] as const).map(p => {
                const active = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {p === "high" ? "Alta" : p === "medium" ? "Media" : "Baja"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Orden (opcional)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Ej: 1"
                value={orderStr}
                onChangeText={setOrderStr}
              />
            </View>
          </View>
        )}

        {/* HÁBITO: días válidos */}
        {mode === "habit" && selectedGoal?.type === "habit" && (
          <View style={styles.section}>
            <Text style={styles.label}>
              {isEdit ? "Día asignado" : "Asignar a días del hábito"}
            </Text>
            <View style={styles.daysRow}>
              {habitDays.map(d => {
                const selected = isEdit ? selectedDayEdit === d : assignedDays.includes(d);
                return (
                  <TouchableOpacity
                    key={d}
                    onPress={() =>
                      isEdit ? setSelectedDayEdit(d) : toggleAssigned(d)
                    }
                    style={[styles.dayBtn, selected && styles.dayActive]}
                  >
                    <Text style={[styles.dayText, selected && styles.dayTextActive]}>
                      {DAY_LETTERS[d]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.helper}>
              Solo podés elegir {isEdit ? "un día válido" : "entre los días configurados en el objetivo"}.
            </Text>
          </View>
        )}

        {/* SUBTAREAS */}
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
              {RECURRENCE_TYPES.map(rt => {
                const active = recurrenceType === rt;
                return (
                  <TouchableOpacity
                    key={rt}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setRecurrenceType(rt)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {rt === "once"
                        ? "Única"
                        : rt === "daily"
                          ? "Diaria"
                          : rt === "weekly"
                            ? "Semanal"
                            : "Personalizada"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {recurrenceType === "weekly" && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.label}>Intervalo (semanas)</Text>
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
                  {[0, 1, 2, 3, 4, 5, 6].map(d => {
                    const selected = customDays.includes(d);
                    return (
                      <TouchableOpacity
                        key={d}
                        onPress={() => toggleCustom(d)}
                        style={[styles.dayBtn, selected && styles.dayActive]}
                      >
                        <Text style={[styles.dayText, selected && styles.dayTextActive]}>
                          {DAY_LETTERS[d]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
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
  chipDisabled: { opacity: 0.5 },
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
