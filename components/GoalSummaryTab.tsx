import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Goal } from "../models/Goal";

type Props = {
  goal: Goal;
};

export const GoalSummaryTab = ({ goal }: Props) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Mensaje del pasado */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>💬 Tu yo del pasado te dice:</Text>
        <Text style={styles.message}>{goal.messages.fromPast.content}</Text>
      </View>

      {/* Mensaje del futuro */}
      <View style={[styles.card, { backgroundColor: "#f3ffe6" }]}>
        <Text style={styles.subtitle}>🌟 Tu yo del futuro te recuerda:</Text>
        <Text style={styles.message}>{goal.messages.fromFuture.content}</Text>
      </View>

      <View style={styles.footerNote}>
        <Text style={styles.noteText}>
          Volvé acá cada vez que lo necesites 💛
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#eaf0ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    color: "#444",
  },
  footerNote: {
    marginTop: 20,
    alignItems: "center",
  },
  noteText: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
  },
});
