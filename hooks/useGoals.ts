import { useContext } from "react";
import { GoalsContext } from "../context/GoalsContext";

export const useGoals = () => {
  return useContext(GoalsContext);
};
