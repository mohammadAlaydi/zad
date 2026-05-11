import { Pressable, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { useHaptic } from "@/hooks/useHaptic";
import { Colors } from "@/theme/colors";

type Props = {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  divider?: boolean;
};

export function ListRow({ icon, title, subtitle, right, onPress, divider = true }: Props) {
  const haptic = useHaptic();
  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          haptic.selection();
          onPress();
        }
      }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: Colors.ink[100],
        backgroundColor: pressed ? Colors.ink[50] : "transparent",
      })}
    >
      {icon ? (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: Colors.brand.primary50,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          {icon}
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color: Colors.ink[900], fontFamily: "Inter_500Medium", fontSize: 15 }}>{title}</Text>
        {subtitle ? (
          <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
        ) : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={20} color={Colors.ink[400]} /> : null)}
    </Pressable>
  );
}
