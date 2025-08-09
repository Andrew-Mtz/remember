import React, { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import uuid from "react-native-uuid";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GoalsContext } from "../context/GoalsContext";
import { TasksContext } from "../context/TasksContext";
import { Task } from "../models/Task";
import { Subtask } from "../models/Subtask";

type Params = { goalId?: string; taskId?: string; mode?: "edit" | "create" };

const DAYS = ["D", "L", "M", "X", "J", "V", "S"]; // 0..6

export const CreateTaskScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<Record<string, Params>, string>>();

  const { goals } = useContext(GoalsContext);
  const { tasks, addTask, updateTask, deleteTask } = useContext(TasksContext);

  const editingId = route.params?.taskId;
  const isEdit = route.params?.mode === "edit" && !!editingId;
  const goalIdParam = route.params?.goalId;

  const existing = useMemo(
    () => (isEdit ? tasks.find(t => t.id === editingId) : undefined),
    [isEdit, editingId, tasks]
  );

  // ---- Estado base ----
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(
    existing?.goalId ?? goalIdParam
  );
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [recurrenceType, setRecurrenceType] = useState<
    "once" | "daily" | "weekdays" | "custom"
  >((existing?.recurrence?.type as any) ?? "once");
  const [selectedDays, setSelectedDays] = useState<number[]>(
    existing?.recurrence?.type === "custom" ?
      (existing?.recurrence?.daysOfWeek ?? [])
    : []
  );
  const [subtasks, setSubtasks] = useState<Subtask[]>(existing?.subtasks ?? []);
  const [newSubtask, setNewSubtask] = useState("");

  // Picker de Objetivo
  const [goalPickerOpen, setGoalPickerOpen] = useState(false);

  const headerTitle = isEdit ? "Editar tarea" : "Nueva tarea";

  // ---- Handlers ----
  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
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

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "El título es obligatorio");
      return;
    }

    const recurrence =
      recurrenceType === "custom" ?
        { type: "custom" as const, daysOfWeek: selectedDays }
      : recurrenceType === "weekdays" ? { type: "weekdays" as const }
      : recurrenceType === "daily" ? { type: "daily" as const }
      : { type: "once" as const };

    if (isEdit && existing) {
      const updated: Task = {
        ...existing,
        title: title.trim(),
        description: description.trim(),
        goalId: selectedGoalId, // puede quedar undefined (tarea suelta)
        recurrence,
        subtasks,
        updatedAt: new Date().toISOString(),
      };
      await updateTask(updated);
    } else {
      const newTask: Task = {
        id: uuid.v4().toString(),
        title: title.trim(),
        description: description.trim(),
        goalId: selectedGoalId,
        recurrence,
        subtasks,
        completed: false,
        completedDates: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addTask(newTask);
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    if (!isEdit || !editingId) return;
    Alert.alert("Eliminar tarea", "¿Querés eliminar esta tarea?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteTask(editingId);
          navigation.goBack();
        },
      },
    ]);
  };

  // ---- UI ----
  const SelectedGoalBadge = () => {
    const name =
      selectedGoalId ?
        (goals.find(g => g.id === selectedGoalId)?.title ?? "Objetivo")
      : "Tarea suelta";
    return (
      <TouchableOpacity
        style={styles.goalBadge}
        onPress={() => setGoalPickerOpen(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="flag-outline" size={16} color="#4e88ff" />
        <Text style={styles.goalBadgeText} numberOfLines={1}>
          {name}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#4e88ff" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitle}
        </Text>
        <TouchableOpacity
          style={{ padding: 8, opacity: title.trim() ? 1 : 0.5 }}
          disabled={!title.trim()}
          onPress={handleSave}
        >
          <Text style={styles.save}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Objetivo (opcional) */}
        <View style={styles.section}>
          <Text style={styles.label}>Objetivo</Text>
          <SelectedGoalBadge />
        </View>

        {/* Título */}
        <View style={styles.section}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Rutina de lunes"
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

        {/* Recurrencia */}
        <View style={styles.section}>
          <Text style={styles.label}>Recurrencia</Text>

          <View style={styles.rowWrap}>
            {(["once", "daily", "weekdays", "custom"] as const).map(rt => (
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
                  : rt === "weekdays" ?
                    "Lun‑Vie"
                  : "Personalizada"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {recurrenceType === "custom" && (
            <View style={[styles.rowWrap, { marginTop: 8 }]}>
              {DAYS.map((d, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => toggleDay(i)}
                  style={[
                    styles.dayBtn,
                    selectedDays.includes(i) && styles.daySelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selectedDays.includes(i) && styles.daySelectedText,
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Subtareas */}
        <View style={styles.section}>
          <Text style={styles.label}>Subtareas</Text>
          <View style={styles.subtaskRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Ej: Press plano"
              value={newSubtask}
              onChangeText={setNewSubtask}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addSubtaskLocal}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {subtasks.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {subtasks.map(s => (
                <View key={s.id} style={styles.subtaskItem}>
                  <Text style={styles.subtaskText}>• {s.title}</Text>
                  <TouchableOpacity onPress={() => removeSubtask(s.id)}>
                    <Ionicons name="close-circle" size={18} color="#999" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Eliminar (solo edición) */}
        {isEdit && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash" size={18} color="#fff" />
            <Text style={styles.deleteText}>Eliminar tarea</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal: seleccionar objetivo */}
      <Modal
        transparent
        visible={goalPickerOpen}
        animationType="fade"
        onRequestClose={() => setGoalPickerOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={() => setGoalPickerOpen(false)}
        >
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Asignar a objetivo</Text>

            <TouchableOpacity
              style={[
                styles.pickerItem,
                !selectedGoalId && styles.pickerItemActive,
              ]}
              onPress={() => setSelectedGoalId(undefined)}
            >
              <Text style={styles.pickerText}>Tarea suelta (sin objetivo)</Text>
            </TouchableOpacity>

            {goals.map(g => (
              <TouchableOpacity
                key={g.id}
                style={[
                  styles.pickerItem,
                  selectedGoalId === g.id && styles.pickerItemActive,
                ]}
                onPress={() => setSelectedGoalId(g.id)}
              >
                <Text style={styles.pickerText}>{g.title}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.pickerFooter}>
              <TouchableOpacity
                style={styles.cancel}
                onPress={() => setGoalPickerOpen(false)}
              >
                <Text style={styles.cancelText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ----- Estilos -----
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

  goalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#eaf2ff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#cfe1ff",
  },
  goalBadgeText: { color: "#4e88ff", fontWeight: "700", maxWidth: 220 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#fff",
  },

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

  dayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  daySelected: { backgroundColor: "#4e88ff", borderColor: "#4e88ff" },
  dayText: { color: "#333", fontWeight: "700" },
  daySelectedText: { color: "#fff" },

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

  deleteBtn: {
    marginTop: 20,
    backgroundColor: "#ff4d4f",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  deleteText: { color: "#fff", fontWeight: "700" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
  },
  pickerBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "70%",
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  pickerItemActive: { backgroundColor: "#eef4ff" },
  pickerText: { fontSize: 15, color: "#333" },
  pickerFooter: { marginTop: 8, alignItems: "flex-end" },
  cancel: {
    backgroundColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  cancelText: { color: "#333", fontWeight: "700" },
});
