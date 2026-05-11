import { View, Text, Image, ImageSourcePropType } from "react-native";
import { Colors } from "@/theme/colors";

type Props = { name?: string; uri?: string; size?: number; source?: ImageSourcePropType };

export function Avatar({ name, uri, size = 40, source }: Props) {
  const initial = (name ?? "?").trim().charAt(0).toUpperCase();
  const colors = ["#B89AE0", "#7A57C5", "#5B2C9C", "#1FCFA5", "#F2B441", "#E25563"];
  const bg = colors[(initial.charCodeAt(0) || 0) % colors.length];
  if (uri || source) {
    return (
      <Image
        source={source ?? { uri }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: Colors.ink[200] }}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#FFFFFF", fontFamily: "Inter_600SemiBold", fontSize: size * 0.42 }}>{initial}</Text>
    </View>
  );
}
