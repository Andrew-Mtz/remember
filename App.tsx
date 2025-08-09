import React from "react";
import { ThemeProvider } from "./providers/ThemeProvider";
import { GoalsProvider } from "./providers/GoalsProvider";
import { AppNavigator } from "./navigation/AppNavigator";
import { UserProvider } from "./providers/UserProvider";
import { TasksProvider } from "./providers/TasksProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <TasksProvider>
            <GoalsProvider>
              <AppNavigator />
            </GoalsProvider>
          </TasksProvider>
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
