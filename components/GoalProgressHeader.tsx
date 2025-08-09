import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Goal } from "../models/Goal";

type Props = {
  goal: Goal;
};

export const GoalProgressHeader = ({ goal }: Props) => {
  const { emoji, title, description, weeklyTarget, weeklyProgress, streak } =
    goal;

  const progress = Math.min(weeklyProgress.count / weeklyTarget, 1);
  const remaining = Math.max(weeklyTarget - weeklyProgress.count, 0);

  // Fechas de la semana actual
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + 1); // Lunes
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Domingo

  const formatDate = (d: Date) =>
    d.toLocaleDateString("es-UY", { day: "numeric", month: "short" });

  const weekRange = `${formatDate(start)} - ${formatDate(end)}`;
  const daysLeft = 6 - today.getDay(); // Ej: si es miércoles (3), quedan 3 días

  return (
    <View style={styles.container}>
      {/* Emoji y título */}
      <View style={styles.topRow}>
        <Text style={styles.emoji}>{emoji || "🎯"}</Text>
        <View>
          <Text style={styles.title}>{title}</Text>
          {description ?
            <Text style={styles.description}>{description}</Text>
          : null}
        </View>
      </View>

      {/* Progreso visual */}
      <View style={styles.progressBox}>
        <Text style={styles.progressText}>
          {weeklyProgress.count} de {weeklyTarget}
        </Text>

        <View style={styles.circlesRow}>
          {Array.from({ length: weeklyTarget }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.circle,
                i < weeklyProgress.count && styles.circleDone,
              ]}
            />
          ))}
        </View>

        <Text style={styles.goalNote}>
          {remaining === 0 ?
            "¡Objetivo logrado!"
          : `${remaining} más para lograrlo`}
        </Text>

        <View style={styles.weekInfo}>
          <Text style={styles.weekText}>{weekRange}</Text>
          <Text style={styles.weekText}>{daysLeft} días restantes</Text>
        </View>
      </View>

      {/* Racha actual */}
      <View style={styles.streakRow}>
        <View style={styles.streakBox}>
          <Text style={styles.streakLabel}>🔥 Racha actual</Text>
          <Text style={styles.streakValue}>{streak.current}</Text>
        </View>
        <View style={styles.streakBox}>
          <Text style={styles.streakLabel}>🏆 Racha más larga</Text>
          <Text style={styles.streakValue}>{streak.highest}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f4ff",
    padding: 20,
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  emoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  progressBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderColor: "#d0e6ff",
    borderWidth: 1,
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    color: "#444",
  },
  circlesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 8,
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  circleDone: {
    backgroundColor: "#4e88ff",
    borderColor: "#4e88ff",
  },
  goalNote: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  weekInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekText: {
    fontSize: 12,
    color: "#777",
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  streakBox: {
    flex: 1,
    backgroundColor: "#eaf0ff",
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: "center",
  },
  streakLabel: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
