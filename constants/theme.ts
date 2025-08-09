import {
  MD3LightTheme as DefaultLight,
  MD3DarkTheme as DefaultDark,
} from "react-native-paper";

export const LightTheme = {
  ...DefaultLight,
  dark: false,
  colors: {
    ...DefaultLight.colors,
    primary: "#4e88ff",
    background: "#fefefe",
    surface: "#ffffff",
    onSurface: "#1e1e1e",
    text: "#1e1e1e",
    secondary: "#6c63ff",
    outline: "#dddddd",
  },
};

export const DarkTheme = {
  ...DefaultDark,
  dark: true,
  colors: {
    ...DefaultDark.colors,
    primary: "#90caf9",
    background: "#121212",
    surface: "#1e1e1e",
    onSurface: "#fefefe",
    text: "#fefefe",
    secondary: "#bb86fc",
    outline: "#333333",
  },
};
