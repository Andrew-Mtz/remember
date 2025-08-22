import React, { useContext, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ProjectGoal } from "../../models/Goal";
import { TasksContext } from "../../context/TasksContext";

const pr = { high: 0, medium: 1, low: 2 } as const;

export const ProjectGoalCard = ({
  goal,
  onPress,
}: {
  goal: ProjectGoal;
  onPress?: () => void;
}) => {
  const { getTasksByGoal } = useContext(TasksContext);
  const tasks = getTasksByGoal(goal.id).filter(t => t.type === "project");

  const total = tasks.length || 0;
  const done = tasks.filter(t => t.completed).length;
  const pct = total ? Math.min(done / total, 1) : 0;

  const topTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => {
        const ao =
          (a.order ?? Number.MAX_SAFE_INTEGER) -
          (b.order ?? Number.MAX_SAFE_INTEGER);
        if (ao !== 0) return ao;
        const ap = pr[a.priority ?? "medium"] - pr[b.priority ?? "medium"];
        if (ap !== 0) return ap;
        return a.title.localeCompare(b.title);
      })
      .slice(0, 3);
  }, [tasks]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Top row */}
      <View style={styles.row}>
        <Text style={styles.title}>{goal.title}</Text>
        <Text style={styles.smallBold}>
          {done}/{total}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
      </View>

      {/* Top tasks */}
      {topTasks.length ?
        <View style={{ marginTop: 8 }}>
          {topTasks.map(t => (
            <Text key={t.id} style={styles.taskLine}>
              • {t.title}
              {t.order ? `  (#${t.order})` : ""}
              {t.priority ? `  [${t.priority}]` : ""}
            </Text>
          ))}
        </View>
      : <Text style={styles.emptyLine}>
          Agregá los primeros pasos para avanzar.
        </Text>
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#eef9f1",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#233" },
  smallBold: { fontWeight: "700", color: "#233" },
  progressBar: {
    height: 8,
    backgroundColor: "#dff0e5",
    borderRadius: 6,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#2bb673" },
  taskLine: { marginTop: 4, color: "#234" },
  emptyLine: { marginTop: 6, color: "#567" },
});
