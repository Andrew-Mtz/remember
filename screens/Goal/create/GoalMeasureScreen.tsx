// screens/GoalMeasureScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

export const GoalMeasureScreen = () => {
  const navigation = useNavigation();
  const { params }: any = useRoute();
  const initialType = params?.progressType ?? "tasks";
  const initialTarget = params?.weeklyTarget?.toString() ?? "3";

  const [progressType, setProgressType] = useState<"tasks" | "days">(
    initialType
  );
  const [weeklyTarget, setWeeklyTarget] = useState(initialTarget);

  const handleSave = () => {
    if (params?.onSave) {
      params.onSave({
        progressType,
        weeklyTarget: Number(weeklyTarget),
      });
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>¿Cómo querés medir tu progreso?</Text>

      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            progressType === "tasks" && styles.selected,
          ]}
          onPress={() => setProgressType("tasks")}
        >
          <Text
            style={[
              styles.typeText,
              progressType === "tasks" && styles.selectedText,
            ]}
          >
            Por tareas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            progressType === "days" && styles.selected,
          ]}
          onPress={() => setProgressType("days")}
        >
          <Text
            style={[
              styles.typeText,
              progressType === "days" && styles.selectedText,
            ]}
          >
            Por días
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { marginTop: 24 }]}>
        ¿Cuántas {progressType === "tasks" ? "tareas" : "días"} por semana?
      </Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={weeklyTarget}
        onChangeText={setWeeklyTarget}
      />

      <TouchableOpacity
        style={[styles.saveButton, { opacity: weeklyTarget.trim() ? 1 : 0.5 }]}
        onPress={handleSave}
        disabled={!weeklyTarget.trim()}
      >
        <Text style={styles.saveButtonText}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  selected: {
    backgroundColor: "#4e88ff",
    borderColor: "#4e88ff",
  },
  typeText: {
    color: "#333",
    fontWeight: "500",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: "#4e88ff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 40,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
