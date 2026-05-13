import { router } from "expo-router";
import { MotiView } from "moti";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useHaptic } from "@/hooks/useHaptic";
import { CongratsIllustration } from "@/illustrations/CongratsIllustration";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

const CONFETTI = [
  { left: "12%", top: "18%", color: Colors.brand.primary, delay: 0 },
  { left: "82%", top: "16%", color: Colors.accent.green, delay: 80 },
  { left: "22%", top: "62%", color: Colors.accent.amber, delay: 160 },
  { left: "78%", top: "58%", color: Colors.brand.primaryLight, delay: 240 },
  { left: "50%", top: "8%", color: Colors.accent.red, delay: 320 },
  { left: "8%", top: "42%", color: Colors.accent.green, delay: 380 },
  { left: "88%", top: "40%", color: Colors.brand.primary, delay: 440 },
];

export default function Congrats() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { setAuthenticated } = useApp();
  const haptic = useHaptic();

  useEffect(() => {
    haptic.success();
  }, []);

  return (
    <Screen>
      <View style={{ flex: 1, paddingHorizontal: 30 }}>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {CONFETTI.map((c, i) => (
            <MotiView
              key={i}
              from={{ opacity: 0, scale: 0, translateY: -10 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              transition={{
                delay: c.delay,
                type: "spring",
                damping: 9,
                stiffness: 110,
              }}
              style={{
                position: "absolute",
                left: c.left as any,
                top: c.top as any,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: c.color,
              }}
            />
          ))}
        </View>

        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 120 }}
          >
            <CongratsIllustration size={240} />
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 280, type: "timing", duration: 460 }}
            style={{ alignItems: "center", marginTop: 28 }}
          >
            <Text
              style={{
                color: Colors.brand.primary,
                fontFamily: "Sora_700Bold",
                fontSize: 24,
                textAlign: "center",
              }}
            >
              {t("auth.congrats")}
            </Text>
            <Text
              style={{
                marginTop: 8,
                color: Colors.ink[700],
                fontFamily: "Inter_500Medium",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {t("auth.welcomeToZad")}
            </Text>
          </MotiView>
        </View>
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 14 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 520, type: "timing", duration: 360 }}
        style={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <Button
          title={t("common.continue")}
          onPress={() => {
            setAuthenticated(true);
            router.replace("/(tabs)/home");
          }}
        />
      </MotiView>
    </Screen>
  );
}
