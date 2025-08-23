import { useContext, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StandaloneTask, Task } from "../models/Task";
import { TasksContext } from "../context/TasksContext";
import { ConfirmDialog } from "./ConfirmDialog";
import {
    dayIndexFromISO,
    startOfWeekISO,
    parseLocalISODate,
    todayISOLocal,
    DAY_LETTERS,
    formatCustomDays,
} from "../utils/dates";
import { isStandalone } from "../models/typeGuards";

export const StandaloneTasksHome = ({ tasks }: { tasks: Task[] }) => {
    const navigation = useNavigation();
    const { updateTask, deleteTask } = useContext(TasksContext);

    const standalone = useMemo(() => tasks.filter(isStandalone), [tasks]);

    const todayISO = useMemo(() => todayISOLocal(), []);
    const todayIdx = useMemo(() => dayIndexFromISO(todayISO), [todayISO]);

    // ---- Recurrencia: ¿aplica hoy? ----
    const weeksDiff = (aISO: string, bISO: string) => {
        const aMon = parseLocalISODate(startOfWeekISO(aISO));
        const bMon = parseLocalISODate(startOfWeekISO(bISO));
        const ms = bMon.getTime() - aMon.getTime();
        return Math.round(ms / (7 * 24 * 60 * 60 * 1000));
    };
    const monthsDiff = (aISO: string, bISO: string) => {
        const a = parseLocalISODate(aISO);
        const b = parseLocalISODate(bISO);
        return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
    };

    const appliesToday = (t: Task): boolean => {
        if (!isStandalone(t)) return false;
        const r = t.recurrence;
        if (!r || r.type === "once") return false; // las "once" van a 'Sin fecha'
        if (r.type === "daily") return true;
        if (r.type === "custom") return (r.daysOfWeek ?? []).includes(todayIdx);
        if (r.type === "weekly") {
            const k = r.interval ?? 1;
            const w = weeksDiff(t.createdAt?.slice(0, 10) ?? todayISO, todayISO);
            return w % k === 0;
        }
        if (r.type === "monthly") {
            const k = r.interval ?? 1;
            const m = monthsDiff(t.createdAt?.slice(0, 10) ?? todayISO, todayISO);
            return m % k === 0;
        }
        return false;
    };

    // ---- Secciones ----
    const tasksToday = standalone.filter(appliesToday);
    const tasksRecurringNotToday = standalone.filter(
        t => t.recurrence && t.recurrence.type !== "once" && !appliesToday(t)
    );
    const tasksNoDate = standalone.filter(t => !t.recurrence || t.recurrence.type === "once");

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDeleteId, setToDeleteId] = useState<string | null>(null);

    const isDoneToday = (t: Task) => t.completedDates?.includes(todayISO) ?? false;

    const toggleDoneToday = async (t: Task, disabled: boolean) => {
        if (disabled) return;
        const now = new Date().toISOString();
        const set = new Set(t.completedDates ?? []);
        set.has(todayISO) ? set.delete(todayISO) : set.add(todayISO);

        // Si hay subtareas y todas quedan completadas, marcar 'completed'
        const hasSubs = (t.subtasks ?? []).length > 0;
        const allSubsDone = hasSubs && (t.subtasks ?? []).every(s => s.completed);

        const updated: Task = {
            ...t,
            completedDates: Array.from(set),
            // Para standalone, 'completed' lo usamos como estado "global" auxiliar:
            completed: hasSubs ? allSubsDone : (t.completed ?? false),
            updatedAt: now,
        };
        await updateTask(updated);
    };

    const toggleSubtask = async (t: Task, subId: string) => {
        const now = new Date().toISOString();
        const nextSubtasks = (t.subtasks ?? []).map(s =>
            s.id === subId ? { ...s, completed: !s.completed } : s
        );
        const hasSubs = nextSubtasks.length > 0;
        const allChecked = hasSubs && nextSubtasks.every(s => s.completed);

        const updated: Task = {
            ...t,
            subtasks: nextSubtasks,
            // Si todas las subtareas quedaron marcadas, marcamos 'completed'
            completed: hasSubs ? allChecked : t.completed,
            updatedAt: now,
        };
        await updateTask(updated);
    };

    const handleCreate = () =>
        navigation.navigate({ name: "CreateTask", params: {} } as never);

    const handleEdit = (taskId: string) =>
        navigation.navigate({ name: "CreateTask", params: { taskId, mode: "edit" } } as never);

    const askDelete = (taskId: string) => {
        setToDeleteId(taskId);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (toDeleteId) await deleteTask(toDeleteId);
        setConfirmOpen(false);
        setToDeleteId(null);
    };

    const recurrenceLabel = (t: StandaloneTask) => {
        const r = t.recurrence?.type;
        if (!r || r === "once") return "Sin fecha";
        if (r === "daily") return "Diaria";
        if (r === "weekly") return `Cada ${t.recurrence?.interval ?? 1} semana(s)`;
        if (r === "monthly") return `Cada ${t.recurrence?.interval ?? 1} mes(es)`;
        if (r === "custom")
            return `Días: ${formatCustomDays(t.recurrence?.daysOfWeek ?? [])}`;
        return "—";
    };

    const Section = ({
        title,
        items,
        disabled,
        emptyText,
    }: {
        title: string;
        items: StandaloneTask[];
        disabled: boolean;
        emptyText: string;
    }) => (
        <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {items.length ? (
                items.map(task => {
                    const done = isDoneToday(task);
                    return (
                        <View
                            key={task.id}
                            style={[styles.card, disabled && styles.cardDisabled]}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.taskTitle}>📌 {task.title}</Text>
                                <View style={[styles.badge, disabled && styles.badgeMuted]}>
                                    <Text
                                        style={[styles.badgeText, disabled && styles.badgeTextMuted]}
                                    >
                                        {recurrenceLabel(task)}
                                    </Text>
                                </View>
                            </View>

                            {task.subtasks?.length ? (
                                <View style={{ marginTop: 6 }}>
                                    {task.subtasks.map(s => {
                                        const checked = !!s.completed;
                                        return (
                                            <TouchableOpacity
                                                key={s.id}
                                                style={styles.subtaskRow}
                                                disabled={disabled}
                                                onPress={() => toggleSubtask(task, s.id)}
                                            >
                                                <Ionicons
                                                    name={(checked ? "checkbox" : "square-outline") as any}
                                                    size={18}
                                                    color={disabled ? "#9db6ff" : "#4e88ff"}
                                                />
                                                <Text
                                                    style={[
                                                        styles.subtaskText,
                                                        disabled && { color: "#9db6ff" },
                                                        checked && { textDecorationLine: "line-through" },
                                                    ]}
                                                >
                                                    {s.title}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ) : (
                                <Text style={styles.noSubtasks}>Sin subtareas</Text>
                            )}

                            <View style={styles.actionsRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.doneBtn,
                                        done && styles.doneBtnActive,
                                        disabled && styles.doneBtnDisabled,
                                    ]}
                                    disabled={disabled}
                                    onPress={() => toggleDoneToday(task, disabled)}
                                >
                                    <Ionicons
                                        name={done ? "checkmark-circle" : "ellipse-outline"}
                                        size={18}
                                        color={
                                            disabled ? "#9db6ff" : done ? "#fff" : "#4e88ff"
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.doneText,
                                            done && { color: "#fff" },
                                            disabled && { color: "#9db6ff" },
                                        ]}
                                    >
                                        {disabled ? "No disponible" : done ? "Hecha hoy" : "Marcar hoy"}
                                    </Text>
                                </TouchableOpacity>

                                <View style={{ flexDirection: "row", gap: 10 }}>
                                    <TouchableOpacity
                                        style={styles.linkBtn}
                                        onPress={() => handleEdit(task.id)}
                                    >
                                        <Ionicons name="pencil" size={16} color="#2b73ff" />
                                        <Text style={styles.linkText}>Editar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.linkBtn}
                                        onPress={() => askDelete(task.id)}
                                    >
                                        <Ionicons name="trash" size={16} color="#ff4d4f" />
                                        <Text style={[styles.linkText, { color: "#ff4d4f" }]}>
                                            Eliminar
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                })
            ) : (
                <Text style={styles.noTasks}>{emptyText}</Text>
            )}
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Section
                    title="Tareas puntuales de hoy"
                    items={tasksToday}
                    disabled={false}
                    emptyText="No hay tareas para hoy."
                />
                <Section
                    title="Recurrentes (no hoy)"
                    items={tasksRecurringNotToday}
                    disabled={true}
                    emptyText="No hay tareas recurrentes fuera de hoy."
                />
                <Section
                    title="Sin fecha"
                    items={tasksNoDate}
                    disabled={false}
                    emptyText="No hay tareas sin fecha."
                />
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={handleCreate}>
                <Ionicons name="add" size={22} color="#fff" />
                <Text style={styles.fabText}>Nueva tarea</Text>
            </TouchableOpacity>

            <ConfirmDialog
                visible={confirmOpen}
                title="Eliminar tarea"
                message="¿Seguro que querés eliminar esta tarea? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                destructive
                onConfirm={confirmDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, paddingBottom: 100 },

    sectionTitle: { fontSize: 14, fontWeight: "700", color: "#333" },
    noTasks: { fontSize: 14, color: "#666", marginTop: 6 },

    card: {
        backgroundColor: "#f5faff",
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    cardDisabled: { opacity: 0.7 },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    taskTitle: { fontSize: 16, fontWeight: "700", color: "#333" },

    badge: {
        backgroundColor: "#e6f0ff",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeMuted: { backgroundColor: "#edf2ff" },
    badgeText: { fontSize: 12, color: "#3f73ff", fontWeight: "600" },
    badgeTextMuted: { color: "#8aa6ff" },

    subtaskRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 4,
    },
    subtaskText: { fontSize: 14, color: "#234" },
    noSubtasks: {
        fontSize: 14,
        color: "#888",
        fontStyle: "italic",
        marginTop: 4,
    },

    actionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
    },

    doneBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderWidth: 1,
        borderColor: "#4e88ff",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: "#fff",
    },
    doneBtnActive: { backgroundColor: "#4e88ff", borderColor: "#4e88ff" },
    doneBtnDisabled: { borderColor: "#b9c8ff", backgroundColor: "#f0f4ff" },
    doneText: { color: "#4e88ff", fontWeight: "700", fontSize: 12 },

    linkBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 6,
    },
    linkText: { color: "#2b73ff", fontWeight: "700", fontSize: 12 },

    fab: {
        position: "absolute",
        bottom: 24,
        right: 24,
        backgroundColor: "#4e88ff",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 24,
        elevation: 3,
    },
    fabText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
});
