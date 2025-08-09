import { createContext } from "react";
import { MD3DarkTheme, type MD3Theme } from "react-native-paper";

export const ThemeContext = createContext<MD3Theme>(MD3DarkTheme);
