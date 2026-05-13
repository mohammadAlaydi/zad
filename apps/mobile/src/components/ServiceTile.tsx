import { Pressable, View, Text, StyleSheet } from "react-native";
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
      style={styles.wrapper}
    >
      <Pressable
        onPress={() => { haptic.light(); onPress?.(); }}
        style={styles.pressable}
      >
        <View
          style={[
            styles.iconBox,
            highlight ? styles.iconBoxHighlight : styles.iconBoxDefault,
          ]}
        >
          {icon}
        </View>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    flex: 1,
  },
  pressable: {
    alignItems: "center",
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconBoxHighlight: {
    backgroundColor: Colors.brand.primary,
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  iconBoxDefault: {
    backgroundColor: Colors.white,
    shadowColor: "#4B1F8A",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  label: {
    color: Colors.ink[800],
    fontFamily: "Inter_500Medium",
    fontSize: 11.5,
    textAlign: "center",
  },
});
