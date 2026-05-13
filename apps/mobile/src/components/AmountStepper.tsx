import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useHaptic } from "@/hooks/useHaptic";
import { Colors } from "@/theme/colors";

type Props = {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  symbol?: string;
};

export function AmountStepper({ value, onChange, step = 50, symbol = "$" }: Props) {
  const haptic = useHaptic();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => {
          haptic.selection();
          onChange(Math.max(0, value - step));
        }}
        style={styles.btn}
      >
        <Ionicons name="remove" size={20} color={Colors.brand.primary} />
      </Pressable>
      <View style={styles.amountWrap}>
        <Text style={styles.amountText}>
          {symbol}{" "}
          {value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>
      <Pressable
        onPress={() => {
          haptic.selection();
          onChange(value + step);
        }}
        style={styles.btn}
      >
        <Ionicons name="add" size={20} color={Colors.brand.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
  btn: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
  },
  amountWrap: {
    minWidth: 160,
    alignItems: "center",
  },
  amountText: {
    color: Colors.brand.primary,
    fontFamily: "Sora_700Bold",
    fontSize: 30,
  },
});
