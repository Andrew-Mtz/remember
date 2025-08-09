// screens/EmojiPickerScreen.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const EMOJIS = [
  "🎯",
  "💪🏻",
  "📚",
  "🧠",
  "🔥",
  "🌱",
  "🚀",
  "🧘🏻",
  "💼",
  "🏋️‍♂️",
  "❤️",
  "🍎",
  "💡",
  "📝",
  "👨‍💻",
  "🎨",
  "🌟",
  "🤝",
  "🗓️",
  "😌",
];

export const EmojiPickerScreen = () => {
  const navigation = useNavigation();
  const { params }: any = useRoute();

  const handleSelect = (emoji: string) => {
    if (params?.onSelect) {
      params.onSelect(emoji);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Elegí un emoji</Text>
      <FlatList
        data={EMOJIS}
        numColumns={5}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.emojiBox}
            onPress={() => handleSelect(item)}
          >
            <Text style={styles.emoji}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  list: {
    justifyContent: "center",
  },
  emojiBox: {
    width: "20%",
    alignItems: "center",
    paddingVertical: 16,
  },
  emoji: {
    fontSize: 32,
  },
});
