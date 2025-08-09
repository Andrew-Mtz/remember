// screens/GoalReminderScreen.tsx
import React, { useState } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";

export const GoalReminderScreen = () => {
  const navigation = useNavigation();
  const { params }: any = useRoute();
  const initialEnabled = params?.enabled ?? false;
  const initialTime = params?.time ?? "08:00";

  const [enabled, setEnabled] = useState(initialEnabled);
  const [time, setTime] = useState(initialTime);
  const [showPicker, setShowPicker] = useState(false);

  const handleSave = () => {
    if (params?.onSave) {
      params.onSave({ enabled, time });
    }
    navigation.goBack();
  };

  const handleTimeChange = (_: any, selected?: Date) => {
    setShowPicker(false);
    if (selected) {
      const h = selected.getHours().toString().padStart(2, "0");
      const m = selected.getMinutes().toString().padStart(2, "0");
      setTime(`${h}:${m}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>¿Querés activar recordatorios?</Text>
      <View style={styles.row}>
        <Text style={{ fontSize: 16 }}>Recordatorios</Text>
        <Switch value={enabled} onValueChange={setEnabled} />
      </View>

      {enabled && (
        <>
          <Text style={styles.label}>¿A qué hora?</Text>
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Text style={styles.time}>{time}</Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              mode="time"
              value={new Date(`2000-01-01T${time}`)} // solo importa hora y minuto
              onChange={handleTimeChange}
              display="spinner"
              is24Hour
            />
          )}
        </>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 24 },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
    marginTop: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  time: {
    fontSize: 18,
    color: "#4e88ff",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#4e88ff",
    padding: 16,
    borderRadius: 8,
    marginTop: 48,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
