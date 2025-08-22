// screens/GoalDetailScreen.tsx
import React, { useContext, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { GoalsContext } from "../../context/GoalsContext";
import { TasksContext } from "../../context/TasksContext";
import { SafeScreen } from "../../layout/SafeScreen";
import { GoalProgressHeader } from "../../components/GoalProgressHeader";
import { GoalSummaryTab } from "../../components/GoalSummaryTab";
import { GoalTasksTab } from "../../components/GoalTasksTab";
import { FocusModeTab } from "../../components/FocusModeTab";
import { ConfirmDialog } from "../../components/ConfirmDialog";

type Params = { goalId: string };
const TABS = ["resumen", "tareas", "enfoque"] as const;
type Tab = (typeof TABS)[number];

export const GoalDetailScreen = () => {
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
  const navigation = useNavigation();

  const { goalId } = route.params;
  const { goals, deleteGoal } = useContext(GoalsContext);
  const { getTasksByGoal } = useContext(TasksContext);

  const goal = goals.find(g => g.id === goalId);
  const tasks = getTasksByGoal(goalId);

  const [activeTab, setActiveTab] = useState<Tab>("resumen");
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!goal) {
    return (
      <SafeScreen scrollable>
        <View style={styles.center}>
          <Text style={styles.error}>Objetivo no encontrado</Text>
        </View>
      </SafeScreen>
    );
  }

  const handleDeletePress = () => {
    setMenuOpen(false);
    setConfirmOpen(true);
  };

  // confirmar:
  const confirmDelete = async () => {
    setConfirmOpen(false);
    await deleteGoal(goalId);
    navigation.goBack();
  };

  const handleEdit = () => {
    setMenuOpen(false);
    // Navegá a tu pantalla de edición
    navigation.navigate({ name: "EditGoal", params: { goalId } } as never);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    Alert.alert(
      "Eliminar objetivo",
      "Esta acción no se puede deshacer. ¿Querés eliminarlo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await deleteGoal(goalId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderTab = () => {
    switch (activeTab) {
      case "resumen":
        return <GoalSummaryTab goal={goal} />;
      case "tareas":
        return (
          <GoalTasksTab goalId={goalId} tasks={tasks} goalType={goal.type} />
        );
      case "enfoque":
        return <FocusModeTab />;
    }
  };

  return (
    <SafeScreen
      scrollable
      contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>

        <Text numberOfLines={1} style={styles.headerTitle}>
          {goal.title}
        </Text>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setMenuOpen(true)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <GoalProgressHeader goal={goal} />
      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab && styles.tabButtonTextActive,
              ]}
            >
              {tab === "resumen" ?
                "Resumen"
              : tab === "tareas" ?
                "Tareas"
              : "Enfoque"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flex: 1 }}>{renderTab()}</View>

      <Modal
        transparent
        visible={menuOpen}
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuOpen(false)}
        >
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <Text style={styles.menuText}>✏️ Editar objetivo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeletePress}
            >
              <Text style={[styles.menuText, { color: "red" }]}>
                🗑️ Eliminar objetivo
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <ConfirmDialog
        visible={confirmOpen}
        title="Eliminar objetivo"
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { fontSize: 16, color: "red" },

  header: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e9e9e9",
    backgroundColor: "#fff",
  },
  iconBtn: { padding: 8 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
    gap: 10,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  tabButtonActive: {
    backgroundColor: "#4e88ff",
  },
  tabButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  tabButtonTextActive: {
    color: "#fff",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menuBox: {
    marginTop: 60,
    marginRight: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 6,
    minWidth: 180,
    elevation: 5,
  },
  menuItem: { paddingVertical: 10, paddingHorizontal: 14 },
  menuText: { fontSize: 14, fontWeight: "500", color: "#333" },
});
