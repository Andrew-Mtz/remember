// navigation/AppNavigator.tsx
import React, { useContext } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PaperProvider } from "react-native-paper";

import { ThemeContext } from "../context/ThemeContext";
import { UserContext } from "../context/UserContext";

import { HomeScreen } from "../screens/HomeScreen";
import { CreateTaskScreen } from "../screens/CreateTaskScreen";
import { FriendsScreen } from "../screens/FriendsScreen";
import { BlockerScreen } from "../screens/BlockerScreen";
import { AccountScreen } from "../screens/AccountScreen";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { CreateGoalModalScreen } from "../screens/Goal/create/CreateGoalModalScreen";
import { GoalDetailScreen } from "../screens/Goal/GoalDetailScreen";
import { EditGoalScreen } from "../screens/Goal/EditGoalScreen";
import { GoalDescriptionScreen } from "../screens/Goal/create/GoalDescriptionScreen";
import { GoalCategoryScreen } from "../screens/Goal/create/GoalCategoryScreen";
import { GoalMeasureScreen } from "../screens/Goal/create/GoalMeasureScreen";
import { GoalReminderScreen } from "../screens/Goal/create/GoalReminderScreen";
import { GoalMotivationScreen } from "../screens/Goal/create/GoalMotivationScreen";
import { EmojiPickerScreen } from "../screens/Goal/create/EmojiPickerScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tabs principales
const MainTabs = () => {
  const theme = useContext(ThemeContext);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.elevation.level2,
          borderTopColor: "transparent",
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant ?? "#999",
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Tab.Screen
        name="Objetivos"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flag-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Amigos"
        component={FriendsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bloqueador"
        component={BlockerScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cuenta"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const theme = useContext(ThemeContext);
  const { showWelcome } = useContext(UserContext);

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer
        theme={theme.dark ? NavigationDarkTheme : DefaultTheme}
      >
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.elevation.level2, // se adapta al modo oscuro
            },
            headerTintColor: theme.colors.primary, // ícono back
            headerTitleStyle: {
              fontWeight: "600",
            },
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          {showWelcome ?
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
          : <>
              <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CreateGoalModal"
                component={CreateGoalModalScreen}
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                  title: "Nuevo objetivo",
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="GoalDescription"
                component={GoalDescriptionScreen}
                options={{ title: "Descripción" }}
              />
              <Stack.Screen
                name="GoalCategory"
                component={GoalCategoryScreen}
                options={{ title: "Categoría" }}
              />
              <Stack.Screen
                name="GoalMeasure"
                component={GoalMeasureScreen}
                options={{ title: "Medición" }}
              />
              <Stack.Screen
                name="GoalReminder"
                component={GoalReminderScreen}
                options={{ title: "Recordatorios" }}
              />
              <Stack.Screen
                name="GoalMotivation"
                component={GoalMotivationScreen}
                options={{ title: "Motivación" }}
              />
              <Stack.Screen
                name="EmojiPicker"
                component={EmojiPickerScreen}
                options={{ title: "Elegir emoji" }}
              />

              <Stack.Screen
                name="CreateTask"
                component={CreateTaskScreen}
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="GoalDetail"
                component={GoalDetailScreen}
                options={{ title: "Detalle del objetivo", headerShown: false }}
              />
              <Stack.Screen
                name="EditGoal"
                component={EditGoalScreen}
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                  headerShown: false,
                }}
              />
            </>
          }
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};
