import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useHaptic } from "@/hooks/useHaptic";
import { SelfieIllustration } from "@/illustrations/SelfieIllustration";
import { Colors } from "@/theme/colors";

export default function Selfie() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState<"intro" | "capture" | "done">("intro");
  const cam = useRef<CameraView>(null);

  useEffect(() => {
    if (stage === "capture" && Platform.OS !== "web" && !permission?.granted) requestPermission();
  }, [stage, permission]);

  if (stage === "intro") {
    return (
      <Screen>
        <Header />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            paddingHorizontal: 30,
          }}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 14, stiffness: 110 }}
            style={{ marginTop: 60 }}
          >
            <SelfieIllustration size={220} />
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200, type: "timing", duration: 380 }}
          >
            <Text
              style={{
                marginTop: 40,
                textAlign: "center",
                color: Colors.ink[900],
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                maxWidth: 280,
                lineHeight: 26,
              }}
            >
              {t("auth.selfieTitle")}
            </Text>
          </MotiView>
        </View>
        <View
          style={{
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <Button
            title={t("auth.takeSelfie")}
            onPress={() => {
              haptic.light();
              setStage("capture");
            }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen bg={Colors.black} style={{ backgroundColor: Colors.black }}>
      <Header light transparent />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 360 }}
          style={{
            width: 280,
            height: 280,
            borderRadius: 140,
            overflow: "hidden",
            borderWidth: 3,
            borderColor: stage === "done" ? Colors.accent.green : "rgba(255,255,255,0.55)",
          }}
        >
          {Platform.OS !== "web" && permission?.granted ? (
            <CameraView ref={cam} style={{ flex: 1 }} facing="front" />
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: "#111",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="happy-outline" size={84} color="rgba(255,255,255,0.35)" />
            </View>
          )}

          {stage === "done" ? (
            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 12 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.4)",
              }}
            >
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  backgroundColor: Colors.accent.green,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="checkmark" size={52} color="#FFFFFF" />
              </View>
            </MotiView>
          ) : null}
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 220, duration: 340 }}
        >
          <Text
            style={{
              marginTop: 28,
              color: "#FFFFFF",
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              textAlign: "center",
              maxWidth: 280,
            }}
          >
            {stage === "done" ? "Looks great!" : "Position your face inside the circle"}
          </Text>
        </MotiView>
      </View>

      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 28,
          alignItems: "center",
          gap: 18,
        }}
      >
        {stage === "capture" ? (
          <Pressable
            onPress={() => {
              haptic.success();
              setStage("done");
              setTimeout(() => router.push("/(auth)/setting-up"), 900);
            }}
            style={({ pressed }) => ({
              width: 80,
              height: 80,
              borderRadius: 40,
              borderWidth: 4,
              borderColor: "rgba(255,255,255,0.55)",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "#FFFFFF",
              }}
            />
          </Pressable>
        ) : (
          <Text
            style={{
              color: Colors.accent.green,
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
            }}
          >
            Captured
          </Text>
        )}
      </View>
    </Screen>
  );
}
