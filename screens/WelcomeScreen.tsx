// screens/WelcomeScreen.tsx
import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { UserContext } from "../context/UserContext";
import { saveMoodDate } from "../services/storage";

const moods = [
  { emoji: "😊", label: "Feliz" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😞", label: "Triste" },
  { emoji: "😠", label: "Molesto" },
  { emoji: "😰", label: "Ansioso" },
];

export const WelcomeScreen = () => {
  const { user, setUser, setShowWelcome } = useContext(UserContext);

  const handleSelectMood = async (mood: string) => {
    const today = new Date().toISOString().split("T")[0];
    setUser({ ...user, moodToday: mood });
    await saveMoodDate(today);
    setShowWelcome(false);
  };

  const handleSkip = () => {
    setShowWelcome(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Cómo te sentís hoy?</Text>
      <View style={styles.moods}>
        {moods.map(m => (
          <TouchableOpacity
            key={m.label}
            style={styles.mood}
            onPress={() => handleSelectMood(m.label)}
          >
            <Text style={styles.emoji}>{m.emoji}</Text>
            <Text style={styles.label}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={handleSkip}>
        <Text style={styles.skip}>Saltar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 32,
  },
  moods: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    marginBottom: 32,
  },
  mood: {
    alignItems: "center",
    marginHorizontal: 12,
  },
  emoji: {
    fontSize: 36,
  },
  label: {
    fontSize: 14,
    marginTop: 4,
  },
  skip: {
    fontSize: 16,
    color: "#4e88ff",
    textDecorationLine: "underline",
  },
});
