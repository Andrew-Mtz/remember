import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Goal } from "../models/Goal";

type Props = {
  goal: Goal;
  onPress?: (event: GestureResponderEvent) => void;
  onAddTask?: () => void;
};

export const GoalTaskCard = ({ goal, onPress, onAddTask }: Props) => {
  const taskCount = goal.tasks?.length ?? 0;
  const hasRecurrence =
    goal.tasks?.some(
      t => t.recurrence?.type && t.recurrence?.type !== "once"
    ) ?? false;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.left}>
        <Text style={styles.title} numberOfLines={1}>
          {goal.title}
        </Text>
        <Text style={styles.info}>
          {taskCount > 0 ?
            `${taskCount} ${taskCount === 1 ? "tarea" : "tareas"}`
          : "Sin tareas"}
        </Text>
        {hasRecurrence && (
          <Text style={styles.recurrence}>📅 Tiene tareas recurrentes</Text>
        )}
      </View>

      <TouchableOpacity onPress={onAddTask} style={styles.addButton}>
        <Ionicons name="add" size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f6f8ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  info: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  recurrence: {
    fontSize: 12,
    color: "#4e88ff",
    marginTop: 4,
  },
  addButton: {
    backgroundColor: "#4e88ff",
    borderRadius: 24,
    padding: 8,
  },
});
