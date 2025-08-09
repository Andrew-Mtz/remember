// components/ConfirmDialog.tsx
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  destructive = false,
  onConfirm,
  onCancel,
}: Props) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.btn, styles.cancel]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btn,
                destructive ? styles.destructive : styles.primary,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    padding: 24,
  },
  box: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  title: { fontSize: 16, fontWeight: "700", color: "#222" },
  message: { marginTop: 8, fontSize: 14, color: "#444" },
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  cancel: { backgroundColor: "#eee" },
  primary: { backgroundColor: "#4e88ff" },
  destructive: { backgroundColor: "#ff4d4f" },
  cancelText: { color: "#333", fontWeight: "600" },
  confirmText: { color: "#fff", fontWeight: "700" },
});
