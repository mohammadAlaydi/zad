import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
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

export default function ConfirmPasscode() {
  const { t } = useTranslation();
  const haptic = useHaptic();
  const { first } = useLocalSearchParams<{ first: string }>();
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);

  const press = (k: string) => {
    haptic.selection();
    setErr(false);
    if (k === "del") setCode((c) => c.slice(0, -1));
    else if (k !== "blank" && code.length < 6) setCode((c) => c + k);
  };

  useEffect(() => {
    if (code.length === 6) {
      if (code === first) {
        haptic.success();
        const id = setTimeout(
          () => router.replace("/(auth)/congrats"),
          260,
        );
        return () => clearTimeout(id);
      } else {
        haptic.heavy();
        setErr(true);
        const id = setTimeout(() => {
          setCode("");
          setErr(false);
        }, 700);
        return () => clearTimeout(id);
      }
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
          <Text style={styles.title}>{t("auth.confirmPasscode")}</Text>
          <Text
            style={[
              styles.subtitle,
              { color: err ? Colors.accent.red : Colors.ink[500] },
            ]}
          >
            {err ? "Passcodes don't match. Try again." : t("auth.passcodeHint")}
          </Text>
        </MotiView>

        <MotiView
          animate={{
            translateX: err ? [-8, 8, -6, 6, -3, 0] : 0,
          } as any}
          transition={{ type: "timing", duration: 380 }}
          style={styles.dotsRow}
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const filled = i < code.length;
            return (
              <MotiView
                key={i}
                animate={{
                  scale: filled ? 1 : 0.85,
                  backgroundColor: err
                    ? Colors.accent.red
                    : filled
                    ? Colors.brand.primary
                    : Colors.ink[200],
                }}
                transition={{ type: "timing", duration: 180 }}
                style={styles.dot}
              />
            );
          })}
        </MotiView>
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.keypadWrap}>
        {ROWS.map((row, rIdx) => (
          <View key={rIdx} style={styles.keyRow}>
            {row.map((k, cIdx) => {
              if (k.d === "blank") {
                return <View key={cIdx} style={styles.keyCellWrap} />;
              }
              if (k.d === "del") {
                return (
                  <View key={cIdx} style={styles.keyCellWrap}>
                    <Pressable
                      onPress={() => press("del")}
                      style={styles.keyCell}
                      android_ripple={{ color: Colors.ink[100], borderless: true }}
                    >
                      {({ pressed }) => (
                        <View style={[StyleSheet.absoluteFill, styles.innerCell, pressed ? styles.keyCellPressed : null]}>
                          <Ionicons
                            name="backspace-outline"
                            size={26}
                            color={Colors.ink[700]}
                          />
                        </View>
                      )}
                    </Pressable>
                  </View>
                );
              }
              return (
                <View key={cIdx} style={styles.keyCellWrap}>
                  <Pressable
                    onPress={() => press(k.d)}
                    style={styles.keyCell}
                    android_ripple={{ color: Colors.ink[100], borderless: true }}
                  >
                    {({ pressed }) => (
                      <View style={[StyleSheet.absoluteFill, styles.innerCell, pressed ? styles.keyCellPressed : null]}>
                        <Text style={styles.keyDigit}>{k.d}</Text>
                        {"sub" in k && k.sub ? (
                          <Text style={styles.keySub}>{k.sub.toUpperCase()}</Text>
                        ) : null}
                      </View>
                    )}
                  </Pressable>
                </View>
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
    width: "100%",
    paddingHorizontal: 18,
    paddingBottom: 36,
  },
  keyRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  keyCellWrap: {
    flex: 1,
    marginHorizontal: 4,
    height: 64,
  },
  keyCell: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  innerCell: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
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
