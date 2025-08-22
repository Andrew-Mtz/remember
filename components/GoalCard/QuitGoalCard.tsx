import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Goal } from "../../models/Goal";

type QuitGoal = Extract<Goal, { type: "quit" }>;

export const QuitGoalCard = ({
  goal,
  onPress,
}: {
  goal: QuitGoal;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.title}>{goal.title}</Text>
        <View style={styles.streakPill}>
          <Ionicons name="flame" size={14} color="#ff5722" />
          <Text style={styles.streakText}>{goal.streak.current}</Text>
        </View>
      </View>

      <Text style={styles.message}>
        ¡Seguís firme! Si aparece un disparador, respirá hondo y pedí ayuda 💪
      </Text>

      <View style={{ alignItems: "flex-end" }}>
        <TouchableOpacity
          style={styles.helpBtn}
          onPress={() => {
            /* later: abrir acciones */
          }}
        >
          <Ionicons name="heart" size={16} color="#fff" />
          <Text style={styles.helpText}>Pedir ayuda</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#fff6f0",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#333" },
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
  message: { marginTop: 10, color: "#444" },
  helpBtn: {
    marginTop: 10,
    backgroundColor: "#ff6b6b",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  helpText: { color: "#fff", fontWeight: "700" },
});
