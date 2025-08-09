// components/layout/SafeScreen.tsx
import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SafeScreenProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollProps?: ScrollViewProps;
};

export const SafeScreen = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  scrollProps,
}: SafeScreenProps) => {
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    backgroundColor: "#fff",
    ...style,
  };

  if (scrollable) {
    return (
      <ScrollView
        style={containerStyle}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 20,
  },
});
