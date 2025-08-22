import React, { useContext, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HabitGoal } from "../../models/Goal";
import { TasksContext } from "../../context/TasksContext";
import { formatCustomDays } from "../../utils/dates";

export const HabitGoalCard = ({
  goal,
  onPress,
}: {
  goal: HabitGoal;
  onPress?: () => void;
}) => {
  const { getTasksByGoal } = useContext(TasksContext);
  const tasks = getTasksByGoal(goal.id).filter(t => t.type === "habit");

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayIdx = useMemo(() => new Date(todayISO).getDay(), [todayISO]);

  const tasksToday = tasks.filter(t => t.dayOfWeek == todayIdx);
  const done = goal.weeklyProgress.count;
  const total = goal.weeklyTarget;
  const pct = total ? Math.min(done / total, 1) : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Top row */}
      <View style={styles.row}>
        <Text style={styles.title}>{goal.title}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={styles.smallBold}>
            {done}/{total}
          </Text>
          <View style={styles.streakPill}>
            <Ionicons name="flame" size={14} color="#ff5722" />
            <Text style={styles.streakText}>{goal.streak.current}</Text>
          </View>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
      </View>

      {/* Hoy */}
      <Text style={styles.sectionLabel}>Hoy</Text>
      {tasksToday.length ?
        tasksToday.slice(0, 3).map(t => (
          <Text key={t.id} style={styles.taskLine}>
            • {t.title}
          </Text>
        ))
      : <Text style={styles.emptyLine}>No hay tareas para hoy.</Text>}

      {/* Info días del hábito */}
      <Text style={styles.daysInfo}>
        Días del hábito: {formatCustomDays(goal.daysOfWeek)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#f0f6ff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#233" },
  smallBold: { fontWeight: "700", color: "#233" },
  streakPill: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    backgroundColor: "#ffe7e0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  streakText: { fontWeight: "700", color: "#b23c17" },
  progressBar: {
    height: 8,
    backgroundColor: "#e3ecff",
    borderRadius: 6,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#4e88ff" },
  sectionLabel: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700",
    color: "#456",
  },
  taskLine: { marginTop: 4, color: "#345" },
  emptyLine: { marginTop: 4, color: "#789" },
  daysInfo: { marginTop: 8, fontSize: 12, color: "#678" },
});
