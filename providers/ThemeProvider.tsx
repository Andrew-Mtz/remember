import React from "react";
import { useColorScheme } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { DarkTheme, LightTheme } from "../constants/theme";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const scheme = useColorScheme();
  console.log("Tema actual:", scheme);
  const theme = scheme === "dark" ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};
