// screens/HomeScreen.tsx
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GoalsContext } from "../context/GoalsContext";
import { GoalCard } from "../components/GoalCard";
import { TasksDashboardHome } from "../components/TasksDashboardHome";

export const HomeScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { goals } = useContext(GoalsContext);

  const [tab, setTab] = useState<"goals" | "tasks">("goals");
  const [fabOpen, setFabOpen] = useState(false);

  const goCreateGoal = () => {
    setFabOpen(false);
    navigation.navigate("CreateGoalModal" as never);
  };
  const goCreateTask = () => {
    setFabOpen(false);
    // tarea puntual por defecto (sin goal)
    navigation.navigate({ name: "CreateTask", params: {} } as never);
  };

  return (
    <>
      <View style={{ height: insets.top, backgroundColor: "#b8c7e4ff" }} />
      <View style={styles.container}>
        {/* Switch arriba */}
        <View style={styles.switchRow}>
          <TouchableOpacity
            style={[styles.switchBtn, tab === "goals" && styles.switchBtnActive]}
            onPress={() => setTab("goals")}
          >
            <Text
              style={[
                styles.switchText,
                tab === "goals" && styles.switchTextActive,
              ]}
            >
              Objetivos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchBtn, tab === "tasks" && styles.switchBtnActive]}
            onPress={() => setTab("tasks")}
          >
            <Text
              style={[
                styles.switchText,
                tab === "tasks" && styles.switchTextActive,
              ]}
            >
              Tareas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido */}
        {tab === "goals" ? (
          <FlatList
            data={goals}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <GoalCard
                goal={item}
                onPress={() =>
                  navigation.navigate({
                    name: "GoalDetail",
                    params: { goalId: item.id },
                  } as never)
                }
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 4 }}
            ListEmptyComponent={
              <Text style={styles.empty}>Aún no tenés objetivos creados.</Text>
            }
          />
        ) : (
          <TasksDashboardHome />
        )}

        {/* FAB principal */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setFabOpen(prev => !prev)}
          activeOpacity={0.8}
        >
          <Ionicons name={fabOpen ? "close" : "add"} size={28} color="#fff" />
        </TouchableOpacity>

        {/* Menú del FAB */}
        {fabOpen && (
          <View style={styles.fabMenu}>
            <TouchableOpacity style={styles.fabItem} onPress={goCreateGoal}>
              <Ionicons name="flag" size={18} color="#fff" />
              <Text style={styles.fabItemText}>Nuevo objetivo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabItem} onPress={goCreateTask}>
              <Ionicons name="checkbox-outline" size={18} color="#fff" />
              <Text style={styles.fabItemText}>Nueva tarea</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },

  switchRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  switchBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#eef2ff",
  },
  switchBtnActive: { backgroundColor: "#4e88ff" },
  switchText: { fontSize: 14, fontWeight: "700", color: "#4e5" as any },
  switchTextActive: { color: "#fff" },

  empty: {
    marginTop: 48,
    textAlign: "center",
    fontSize: 16,
    color: "#999",
  },

  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    backgroundColor: "#4e88ff",
    borderRadius: 32,
    padding: 16,
    elevation: 4,
  },
  fabMenu: {
    position: "absolute",
    right: 24,
    bottom: 90,
    gap: 10,
  },
  fabItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4e88ff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 3,
  },
  fabItemText: { color: "#fff", fontWeight: "700" },
});
