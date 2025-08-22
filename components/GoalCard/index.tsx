// components/GoalCard/index.tsx
import { Goal } from "../../models/Goal";
import { HabitGoalCard } from "./HabitGoalCard";
import { ProjectGoalCard } from "./ProjectGoalCard";
import { QuitGoalCard } from "./QuitGoalCard";

export const GoalCard = ({
  goal,
  onPress,
}: {
  goal: Goal;
  onPress?: () => void;
}) => {
  if (goal.type === "habit")
    return <HabitGoalCard goal={goal} onPress={onPress} />;
  if (goal.type === "project")
    return <ProjectGoalCard goal={goal} onPress={onPress} />;
  return <QuitGoalCard goal={goal as any} onPress={onPress} />;
};
