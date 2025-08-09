// screens/EditGoalScreen.tsx
import React, { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GoalsContext } from "../../context/GoalsContext";
import { Goal } from "../../models/Goal";

type Params = { goalId: string };

export const EditGoalScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
  const { goalId } = route.params;

  const { goals, updateGoal } = useContext(GoalsContext);
  const original = useMemo(
    () => goals.find(g => g.id === goalId),
    [goals, goalId]
  );

  const [emoji, setEmoji] = useState(original?.emoji ?? ("🎯" as any));
  const [title, setTitle] = useState(original?.title ?? "");
  const [description, setDescription] = useState(original?.description ?? "");
  const [category, setCategory] = useState(original?.category ?? "");
  const [progressType, setProgressType] = useState<"tasks" | "days">(
    original?.progressType ?? "tasks"
  );
  const [weeklyTarget, setWeeklyTarget] = useState(
    String(original?.weeklyTarget ?? 3)
  );
  const [remindersEnabled, setRemindersEnabled] = useState(
    Boolean(original?.remindersEnabled)
  );
  const [reminderTime, setReminderTime] = useState(
    (original as any)?.reminderTime ?? "08:00"
  );
  const [fromPast, setFromPast] = useState(
    original?.messages.fromPast.content ?? ""
  );
  const [fromFuture, setFromFuture] = useState(
    original?.messages.fromFuture.content ?? ""
  );

  if (!original) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Objetivo no encontrado</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "El título es obligatorio");
      return;
    }

    const updated: Goal = {
      ...original,
      emoji: emoji as any,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      progressType,
      weeklyTarget: Number(weeklyTarget),
      messages: {
        fromPast: { type: "text", content: fromPast },
        fromFuture: { type: "text", content: fromFuture },
      },
      remindersEnabled,
      updatedAt: new Date().toISOString(),
      // si guardás reminderTime en Goal podés agregarlo al modelo:
      // reminderTime,
    };

    await updateGoal(updated);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header propio */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 8 }}
        >
          <Ionicons name="close" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Editar objetivo
        </Text>
        <TouchableOpacity onPress={handleSave} style={{ padding: 8 }}>
          <Text style={styles.save}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Emoji + Título (igual que en Create but inline) */}
        <View style={styles.emojiRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate({
                name: "EmojiPicker",
                params: {
                  onSelect: (e: string) => setEmoji(e),
                },
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

        {/* Descripción */}
        <TouchableOpacity
          style={styles.rowButton}
          onPress={() => {
            navigation.navigate({
              name: "GoalDescription",
              params: {
                value: description,
                onSave: (val: string) => setDescription(val),
              },
            } as never);
          }}
        >
          <View>
            <Text style={styles.label}>📝 Descripción</Text>
            {description ?
              <Text style={styles.previewText}>
                {description.slice(0, 40)}
                {description.length > 40 ? "..." : ""}
              </Text>
            : <Text style={styles.placeholderText}>Sin descripción</Text>}
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

        {/* Medición */}
        <TouchableOpacity
          style={styles.rowButton}
          onPress={() =>
            navigation.navigate({
              name: "GoalMeasure",
              params: {
                progressType,
                weeklyTarget,
                onSave: ({ progressType: pt, weeklyTarget: wt }: any) => {
                  setProgressType(pt);
                  setWeeklyTarget(String(wt));
                },
              },
            } as never)
          }
        >
          <View>
            <Text style={styles.label}>📏 Medición</Text>
            <Text style={styles.previewText}>
              {progressType === "tasks" ?
                `${weeklyTarget} tareas por semana`
              : `${weeklyTarget} días por semana`}
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
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  save: { color: "#4e88ff", fontSize: 16, fontWeight: "700" },
  content: { padding: 20, gap: 12 },

  titleInput: {
    flex: 1,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 4,
  },
  emojiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  emoji: { fontSize: 36 },
  editLine: {
    flex: 1,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  editLabel: { fontSize: 12, color: "#777" },
  editValue: { fontSize: 16, color: "#333", fontWeight: "600", marginTop: 2 },

  rowButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  label: { fontSize: 16 },
  previewText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  placeholderText: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 4,
  },
});
