import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { GoalsContext } from "../../../context/GoalsContext";
import { Goal } from "../../../models/Goal";
import uuid from "react-native-uuid";
import { Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeScreen } from "../../../layout/SafeScreen";

export const CreateGoalModalScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { addGoal } = useContext(GoalsContext);

  const [emoji, setEmoji] = useState("💪🏻");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [progressType, setProgressType] = useState<"tasks" | "days">("tasks");
  const [weeklyTarget, setWeeklyTarget] = useState("3");
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("08:00");

  const [fromPast, setFromPast] = useState("");
  const [fromFuture, setFromFuture] = useState("");

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "El título es obligatorio");
      return;
    }

    const now = new Date().toISOString();

    const newGoal: Goal = {
      id: uuid.v4().toString(),
      emoji,
      title,
      category,
      description,
      progressType,
      weeklyTarget: Number(weeklyTarget),
      streak: {
        current: 0,
        highest: 0,
        active: false,
        lastCheck: "",
      },
      weeklyProgress: {
        count: 0,
        updatedAt: now,
      },
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
        <TouchableOpacity onPress={handleSave}>
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
  save: {
    color: "#4e88ff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  emojiTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 4,
  },
  rowButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
  },
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
