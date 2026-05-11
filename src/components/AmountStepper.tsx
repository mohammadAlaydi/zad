import { View, Text, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 28 }}>
      <Pressable
        onPress={() => {
          haptic.selection();
          onChange(Math.max(0, value - step));
        }}
        style={({ pressed }) => ({
          width: 38,
          height: 38,
          borderRadius: 20,
          backgroundColor: Colors.brand.primary50,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Ionicons name="remove" size={20} color={Colors.brand.primary} />
      </Pressable>
      <View style={{ minWidth: 160, alignItems: "center" }}>
        <Text style={{ color: Colors.brand.primary, fontFamily: "Sora_700Bold", fontSize: 30 }}>
          {symbol} {value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>
      <Pressable
        onPress={() => {
          haptic.selection();
          onChange(value + step);
        }}
        style={({ pressed }) => ({
          width: 38,
          height: 38,
          borderRadius: 20,
          backgroundColor: Colors.brand.primary50,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Ionicons name="add" size={20} color={Colors.brand.primary} />
      </Pressable>
    </View>
  );
}
