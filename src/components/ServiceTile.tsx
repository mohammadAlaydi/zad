import { Pressable, View, Text } from "react-native";
import { ReactNode } from "react";
import { MotiView } from "moti";
import { useHaptic } from "@/hooks/useHaptic";
import { Colors } from "@/theme/colors";

type Props = { label: string; icon: ReactNode; onPress?: () => void; highlight?: boolean; index?: number };

export function ServiceTile({ label, icon, onPress, highlight, index = 0 }: Props) {
  const haptic = useHaptic();
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.85, translateY: 8 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: "spring", damping: 14, stiffness: 200, delay: index * 50 }}
      style={{ alignItems: "center", flex: 1 }}
    >
      <Pressable
        onPress={() => { haptic.light(); onPress?.(); }}
        style={({ pressed }) => ({ alignItems: "center", transform: [{ scale: pressed ? 0.93 : 1 }] })}
      >
        <View
          style={{
            width: 56, height: 56, borderRadius: 16,
            backgroundColor: highlight ? Colors.brand.primary : Colors.white,
            alignItems: "center", justifyContent: "center",
            shadowColor: highlight ? Colors.brand.primary : "#4B1F8A",
            shadowOpacity: highlight ? 0.3 : 0.1,
            shadowRadius: highlight ? 12 : 10,
            shadowOffset: { width: 0, height: 6 },
            elevation: highlight ? 6 : 3,
            marginBottom: 8,
          }}
        >
          {icon}
        </View>
        <Text style={{ color: Colors.ink[800], fontFamily: "Inter_500Medium", fontSize: 11.5, textAlign: "center" }} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </MotiView>
  );
}
