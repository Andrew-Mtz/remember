import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Goal } from "../models/Goal";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  goal: Goal;
};

export const GoalHeader = ({ goal }: Props) => {
  const {
    title,
    category,
    description,
    progressType,
    weeklyTarget,
    weeklyProgress,
    streak,
    startDate,
    updatedAt,
  } = goal;

  const progress = Math.min(weeklyProgress.count / weeklyTarget, 1);
  const progressPercent = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.row}>
        <Text style={styles.chip}>{category}</Text>
        <Text style={styles.type}>
          {progressType === "days" ? "Seguimiento diario" : "Por tareas"}
        </Text>
      </View>

      {description && <Text style={styles.description}>{description}</Text>}

      <View style={styles.row}>
        <Text style={styles.label}>Meta semanal:</Text>
        <Text style={styles.value}>
          {weeklyTarget} {progressType === "days" ? "días" : "tareas"}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Racha actual:</Text>
        <Text style={styles.value}>
          {streak.current} {streak.active && "🔥"}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Progreso semanal:</Text>
        <Text style={styles.value}>
          {weeklyProgress.count}/{weeklyTarget} ({progressPercent}%)
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>

      <Text style={styles.dates}>
        Inicio: {startDate} • Última act.: {updatedAt}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f0f4ff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  chip: {
    backgroundColor: "#d0e6ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
    marginRight: 8,
  },
  type: {
    fontSize: 12,
    color: "#555",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: "#444",
  },
  row: {
    flexDirection: "row",
    marginTop: 6,
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    color: "#666",
    marginRight: 4,
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#ccc",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 4,
  },
  fill: {
    height: "100%",
    backgroundColor: "#4e88ff",
  },
  dates: {
    marginTop: 8,
    fontSize: 12,
    color: "#777",
  },
});
