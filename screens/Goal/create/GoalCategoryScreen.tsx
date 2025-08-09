import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeScreen } from "../../../layout/SafeScreen";

const SUGGESTED_CATEGORIES = [
  "Salud",
  "Ejercicio",
  "Estudio",
  "Productividad",
  "Dinero",
  "Relaciones",
  "Creatividad",
  "Mentalidad",
];

export const GoalCategoryScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { params }: any = useRoute();
  const initialValue = params?.value ?? "";

  const [selected, setSelected] = useState(
    SUGGESTED_CATEGORIES.includes(initialValue) ? initialValue : ""
  );
  const [custom, setCustom] = useState(
    !SUGGESTED_CATEGORIES.includes(initialValue) ? initialValue : ""
  );

  useEffect(() => {
    if (custom.trim()) {
      setSelected(""); // si escribe custom, des-selecciona las sugeridas
    }
  }, [custom]);

  const handleSave = () => {
    const value = custom.trim() ? custom.trim() : selected;
    if (!value) return;

    if (params?.onSave) {
      params.onSave(value);
    }
    navigation.goBack();
  };

  return (
    <SafeScreen style={styles.container}>
      <Text style={styles.label}>Elegí una categoría</Text>

      <FlatList
        data={SUGGESTED_CATEGORIES}
        keyExtractor={item => item}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.option, selected === item && styles.optionSelected]}
            onPress={() => {
              setSelected(item);
              setCustom("");
            }}
          >
            <Text
              style={[
                styles.optionText,
                selected === item && styles.optionTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={[styles.label, { marginTop: 20 }]}>
        O escribí una personalizada
      </Text>
      <TextInput
        style={styles.input}
        value={custom}
        onChangeText={setCustom}
        placeholder="Ej: Proyecto personal"
      />

      <TouchableOpacity
        style={[
          styles.button,
          {
            opacity: custom.trim() || selected ? 1 : 0.5,
          },
        ]}
        onPress={handleSave}
        disabled={!custom.trim() && !selected}
      >
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  label: { fontSize: 16, fontWeight: "500", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  button: {
    backgroundColor: "#4e88ff",
    marginTop: 24,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  option: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  optionSelected: {
    backgroundColor: "#4e88ff",
  },
  optionText: {
    fontWeight: "500",
    color: "#333",
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
});
