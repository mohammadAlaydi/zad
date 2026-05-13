import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { SettingUpIllustration } from "@/illustrations/SettingUpIllustration";
import { Colors } from "@/theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHaptic } from "@/hooks/useHaptic";

export default function SettingUp() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const [step, setStep] = useState(0);
  const steps = [
    t("auth.verifyingPhone"),
    t("auth.checkingDocs"),
    t("auth.creatingPasscode"),
  ];

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(
      setTimeout(() => {
        setStep(1);
        haptic.selection();
      }, 1000),
    );
    timers.push(
      setTimeout(() => {
        setStep(2);
        haptic.selection();
      }, 2100),
    );
    timers.push(
      setTimeout(() => {
        setStep(3);
        haptic.success();
      }, 3200),
    );
    timers.push(
      setTimeout(() => router.replace("/(auth)/passcode"), 4000),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <Screen>
      <Header showBack={false} />
      <View
        style={{ flex: 1, alignItems: "center", paddingHorizontal: 28 }}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 120 }}
          style={{ marginTop: 16 }}
        >
          <SettingUpIllustration size={210} />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 180, type: "timing", duration: 400 }}
          style={{ alignItems: "center" }}
        >
          <Text
            style={{
              marginTop: 26,
              color: Colors.brand.primary,
              fontFamily: "Sora_700Bold",
              fontSize: 20,
              textAlign: "center",
            }}
          >
            {t("auth.settingUp")}
          </Text>
          <Text
            style={{
              marginTop: 6,
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {t("auth.settingUpHint")}
          </Text>
        </MotiView>

        <View style={{ width: "100%", marginTop: 30, gap: 12 }}>
          {steps.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <MotiView
                key={i}
                from={{ opacity: 0, translateX: -10 }}
                animate={{
                  opacity: 1,
                  translateX: 0,
                  backgroundColor: done
                    ? Colors.brand.primary50
                    : active
                    ? "#FAF8FE"
                    : Colors.ink[50],
                }}
                transition={{
                  delay: 250 + i * 120,
                  type: "timing",
                  duration: 320,
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  gap: 14,
                }}
              >
                <MotiView
                  animate={{
                    backgroundColor: done
                      ? Colors.accent.green
                      : active
                      ? Colors.brand.primary100
                      : Colors.ink[200],
                    scale: done ? 1 : active ? 1 : 0.9,
                  }}
                  transition={{ type: "timing", duration: 260 }}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {done ? (
                    <MotiView
                      from={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12 }}
                    >
                      <Ionicons name="checkmark" size={18} color={Colors.white} />
                    </MotiView>
                  ) : active ? (
                    <ActivityIndicator
                      size="small"
                      color={Colors.brand.primary}
                    />
                  ) : null}
                </MotiView>
                <Text
                  style={{
                    color: done
                      ? Colors.ink[900]
                      : active
                      ? Colors.ink[900]
                      : Colors.ink[500],
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    flex: 1,
                  }}
                >
                  {s}
                </Text>
                {done ? (
                  <Text
                    style={{
                      color: Colors.accent.green,
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                    }}
                  >
                    Done
                  </Text>
                ) : null}
              </MotiView>
            );
          })}
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <Button
          title={t("auth.createPasscode")}
          disabled={step < 3}
          onPress={() => router.replace("/(auth)/passcode")}
        />
      </View>
    </Screen>
  );
}
