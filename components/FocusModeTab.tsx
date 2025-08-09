import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const FocusModeTab = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🎯 Modo Enfoque</Text>
      <Text style={styles.description}>
        Cuando actives este modo, podés usar herramientas para evitar
        distracciones y mantenerte concentrado en tu objetivo.
      </Text>

      <View style={styles.tools}>
        <ToolCard icon="timer" title="Pomodoro" />
        <ToolCard icon="alarm" title="Temporizador" />
        <ToolCard icon="airplane" title="Modo avión" />
        <ToolCard icon="close-circle" title="Bloqueador de apps" />
      </View>

      <TouchableOpacity style={styles.startBtn}>
        <Ionicons name="play" size={20} color="#fff" />
        <Text style={styles.startText}>Empezar sesión de enfoque</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const ToolCard = ({
  icon,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}) => (
  <View style={styles.toolCard}>
    <Ionicons name={icon} size={28} color="#4e88ff" />
    <Text style={styles.toolTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 24,
  },
  tools: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "space-around",
  },
  toolCard: {
    width: "47%",
    backgroundColor: "#f0f6ff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  toolTitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
  },
  startBtn: {
    marginTop: "auto",
    backgroundColor: "#4e88ff",
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  startText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
