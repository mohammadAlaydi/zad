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
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: Colors.ink[100],
        backgroundColor: pressed ? Colors.ink[50] : "transparent",
      })}
    >
      {/* Inner View owns ALL layout — avoids Pressable flex bugs on Android */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 11,
          paddingHorizontal: 16,
          minHeight: 48,
        }}
      >
        {icon ? (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
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
          <Text
            style={{
              color: Colors.ink[900],
              fontFamily: "Inter_500Medium",
              fontSize: 14,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                color: Colors.ink[500],
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                marginTop: 1,
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {right ?? (onPress ? (
          <Ionicons name="chevron-forward" size={18} color={Colors.ink[300]} />
        ) : null)}
      </View>
    </Pressable>
  );
}
