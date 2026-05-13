import { MotiView } from "moti";
import { View } from "react-native";
import { Colors } from "@/theme/colors";

export function ProgressDots({
  count,
  index,
  dark,
}: {
  count: number;
  index: number;
  dark?: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 }}>
      {Array.from({ length: count }).map((_, i) => {
        const active = i === index;
        return (
          <MotiView
            key={i}
            animate={{
              width: active ? 22 : 6,
              backgroundColor: active
                ? Colors.brand.primary
                : dark
                  ? "rgba(255,255,255,0.35)"
                  : Colors.ink[200],
            }}
            transition={{ type: "timing", duration: 280 }}
            style={{ height: 6, borderRadius: 3 }}
          />
        );
      })}
    </View>
  );
}
