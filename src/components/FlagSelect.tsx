import { Pressable, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/store/appStore";
import { setLocale } from "@/i18n";
import { Colors } from "@/theme/colors";

const FLAGS: Record<string, string> = { en: "🇬🇧", ar: "🇦🇪" };

export function FlagSelect() {
  const { locale, setLocale: setStoreLocale } = useApp();
  const toggle = () => {
    const next = locale === "en" ? "ar" : "en";
    setStoreLocale(next);
    setLocale(next);
  };
  return (
    <Pressable
      onPress={toggle}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: Colors.ink[50],
        gap: 6,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontSize: 16 }}>{FLAGS[locale]}</Text>
      <Text style={{ color: Colors.ink[700], fontFamily: "Inter_500Medium", fontSize: 12 }}>
        {locale === "en" ? "English" : "العربية"}
      </Text>
      <Ionicons name="chevron-down" size={14} color={Colors.ink[500]} />
    </Pressable>
  );
}
