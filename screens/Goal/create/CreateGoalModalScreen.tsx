// screens/goals/CreateGoalModalScreen.tsx
import React, { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import uuid from "react-native-uuid";
import { SafeScreen } from "../../../layout/SafeScreen";

import { GoalsContext } from "../../../context/GoalsContext";
import { Goal, HabitGoal, ProjectGoal } from "../../../models/Goal";

const DAYS = ["L", "M", "X", "J", "V", "S", "D"]; // 0..6 (arrancamos L=0 para UX, luego mapeamos)

export const CreateGoalModalScreen = () => {
  const navigation = useNavigation();
  const { addGoal } = useContext(GoalsContext);

  // Base
  const [emoji, setEmoji] = useState("💪🏻");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  // Tipo de objetivo
  const [goalType, setGoalType] = useState<"habit" | "project">("habit");

  // Para UX mostramos L..D empezando en lunes index 0, pero en modelo necesitamos 0..6 con Domingo=0
  // Mapeo: UX L..D => modelo [1,2,3,4,5,6,0]
  const uxToModelIndex = (uxIndex: number) => {
    // uxIndex: 0..6 => L=0 -> 1, ..., S=5 -> 6, D=6 -> 0
    return uxIndex === 6 ? 0 : uxIndex + 1;
  };
  const [selectedUxDays, setSelectedUxDays] = useState<number[]>([]);

  // Recordatorios + motivación
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [fromPast, setFromPast] = useState("");
  const [fromFuture, setFromFuture] = useState("");

  const selectedDaysPreview = useMemo(() => {
    if (selectedUxDays.length === 0) return "Sin días seleccionados";
    return selectedUxDays
      .slice()
      .sort((a, b) => a - b)
      .map(i => DAYS[i])
      .join(", ");
  }, [selectedUxDays]);

  const canSave =
    title.trim().length > 0 &&
    (goalType === "project" ||
      (goalType === "habit" && selectedUxDays.length > 0));

  const toggleUxDay = (i: number) => {
    setSelectedUxDays(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const handleSave = () => {
    if (!canSave) {
      if (!title.trim()) {
        Alert.alert("Error", "El título es obligatorio");
        return;
      }
      if (goalType === "habit") {
        if (selectedUxDays.length === 0) {
          Alert.alert("Error", "Seleccioná al menos un día");
          return;
        }
      }
      return;
    }

    const now = new Date().toISOString();

    let newGoal: Goal;

    const modelDays = selectedUxDays.map(uxToModelIndex);

    if (goalType === "habit") {
      const modelDays = selectedUxDays.map(uxToModelIndex); // a 0..6 con D=0
      const g: HabitGoal = {
        id: uuid.v4().toString(),
        emoji,
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        type: "habit",
        progressType: "days",
        daysOfWeek: modelDays,
        weeklyTarget: modelDays.length, // 👈 derivado de los días elegidos
        streak: { current: 0, highest: 0, active: false, lastCheck: "" },
        weeklyProgress: { count: 0, updatedAt: now },
        tasks: [],
        startDate: now,
        messages: {
          fromPast: { type: "text", content: fromPast },
          fromFuture: { type: "text", content: fromFuture },
        },
        remindersEnabled,
        createdAt: now,
        updatedAt: now,
      };
      newGoal = g;
    } else {
      const g: ProjectGoal = {
        id: uuid.v4().toString(),
        emoji,
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        type: "project",
        progressType: "tasks",
        tasks: [], // pasos únicos
        startDate: now,
        messages: {
          fromPast: { type: "text", content: fromPast },
          fromFuture: { type: "text", content: fromFuture },
        },
        remindersEnabled,
        createdAt: now,
        updatedAt: now,
      };
      newGoal = g;
    }

    addGoal(newGoal);
    navigation.goBack();
  };

  return (
    <SafeScreen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          style={{ opacity: canSave ? 1 : 0.4 }}
        >
          <Text style={styles.save}>Crear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Emoji + Título */}
        <View style={styles.emojiTitleRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate({
                name: "EmojiPicker",
                params: { onSelect: (e: string) => setEmoji(e) },
              } as never)
            }
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.titleInput}
            placeholder="Nombre del objetivo"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Tipo de objetivo */}
        <View style={styles.rowBlock}>
          <Text style={styles.label}>Tipo de objetivo</Text>
          <View style={styles.rowWrap}>
            {(["habit", "project"] as const).map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, goalType === t && styles.chipActive]}
                onPress={() => setGoalType(t)}
              >
                <Text
                  style={[
                    styles.chipText,
                    goalType === t && styles.chipTextActive,
                  ]}
                >
                  {t === "habit" ? "Hábito" : "Proyecto"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helper}>
            {goalType === "habit" ?
              "Los hábitos se miden por días/semana y tienen racha."
            : "Los proyectos son una lista de pasos; cuando completás todos, se termina."
            }
          </Text>
        </View>

        {/* Si es HÁBITO: cantidad de días + qué días */}
        {goalType === "habit" && (
          <View style={styles.rowBlock}>
            <Text style={styles.label}>Elegí los días</Text>
            <View style={[styles.rowWrap, { marginTop: 6 }]}>
              {DAYS.map((d, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.dayBtn,
                    selectedUxDays.includes(i) && styles.daySelected,
                  ]}
                  onPress={() =>
                    setSelectedUxDays(prev =>
                      prev.includes(i) ?
                        prev.filter(x => x !== i)
                      : [...prev, i]
                    )
                  }
                >
                  <Text
                    style={[
                      styles.dayText,
                      selectedUxDays.includes(i) && styles.daySelectedText,
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.helper, { marginTop: 8 }]}>
              {selectedUxDays.length === 0 ?
                "Seleccioná al menos un día."
              : `Elegiste ${selectedUxDays.length} día(s): ${selectedUxDays
                  .slice()
                  .sort((a, b) => a - b)
                  .map(i => DAYS[i])
                  .join(", ")}.`
              }
            </Text>
          </View>
        )}

        {/* Descripción */}
        <TouchableOpacity
          style={styles.rowButton}
          onPress={() =>
            navigation.navigate({
              name: "GoalDescription",
              params: {
                value: description,
                onSave: (val: string) => setDescription(val),
              },
            } as never)
          }
        >
          <View>
            <Text style={styles.label}>📝 Descripción</Text>
            <Text
              style={description ? styles.previewText : styles.placeholderText}
            >
              {description ?
                `${description.slice(0, 40)}${description.length > 40 ? "..." : ""}`
              : "Sin descripción"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        {/* Categoría */}
        <TouchableOpacity
          style={styles.rowButton}
          onPress={() =>
            navigation.navigate({
              name: "GoalCategory",
              params: {
                value: category,
                onSave: (val: string) => setCategory(val),
              },
            } as never)
          }
        >
          <View>
            <Text style={styles.label}>📂 Categoría</Text>
            <Text
              style={category ? styles.previewText : styles.placeholderText}
            >
              {category || "Sin categoría"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        {/* Recordatorios */}
        <TouchableOpacity
          style={styles.rowButton}
          onPress={() =>
            navigation.navigate({
              name: "GoalReminder",
              params: {
                enabled: remindersEnabled,
                time: reminderTime,
                onSave: ({ enabled, time }: any) => {
                  setRemindersEnabled(enabled);
                  setReminderTime(time);
                },
              },
            } as never)
          }
        >
          <View>
            <Text style={styles.label}>⏰ Recordatorio</Text>
            <Text style={styles.previewText}>
              {remindersEnabled ? `A las ${reminderTime}` : "Desactivado"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        {/* Motivación */}
        <TouchableOpacity
          style={styles.rowButton}
          onPress={() =>
            navigation.navigate({
              name: "GoalMotivation",
              params: {
                fromPast,
                fromFuture,
                onSave: ({ fromPast: p, fromFuture: f }: any) => {
                  setFromPast(p);
                  setFromFuture(f);
                },
              },
            } as never)
          }
        >
          <View>
            <Text style={styles.label}>💭 Motivación</Text>
            <Text
              style={
                fromPast || fromFuture ?
                  styles.previewText
                : styles.placeholderText
              }
            >
              {fromPast || fromFuture ? "Completado" : "Sin completar"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  save: { color: "#4e88ff", fontSize: 16, fontWeight: "600" },

  content: { padding: 20, gap: 16 },

  emojiTitleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  emoji: { fontSize: 32 },
  titleInput: {
    flex: 1,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 4,
  },

  rowBlock: { marginTop: 8 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },

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
    backgroundColor: "#fff",
  },

  dayBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  daySelected: { backgroundColor: "#4e88ff", borderColor: "#4e88ff" },
  dayText: { color: "#333", fontWeight: "700" },
  daySelectedText: { color: "#fff" },

  rowButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  label: { fontSize: 16, fontWeight: "600", color: "#333" },
  helper: { fontSize: 12, color: "#666", marginTop: 6 },

  previewText: { fontSize: 14, color: "#666", marginTop: 4 },
  placeholderText: { fontSize: 14, color: "#bbb", marginTop: 4 },
});
