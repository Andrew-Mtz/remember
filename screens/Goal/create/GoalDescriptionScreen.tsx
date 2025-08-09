// screens/GoalDescriptionScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

export const GoalDescriptionScreen = () => {
  const navigation = useNavigation();
  const { params }: any = useRoute();
  const [text, setText] = useState(params?.value ?? "");

  const handleSave = () => {
    if (params?.onSave) {
      params.onSave(text);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Describí tu objetivo</Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        multiline
        placeholder="Ej: Quiero mejorar mi salud y energía"
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  label: { fontSize: 18, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#4e88ff",
    marginTop: 24,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
