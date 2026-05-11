import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Colors } from "@/theme/colors";
import { useHaptic } from "@/hooks/useHaptic";

const KEYS: (string | "del" | "blank")[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "blank",
  "0",
  "del",
];

export default function Passcode() {
  const { t } = useTranslation();
  const haptic = useHaptic();
  const [code, setCode] = useState("");

  const press = (k: string) => {
    haptic.selection();
    if (k === "del") setCode((c) => c.slice(0, -1));
    else if (k !== "blank" && code.length < 6) setCode((c) => c + k);
  };

  useEffect(() => {
    if (code.length === 6) {
      haptic.success();
      const id = setTimeout(
        () =>
          router.push({
            pathname: "/(auth)/confirm-passcode",
            params: { first: code },
          }),
        260,
      );
      return () => clearTimeout(id);
    }
  }, [code]);

  return (
    <Screen>
      <Header />
      <View
        style={{
          paddingHorizontal: 28,
          alignItems: "center",
          marginTop: 18,
        }}
      >
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 320 }}
        >
          <Text
            style={{
              color: Colors.brand.primary,
              fontFamily: "Sora_700Bold",
              fontSize: 22,
              textAlign: "center",
            }}
          >
            {t("auth.createPasscode")}
          </Text>
          <Text
            style={{
              marginTop: 8,
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {t("auth.passcodeHint")}
          </Text>
        </MotiView>

        <View
          style={{
            flexDirection: "row",
            gap: 16,
            marginTop: 44,
            marginBottom: 8,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const filled = i < code.length;
            return (
              <MotiView
                key={i}
                animate={{
                  scale: filled ? 1 : 0.85,
                  backgroundColor: filled
                    ? Colors.brand.primary
                    : Colors.ink[200],
                }}
                transition={{ type: "timing", duration: 180 }}
                style={{ width: 14, height: 14, borderRadius: 7 }}
              />
            );
          })}
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ paddingHorizontal: 18, paddingBottom: 36 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {KEYS.map((k, idx) => (
            <Pressable
              key={`${k}-${idx}`}
              onPress={() => press(k)}
              disabled={k === "blank"}
              style={({ pressed }) => ({
                width: "33.333%",
                paddingVertical: 18,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed && k !== "blank" ? 0.55 : 1,
              })}
            >
              {k === "del" ? (
                <Ionicons
                  name="backspace-outline"
                  size={26}
                  color={Colors.ink[700]}
                />
              ) : k === "blank" ? null : (
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 28,
                    color: Colors.ink[900],
                  }}
                >
                  {k}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}
