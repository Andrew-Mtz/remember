// components/GoalPicker.tsx
import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Goal } from "../models/Goal";

type Props = {
    goals: Goal[];
    selectedGoalId?: string;
    onChange: (id: string | undefined) => void; // undefined = “Sin objetivo”
    disabled?: boolean;
    onCreateNewGoal?: () => void;
};

export const GoalPicker = ({
    goals,
    selectedGoalId,
    onChange,
    disabled,
    onCreateNewGoal,
}: Props) => {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");

    const selectedGoal = useMemo(
        () => goals.find(g => g.id === selectedGoalId),
        [goals, selectedGoalId]
    );

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        const arr = term
            ? goals.filter(g =>
                `${g.emoji ?? ""} ${g.title}`.toLowerCase().includes(term)
            )
            : goals;
        // separo por tipo (hábitos / proyectos)
        const habits = arr.filter(g => g.type === "habit");
        const projects = arr.filter(g => g.type === "project");
        // “Sin objetivo” como opción fija arriba
        return [
            { kind: "header", id: "none-h", title: "General" } as const,
            { kind: "none", id: "none" } as const,
            ...(habits.length
                ? [{ kind: "header", id: "habit-h", title: "Hábitos" } as const, ...habits.map(g => ({ kind: "goal" as const, g }))] : []),
            ...(projects.length
                ? [{ kind: "header", id: "proj-h", title: "Proyectos" } as const, ...projects.map(g => ({ kind: "goal" as const, g }))] : []),
            { kind: "create", id: "create" } as const,
        ];
    }, [goals, q]);

    const label =
        selectedGoal ? `${selectedGoal.emoji ?? "🎯"} ${selectedGoal.title}` : "Sin objetivo";

    const renderItem = ({ item }: { item: any }) => {
        if (item.kind === "header") {
            return <Text style={styles.sectionHeader}>{item.title}</Text>;
        }
        if (item.kind === "none") {
            const active = !selectedGoal;
            return (
                <TouchableOpacity
                    style={[styles.row, active && styles.rowActive]}
                    onPress={() => {
                        onChange(undefined);
                        setOpen(false);
                    }}
                >
                    <Text style={styles.rowTitle}>Sin objetivo</Text>
                    {active && <Ionicons name="checkmark" size={18} color="#4e88ff" />}
                </TouchableOpacity>
            );
        }
        if (item.kind === "goal") {
            const g: Goal = item.g;
            const active = selectedGoalId === g.id;
            return (
                <TouchableOpacity
                    style={[styles.row, active && styles.rowActive]}
                    onPress={() => {
                        onChange(g.id);
                        setOpen(false);
                    }}
                >
                    <Text style={styles.rowTitle}>
                        {g.emoji ? `${g.emoji} ` : ""}{g.title}
                    </Text>
                    <Text style={styles.rowBadge}>
                        {g.type === "habit" ? "Hábito" : "Proyecto"}
                    </Text>
                    {active && <Ionicons name="checkmark" size={18} color="#4e88ff" />}
                </TouchableOpacity>
            );
        }
        // create
        return (
            <TouchableOpacity
                style={[styles.row, styles.createRow]}
                onPress={() => {
                    setOpen(false);
                    onCreateNewGoal && onCreateNewGoal();
                }}
            >
                <Ionicons name="add-circle" size={18} color="#4e88ff" />
                <Text style={[styles.rowTitle, { marginLeft: 8 }]}>
                    Crear nuevo objetivo…
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <>
            <Text style={styles.label}>Asignar a objetivo</Text>
            <TouchableOpacity
                disabled={disabled}
                style={[styles.inputLike, disabled && { opacity: 0.6 }]}
                onPress={() => setOpen(true)}
            >
                <Text style={[styles.inputText, !selectedGoal && { color: "#666" }]}>
                    {label}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>

            <Modal
                visible={open}
                transparent
                animationType="slide"
                onRequestClose={() => setOpen(false)}
            >
                <View style={styles.sheetBackdrop}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setOpen(false)} />
                    <View style={styles.sheet}>
                        <View style={styles.sheetGrab} />
                        <View style={styles.searchBox}>
                            <Ionicons name="search" size={16} color="#666" />
                            <TextInput
                                placeholder="Buscar objetivo…"
                                style={styles.searchInput}
                                value={q}
                                onChangeText={setQ}
                            />
                            {q ? (
                                <TouchableOpacity onPress={() => setQ("")}>
                                    <Ionicons name="close-circle" size={16} color="#999" />
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        <FlatList
                            data={filtered}
                            keyExtractor={(it: any, i) =>
                                it.kind === "goal" ? it.g.id : `${it.kind}-${i}`
                            }
                            renderItem={renderItem}
                            ItemSeparatorComponent={() => <View style={styles.sep} />}
                            contentContainerStyle={{ paddingBottom: 16 }}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    label: { fontSize: 14, fontWeight: "700", color: "#333", marginBottom: 8 },
    inputLike: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
    },
    inputText: { fontSize: 15, color: "#333" },

    sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)" },
    sheet: {
        backgroundColor: "#fff",
        paddingTop: 8,
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    sheetGrab: {
        alignSelf: "center",
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#ddd",
        marginBottom: 10,
    },
    searchBox: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
    },
    searchInput: { flex: 1, fontSize: 14, color: "#333" },
    sep: { height: 8 },

    sectionHeader: {
        fontSize: 12,
        color: "#666",
        marginTop: 10,
        marginBottom: 4,
        fontWeight: "700",
    },
    row: {
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: "#f9fafb",
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    rowActive: {
        borderWidth: 1,
        borderColor: "#4e88ff",
        backgroundColor: "#f0f6ff",
    },
    rowTitle: { flex: 1, fontSize: 15, color: "#222" },
    rowBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: "#eef2ff",
        color: "#4e5bff",
        fontSize: 12,
        fontWeight: "700",
    },
    createRow: {
        backgroundColor: "#eef6ff",
    },
});
