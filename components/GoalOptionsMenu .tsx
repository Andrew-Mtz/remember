import React, { useState } from "react";
import { Modal, TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const GoalOptionsMenu = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      {/* Botón de 3 puntos */}
      <TouchableOpacity onPress={() => setVisible(true)} style={{ padding: 8 }}>
        <Ionicons name="ellipsis-vertical" size={22} color="#333" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={() => setVisible(false)}
        >
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setVisible(false);
                onEdit();
              }}
            >
              <Text style={styles.menuText}>✏️ Editar objetivo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setVisible(false);
                onDelete();
              }}
            >
              <Text style={[styles.menuText, { color: "red" }]}>
                🗑️ Eliminar objetivo
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menu: {
    marginTop: 50,
    marginRight: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 6,
    minWidth: 160,
    elevation: 4,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
});
