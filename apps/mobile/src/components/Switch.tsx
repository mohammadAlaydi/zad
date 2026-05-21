import { MotiView } from "moti";
import { Pressable } from "react-native";
import { useHaptic } from "@/hooks/useHaptic";
import { Colors } from "@/theme/colors";

export function Switch({
  value,
  onChange,
  disabled = false,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const haptic = useHaptic();
  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        haptic.selection();
        onChange(!value);
      }}
      hitSlop={6}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <MotiView
        animate={{ backgroundColor: value ? Colors.brand.primary : Colors.ink[200] }}
        transition={{ type: "timing", duration: 200 }}
        style={{ width: 44, height: 26, borderRadius: 999, padding: 3, justifyContent: "center" }}
      >
        <MotiView
          animate={{ translateX: value ? 18 : 0 }}
          transition={{ type: "spring", damping: 16, stiffness: 220 }}
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            backgroundColor: "#FFFFFF",
            shadowOpacity: 0.15,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
          }}
        />
      </MotiView>
    </Pressable>
  );
}
