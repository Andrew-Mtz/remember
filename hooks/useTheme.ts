import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import type { MD3Theme } from "react-native-paper";

export const useTheme = (): MD3Theme => {
  return useContext(ThemeContext);
};
