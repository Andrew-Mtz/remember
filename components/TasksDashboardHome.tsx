// components/TasksDashboardHome.tsx
import { useContext, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { GoalsContext } from "../context/GoalsContext";
import { TasksContext } from "../context/TasksContext";
import { Goal } from "../models/Goal";
import { HabitTask, Task } from "../models/Task";
import {
    todayISOLocal,
    dayIndexFromISO,
    startOfWeekISO,
    parseLocalISODate,
} from "../utils/dates";
import { isHabit } from "../models/typeGuards";

export const TasksDashboardHome = () => {
    const navigation = useNavigation();
    const { goals, recomputeAfterTaskToggle } = useContext(GoalsContext);
    const { tasks, updateTask } = useContext(TasksContext);

    const habitTasks = useMemo(() => tasks.filter(isHabit), [tasks]);

    const todayISO = useMemo(() => todayISOLocal(), []);
    const todayIdx = useMemo(() => dayIndexFromISO(todayISO), [todayISO]);

    // ---- Hábitos de hoy (agrupados por objetivo) ----
    const habitTodayByGoal = useMemo(() => {
        const map = new Map<string, { goal: Goal; items: Task[] }>();
        const habitsToday = habitTasks.filter(
            t => t.dayOfWeek === todayIdx
        );
        habitsToday.forEach(t => {
            if (!t.goalId) return;
            const g = goals.find(x => x.id === t.goalId);
            if (!g) return;
            if (!map.has(g.id)) map.set(g.id, { goal: g, items: [] });
            map.get(g.id)!.items.push(t);
        });
        return Array.from(map.values()).sort((a, b) =>
            a.goal.title.localeCompare(b.goal.title)
        );
    }, [tasks, goals, todayIdx]);

    // ---- Puntuales (standalone) que aplican HOY ----
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
        if (t.type !== "standalone") return false;
        const r = t.recurrence;
        if (!r) return false;
        if (r.type === "once") return true; // “sin fecha” no entra en HOY
        if (r.type === "daily") return true;
        if (r.type === "custom") return (r.daysOfWeek ?? []).includes(todayIdx);
        if (r.type === "weekly") {
            const k = r.interval ?? 1;
            const w = weeksDiff((t.createdAt ?? todayISO).slice(0, 10), todayISO);
            return w % k === 0;
        }
        if (r.type === "monthly") {
            const k = r.interval ?? 1;
            const m = monthsDiff((t.createdAt ?? todayISO).slice(0, 10), todayISO);
            return m % k === 0;
        }
        return false;
    };
    const standaloneToday = useMemo(
        () => tasks.filter(appliesToday).sort((a, b) => a.title.localeCompare(b.title)),
        [tasks, todayIdx, todayISO]
    );

    const isDoneToday = (t: Task) => t.completedDates?.includes(todayISO) ?? false;

    const toggleHabitToday = async (t: Task) => {
        if (t.type !== "habit") return;
        const set = new Set(t.completedDates ?? []);
        set.has(todayISO) ? set.delete(todayISO) : set.add(todayISO);
        const updated: Task = {
            ...t,
            completedDates: Array.from(set),
            updatedAt: new Date().toISOString(),
        };
        await updateTask(updated);
        const nextAll = tasks.map(x => (x.id === updated.id ? updated : x));
        await recomputeAfterTaskToggle(t.goalId!, nextAll, todayISO);
    };

    const toggleStandaloneToday = async (t: Task) => {
        if (t.type !== "standalone") return;
        const set = new Set(t.completedDates ?? []);
        set.has(todayISO) ? set.delete(todayISO) : set.add(todayISO);
        const hasSubs = (t.subtasks ?? []).length > 0;
        const allSubsDone = hasSubs && (t.subtasks ?? []).every(s => s.completed);
        const updated: Task = {
            ...t,
            completedDates: Array.from(set),
            completed: hasSubs ? allSubsDone : (t.completed ?? false),
            updatedAt: new Date().toISOString(),
        };
        await updateTask(updated);
    };

    const toggleSubtask = async (t: Task, subId: string) => {
        const nextSubs = (t.subtasks ?? []).map(s =>
            s.id === subId ? { ...s, completed: !s.completed } : s
        );
        const allChecked = nextSubs.length > 0 && nextSubs.every(s => s.completed);
        const updated: Task = {
            ...t,
            subtasks: nextSubs,
            completed: t.type === "standalone" ? allChecked : t.completed,
            updatedAt: new Date().toISOString(),
        };
        await updateTask(updated);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Hábitos de hoy */}
            <Text style={styles.sectionTitle}>Hábitos de hoy</Text>
            {habitTodayByGoal.length === 0 ? (
                <Text style={styles.emptySmall}>No hay hábitos para hoy.</Text>
            ) : (
                habitTodayByGoal.map(group => (
                    <View key={group.goal.id} style={{ marginTop: 10 }}>
                        <Text style={styles.goalHeader}>{group.goal.title}</Text>
                        {group.items.map(t => {
                            const done = isDoneToday(t);
                            return (
                                <View key={t.id} style={styles.card}>
                                    <View style={styles.rowBetween}>
                                        <Text style={styles.itemTitle}>📝 {t.title}</Text>
                                        <TouchableOpacity
                                            style={[styles.doneBtn, done && styles.doneBtnActive]}
                                            onPress={() => toggleHabitToday(t)}
                                        >
                                            <Ionicons
                                                name={done ? "checkmark-circle" : "ellipse-outline"}
                                                size={18}
                                                color={done ? "#fff" : "#4e88ff"}
                                            />
                                            <Text
                                                style={[styles.doneText, done && { color: "#fff" }]}
                                            >
                                                {done ? "Hecha hoy" : "Marcar hoy"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    {(t.subtasks ?? []).length ? (
                                        <View style={{ marginTop: 6 }}>
                                            {t.subtasks!.map(s => {
                                                const checked = !!s.completed;
                                                return (
                                                    <TouchableOpacity
                                                        key={s.id}
                                                        style={styles.subtaskRow}
                                                        onPress={() => toggleSubtask(t, s.id)}
                                                    >
                                                        <Ionicons
                                                            name={(checked ? "checkbox" : "square-outline") as any}
                                                            size={18}
                                                            color={"#4e88ff"}
                                                        />
                                                        <Text
                                                            style={[
                                                                styles.subtaskText,
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
                                </View>
                            );
                        })}
                    </View>
                ))
            )}

            {/* Puntuales de hoy */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                Tareas puntuales de hoy
            </Text>
            {standaloneToday.length === 0 ? (
                <Text style={styles.emptySmall}>No hay tareas puntuales para hoy.</Text>
            ) : (
                standaloneToday.map(t => {
                    const done = isDoneToday(t);
                    return (
                        <View key={t.id} style={styles.card}>
                            <View style={styles.rowBetween}>
                                <Text style={styles.itemTitle}>📌 {t.title}</Text>
                                <TouchableOpacity
                                    style={[styles.doneBtn, done && styles.doneBtnActive]}
                                    onPress={() => toggleStandaloneToday(t)}
                                >
                                    <Ionicons
                                        name={done ? "checkmark-circle" : "ellipse-outline"}
                                        size={18}
                                        color={done ? "#fff" : "#4e88ff"}
                                    />
                                    <Text style={[styles.doneText, done && { color: "#fff" }]}>
                                        {done ? "Hecha hoy" : "Marcar hoy"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {(t.subtasks ?? []).length ? (
                                <View style={{ marginTop: 6 }}>
                                    {t.subtasks!.map(s => {
                                        const checked = !!s.completed;
                                        return (
                                            <TouchableOpacity
                                                key={s.id}
                                                style={styles.subtaskRow}
                                                onPress={() => toggleSubtask(t, s.id)}
                                            >
                                                <Ionicons
                                                    name={(checked ? "checkbox" : "square-outline") as any}
                                                    size={18}
                                                    color={"#4e88ff"}
                                                />
                                                <Text
                                                    style={[
                                                        styles.subtaskText,
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
                        </View>
                    );
                })
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },

    sectionTitle: { fontSize: 16, fontWeight: "800", color: "#223" },
    emptySmall: { fontSize: 14, color: "#666", marginTop: 6 },

    goalHeader: { fontSize: 14, fontWeight: "700", color: "#445", marginTop: 4 },

    card: {
        backgroundColor: "#f5faff",
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
    },

    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
    },

    itemTitle: { fontSize: 15, fontWeight: "700", color: "#334" },

    subtaskRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 4,
    },
    subtaskText: { fontSize: 14, color: "#234" },
    noSubtasks: {
        fontSize: 13,
        color: "#888",
        fontStyle: "italic",
        marginTop: 4,
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
    doneText: { color: "#4e88ff", fontWeight: "700", fontSize: 12 },
});
