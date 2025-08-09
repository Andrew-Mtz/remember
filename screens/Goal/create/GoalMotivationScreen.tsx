// screens/GoalMotivationScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

export const GoalMotivationScreen = () => {
  const navigation = useNavigation();
  const { params }: any = useRoute();

  const [fromPast, setFromPast] = useState(params?.fromPast ?? "");
  const [fromFuture, setFromFuture] = useState(params?.fromFuture ?? "");

  const handleSave = () => {
    if (params?.onSave) {
      params.onSave({ fromPast, fromFuture });
    }
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>¿Por qué empezás este objetivo?</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Ej: Quiero estudiar porque me prometí dejar de postergarlo..."
        value={fromPast}
        onChangeText={setFromPast}
      />

      <Text style={styles.label}>¿Cómo te vas a sentir cuando lo logres?</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Ej: Me voy a sentir orgulloso, libre, motivado..."
        value={fromFuture}
        onChangeText={setFromFuture}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Guardar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 24,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    minHeight: 100,
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
