import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Goal } from "../models/Goal";

// Colores por categoría (puede extraerse en el futuro)
const categoryColors: Record<string, ViewStyle["backgroundColor"]> = {
  salud: "#B3E5FC",
  trabajo: "#C8E6C9",
  estudio: "#FFF9C4",
  personal: "#FFCCBC",
  otro: "#E0E0E0",
};

type Props = {
  goal: Goal;
  onPress?: () => void;
};

export const GoalCard = ({ goal, onPress }: Props) => {
  const {
    title,
    category,
    progressType,
    weeklyTarget,
    weeklyProgress,
    streak,
  } = goal;

  const categoryColor = categoryColors[category] || "#ddd";
  const progress = Math.min(weeklyProgress?.count / weeklyTarget, 1); // porcentaje 0–1

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: categoryColor }]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {streak?.active && <Ionicons name="flame" size={20} color="#ff5722" />}
      </View>

      <Text style={styles.subtitle}>
        {progressType === "days" ? "Días cumplidos" : "Tareas cumplidas"} esta
        semana: {weeklyProgress?.count}/{weeklyTarget}
      </Text>

      {/* Barra de progreso */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <Text style={styles.streakText}>
        Racha actual: {streak?.current}{" "}
        {streak?.current > 0 && streak?.active ? "🔥" : ""}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#ddd",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4e88ff",
  },
  streakText: {
    fontSize: 13,
    color: "#444",
    marginTop: 4,
  },
});
