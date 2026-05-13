import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useHaptic } from "@/hooks/useHaptic";
import { Colors } from "@/theme/colors";

export default function IdCapture() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const { side = "front" } = useLocalSearchParams<{ side: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cam = useRef<CameraView>(null);

  useEffect(() => {
    if (Platform.OS !== "web" && !permission?.granted) requestPermission();
  }, [permission]);

  const handleCapture = async () => {
    haptic.medium();
    try {
      if (Platform.OS === "web") {
        setPhoto("mock");
      } else {
        const p = await cam.current?.takePictureAsync({ quality: 0.5 });
        setPhoto(p?.uri ?? "mock");
      }
    } catch {
      setPhoto("mock");
    }
  };

  const handleSubmit = () => {
    haptic.success();
    if (side === "front")
      router.replace({
        pathname: "/(auth)/id-capture",
        params: { side: "back" },
      });
    else router.push("/(auth)/selfie");
  };

  const handleRetake = () => {
    haptic.light();
    setPhoto(null);
  };

  return (
    <Screen bg={Colors.black} style={{ backgroundColor: Colors.black }}>
      <Header light transparent />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 360 }}
          style={{
            width: "100%",
            aspectRatio: 1.55,
            borderRadius: 18,
            overflow: "hidden",
            backgroundColor: "#0a0a0a",
            position: "relative",
          }}
        >
          {Platform.OS !== "web" && permission?.granted && !photo ? (
            <CameraView ref={cam} style={{ flex: 1 }} facing="back" />
          ) : photo ? (
            <View
              style={{
                flex: 1,
                backgroundColor: "#1a1a1a",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: "82%",
                  aspectRatio: 1.58,
                  borderRadius: 10,
                  backgroundColor: "#FAFAFA",
                  padding: 12,
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 70,
                    borderRadius: 6,
                    backgroundColor: Colors.ink[200],
                  }}
                />
                <View style={{ flex: 1, marginLeft: 10, gap: 6 }}>
                  {[60, 80, 70, 50].map((w, i) => (
                    <View
                      key={i}
                      style={{
                        height: 7,
                        width: (w + "%") as any,
                        borderRadius: 3,
                        backgroundColor: Colors.ink[200],
                      }}
                    />
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="card-outline" size={48} color="rgba(255,255,255,0.3)" />
              <Text
                style={{
                  marginTop: 8,
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "Inter_500Medium",
                }}
              >
                Camera preview
              </Text>
            </View>
          )}

          {(["tl", "tr", "bl", "br"] as const).map((c) => (
            <View
              key={c}
              style={{
                position: "absolute",
                width: 30,
                height: 30,
                borderColor: photo ? Colors.accent.green : "#FFFFFF",
                top: c.startsWith("t") ? 14 : undefined,
                bottom: c.startsWith("b") ? 14 : undefined,
                left: c.endsWith("l") ? 14 : undefined,
                right: c.endsWith("r") ? 14 : undefined,
                borderTopWidth: c.startsWith("t") ? 3 : 0,
                borderBottomWidth: c.startsWith("b") ? 3 : 0,
                borderLeftWidth: c.endsWith("l") ? 3 : 0,
                borderRightWidth: c.endsWith("r") ? 3 : 0,
                borderTopLeftRadius: c === "tl" ? 8 : 0,
                borderTopRightRadius: c === "tr" ? 8 : 0,
                borderBottomLeftRadius: c === "bl" ? 8 : 0,
                borderBottomRightRadius: c === "br" ? 8 : 0,
              }}
            />
          ))}
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200, duration: 360 }}
        >
          <Text
            style={{
              marginTop: 26,
              color: "#FFFFFF",
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              textAlign: "center",
              maxWidth: 300,
              lineHeight: 20,
            }}
          >
            {side === "front" ? t("auth.placeFront") : t("auth.placeBack")}
          </Text>
        </MotiView>
      </View>

      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 28,
          alignItems: "center",
          gap: 16,
        }}
      >
        {!photo ? (
          <Pressable
            onPress={handleCapture}
            style={({ pressed }) => ({
              width: 76,
              height: 76,
              borderRadius: 38,
              borderWidth: 4,
              borderColor: "rgba(255,255,255,0.55)",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: "#FFFFFF",
              }}
            />
          </Pressable>
        ) : (
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 320 }}
            style={{ width: "100%", alignItems: "center", gap: 14 }}
          >
            <Button title={t("auth.submitPhoto")} onPress={handleSubmit} />
            <Pressable onPress={handleRetake} hitSlop={10}>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                }}
              >
                {t("auth.retake")}
              </Text>
            </Pressable>
          </MotiView>
        )}
      </View>
    </Screen>
  );
}
