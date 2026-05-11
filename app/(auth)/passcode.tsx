import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Colors } from "@/theme/colors";
import { useHaptic } from "@/hooks/useHaptic";

type Key = { d: string; sub?: string } | { d: "blank" } | { d: "del" };

const ROWS: Key[][] = [
  [{ d: "1" }, { d: "2", sub: "abc" }, { d: "3", sub: "def" }],
  [{ d: "4", sub: "ghi" }, { d: "5", sub: "jkl" }, { d: "6", sub: "mno" }],
  [{ d: "7", sub: "pqrs" }, { d: "8", sub: "tuv" }, { d: "9", sub: "wxyz" }],
  [{ d: "blank" }, { d: "0", sub: "+" }, { d: "del" }],
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
      <View style={styles.heading}>
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 320 }}
        >
          <Text style={styles.title}>{t("auth.createPasscode")}</Text>
          <Text style={styles.subtitle}>{t("auth.passcodeHint")}</Text>
        </MotiView>

        <View style={styles.dotsRow}>
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
                style={styles.dot}
              />
            );
          })}
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.keypadWrap}>
        {ROWS.map((row, rIdx) => (
          <View key={rIdx} style={styles.keyRow}>
            {row.map((k, cIdx) => {
              if (k.d === "blank") {
                return <View key={cIdx} style={styles.keyCell} />;
              }
              if (k.d === "del") {
                return (
                  <Pressable
                    key={cIdx}
                    onPress={() => press("del")}
                    style={({ pressed }) => [
                      styles.keyCell,
                      pressed && styles.keyCellPressed,
                    ]}
                    android_ripple={{ color: Colors.ink[100], borderless: true }}
                  >
                    <Ionicons
                      name="backspace-outline"
                      size={26}
                      color={Colors.ink[700]}
                    />
                  </Pressable>
                );
              }
              return (
                <Pressable
                  key={cIdx}
                  onPress={() => press(k.d)}
                  style={({ pressed }) => [
                    styles.keyCell,
                    pressed && styles.keyCellPressed,
                  ]}
                  android_ripple={{ color: Colors.ink[100], borderless: true }}
                >
                  <Text style={styles.keyDigit}>{k.d}</Text>
                  {"sub" in k && k.sub ? (
                    <Text style={styles.keySub}>{k.sub.toUpperCase()}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    paddingHorizontal: 28,
    alignItems: "center",
    marginTop: 18,
  },
  title: {
    color: Colors.brand.primary,
    fontFamily: "Sora_700Bold",
    fontSize: 22,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 44,
    marginBottom: 8,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  keypadWrap: {
    paddingHorizontal: 18,
    paddingBottom: 36,
  },
  keyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  keyCell: {
    flex: 1,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginHorizontal: 4,
  },
  keyCellPressed: {
    backgroundColor: Colors.ink[100],
    opacity: 0.9,
  },
  keyDigit: {
    fontFamily: "Inter_500Medium",
    fontSize: 28,
    color: Colors.ink[900],
    lineHeight: 32,
  },
  keySub: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.ink[500],
    marginTop: 2,
  },
});
