// screens/HomeScreen.tsx
import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { GoalsContext } from "../context/GoalsContext";
import { GoalCard } from "../components/GoalCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const HomeScreen = () => {
  const { goals } = useContext(GoalsContext);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleCreateGoal = () => {
    navigation.navigate("CreateGoalModal" as never);
  };

  return (
    <>
      <View style={{ height: insets.top, backgroundColor: "#b8c7e4ff" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Tus objetivos</Text>

        <FlatList
          data={goals}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <GoalCard
              goal={item}
              onPress={() =>
                navigation.navigate({
                  name: "GoalDetail",
                  params: {
                    goalId: item.id,
                  },
                } as never)
              }
            />
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <Text style={styles.empty}>Aún no tenés objetivos creados.</Text>
          }
        />

        <TouchableOpacity style={styles.fab} onPress={handleCreateGoal}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  empty: {
    marginTop: 48,
    textAlign: "center",
    fontSize: 16,
    color: "#999",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    backgroundColor: "#4e88ff",
    borderRadius: 32,
    padding: 16,
    elevation: 4,
  },
});
