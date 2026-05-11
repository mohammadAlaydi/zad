import { ReactNode } from "react";
import { View, ViewStyle, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/theme/colors";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  keyboard?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  bg?: string;
};

export function Screen({ children, scroll, keyboard, style, contentStyle, bg = Colors.white }: Props) {
  const insets = useSafeAreaInsets();
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[{ paddingBottom: insets.bottom + 24, flexGrow: 1 }, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
  );
  return (
    <View style={[{ flex: 1, backgroundColor: bg }, style]}>
      {keyboard ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </View>
  );
}
