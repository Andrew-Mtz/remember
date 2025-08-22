import React, { useContext, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Goal } from "../models/Goal";
import { TasksContext } from "../context/TasksContext";

type Props = {
  goal: Goal;
};

export const GoalProgressHeader = ({ goal }: Props) => {
  const { tasks } = useContext(TasksContext);

  const isHabit = goal.type === "habit";
  const isProject = goal.type === "project";

  // ---- Utilidades de semana (Lun - Dom)
  const today = new Date();
  const monday = useMemo(() => {
    const d = new Date(today);
    const day = d.getDay(); // 0..6 (0=Dom)
    const diff = day === 0 ? -6 : 1 - day; // mover a Lunes
    d.setDate(d.getDate() + diff);
    return d;
  }, [today]);

  const sunday = useMemo(() => {
    const d = new Date(monday);
    d.setDate(d.getDate() + 6);
    return d;
  }, [monday]);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("es-UY", { day: "numeric", month: "short" });

  const weekRange = `${formatDate(monday)} - ${formatDate(sunday)}`;
  const daysLeft = Math.max(
    0,
    Math.ceil((sunday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  // ---- Proyecto: progreso por tareas (hechas/total)
  const projectStats = useMemo(() => {
    if (!isProject) return null;
    const my = tasks.filter(
      t => "goalId" in t && t.goalId === goal.id && t.type === "project"
    );
    const total = my.length;
    const done = my.filter(t => t.completed).length;
    const progress = total > 0 ? done / total : 0;
    const remaining = Math.max(total - done, 0);
    return { total, done, progress, remaining };
  }, [isProject, tasks, goal.id]);

  if (isHabit) {
    const { emoji, title, description, weeklyTarget, weeklyProgress, streak } =
      goal;

    const safeTarget = Math.max(0, weeklyTarget || 0);
    const safeCount = Math.max(0, weeklyProgress?.count || 0);
    const progress = safeTarget > 0 ? Math.min(safeCount / safeTarget, 1) : 0;
    const remaining = Math.max(safeTarget - safeCount, 0);

    return (
      <View style={styles.container}>
        {/* Emoji y título */}
        <View style={styles.topRow}>
          <Text style={styles.emoji}>{emoji || "🎯"}</Text>
          <View>
            <Text style={styles.title}>{title}</Text>
            {description ?
              <Text style={styles.description}>{description}</Text>
            : null}
          </View>
        </View>

        {/* Progreso visual (círculos por día objetivo) */}
        <View style={styles.progressBox}>
          <Text style={styles.progressText}>
            {safeCount} de {safeTarget}
          </Text>

          <View style={styles.circlesRow}>
            {Array.from({ length: safeTarget }).map((_, i) => (
              <View
                key={i}
                style={[styles.circle, i < safeCount && styles.circleDone]}
              />
            ))}
          </View>

          <Text style={styles.goalNote}>
            {remaining === 0 ?
              "¡Objetivo logrado!"
            : `${remaining} más para lograrlo`}
          </Text>

          <View style={styles.weekInfo}>
            <Text style={styles.weekText}>{weekRange}</Text>
            <Text style={styles.weekText}>
              {daysLeft} {daysLeft === 1 ? "día" : "días"} restantes
            </Text>
          </View>
        </View>

        {/* Racha actual */}
        <View style={styles.streakRow}>
          <View style={styles.streakBox}>
            <Text style={styles.streakLabel}>🔥 Racha actual</Text>
            <Text style={styles.streakValue}>{streak.current}</Text>
          </View>
          <View style={styles.streakBox}>
            <Text style={styles.streakLabel}>🏆 Racha más larga</Text>
            <Text style={styles.streakValue}>{streak.highest}</Text>
          </View>
        </View>
      </View>
    );
  }

  // Proyecto
  const { emoji, title, description } = goal;
  const total = projectStats?.total ?? 0;
  const done = projectStats?.done ?? 0;
  const p = projectStats?.progress ?? 0;
  const remainingTasks = projectStats?.remaining ?? 0;

  return (
    <View style={styles.container}>
      {/* Emoji y título */}
      <View style={styles.topRow}>
        <Text style={styles.emoji}>{emoji || "📦"}</Text>
        <View>
          <Text style={styles.title}>{title}</Text>
          {description ?
            <Text style={styles.description}>{description}</Text>
          : null}
        </View>
      </View>

      {/* Progreso visual (barra) */}
      <View style={styles.progressBox}>
        <Text style={styles.progressText}>
          {done} de {total} tareas completadas
        </Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${p * 100}%` }]} />
        </View>

        <Text style={styles.goalNote}>
          {remainingTasks === 0 ?
            "¡Proyecto completado!"
          : `Faltan ${remainingTasks} ${remainingTasks === 1 ? "tarea" : "tareas"}`
          }
        </Text>
      </View>
      {/* Sin racha/semana para proyectos */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f4ff",
    padding: 20,
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  emoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  progressBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderColor: "#d0e6ff",
    borderWidth: 1,
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    color: "#444",
  },

  // Hábitos: círculos
  circlesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  circleDone: {
    backgroundColor: "#4e88ff",
    borderColor: "#4e88ff",
  },

  // Proyectos: barra
  progressBar: {
    height: 10,
    backgroundColor: "#e6ecff",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4e88ff",
  },

  goalNote: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  weekInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekText: {
    fontSize: 12,
    color: "#777",
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  streakBox: {
    flex: 1,
    backgroundColor: "#eaf0ff",
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: "center",
  },
  streakLabel: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
