import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Pressable, Dimensions } from "react-native";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";

const { width } = Dimensions.get("window");

export default function QrScan() {
  const { t } = useTranslation();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (scanned) {
      const timer = setTimeout(() => {
        router.push({
          pathname: "/qr/confirm",
          params: { name: "Tom Coffee", phone: "1654464646464596", amount: "70", fee: "1" },
        });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [scanned]);

  return (
    <Screen bg={Colors.black}>
      <Header title={t("qr.title")} light showBack transparent onBack={() => router.back()} />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {/* Scanner frame */}
        <View style={{ width: width * 0.65, height: width * 0.65, position: "relative" }}>
          {/* Corner brackets */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 28,
              height: 28,
              borderTopWidth: 3,
              borderLeftWidth: 3,
              borderColor: Colors.white,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 28,
              height: 28,
              borderTopWidth: 3,
              borderRightWidth: 3,
              borderColor: Colors.white,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: 28,
              height: 28,
              borderBottomWidth: 3,
              borderLeftWidth: 3,
              borderColor: Colors.white,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 28,
              height: 28,
              borderBottomWidth: 3,
              borderRightWidth: 3,
              borderColor: Colors.white,
            }}
          />

          {/* Simulated camera view */}
          <Pressable
            onPress={() => setScanned(true)}
            style={{
              flex: 1,
              margin: 12,
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!scanned ? (
              <Text
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                }}
              >
                {t("qr.pointCamera")}
              </Text>
            ) : (
              <MotiView from={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <Ionicons name="checkmark-circle" size={48} color={Colors.accent.green} />
              </MotiView>
            )}
          </Pressable>

          {/* Scanning line */}
          {!scanned && (
            <MotiView
              from={{ top: 0 }}
              animate={{ top: width * 0.65 - 28 }}
              transition={{ loop: true, duration: 2000, type: "timing" }}
              style={{
                position: "absolute",
                left: 12,
                right: 12,
                height: 2,
                backgroundColor: Colors.accent.green,
              }}
            />
          )}
        </View>

        {/* Controls */}
        <View
          style={{
            position: "absolute",
            bottom: 60,
            flexDirection: "row",
            alignItems: "center",
            gap: 40,
          }}
        >
          <Pressable
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(255,255,255,0.12)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="image-outline" size={22} color={Colors.white} />
          </Pressable>
          <Pressable
            onPress={() => setScanned(true)}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              borderWidth: 4,
              borderColor: Colors.white,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.white }}
            />
          </Pressable>
          <Pressable
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(255,255,255,0.12)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="flashlight-outline" size={22} color={Colors.white} />
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
