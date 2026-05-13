import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MotiView, MotiText } from "moti";
import { useEffect } from "react";
import { View, Text, Dimensions } from "react-native";
import { Easing } from "react-native-reanimated";
import { useApp } from "@/store/appStore";

const { width, height } = Dimensions.get("window");

export default function Splash() {
  const { hasOnboarded, isAuthenticated } = useApp();

  useEffect(() => {
    const t = setTimeout(() => {
      if (!hasOnboarded) router.replace("/onboarding");
      else if (!isAuthenticated) router.replace("/(auth)/welcome");
      else router.replace("/(tabs)/home");
    }, 2200);
    return () => clearTimeout(t);
  }, [hasOnboarded, isAuthenticated]);

  return (
    <LinearGradient
      colors={["#6B36B0", "#4B1F8A", "#2A0F55"]}
      locations={[0, 0.5, 1]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <StatusBar style="light" />
      {/* Subtle radial glow overlay */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ type: "timing", duration: 1200 }}
        style={{
          position: "absolute",
          width: width * 1.2,
          height: width * 1.2,
          borderRadius: width * 0.6,
          backgroundColor: "#8159C2",
          top: height * 0.18,
        }}
      />
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ type: "timing", duration: 1400, delay: 200 }}
        style={{
          position: "absolute",
          width: width * 0.8,
          height: width * 0.8,
          borderRadius: width * 0.4,
          backgroundColor: "#A98AD6",
          top: height * 0.3,
        }}
      />

      <MotiView
        from={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 800, easing: Easing.out(Easing.cubic) }}
      >
        <View style={{ alignItems: "center" }}>
          {/* Logo icon */}
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200, duration: 700, easing: Easing.out(Easing.cubic) }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 28,
              backgroundColor: "rgba(255,255,255,0.10)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 15,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
              }}
            >
              <Text style={{ color: "#4B1F8A", fontFamily: "Sora_700Bold", fontSize: 24 }}>Z</Text>
            </View>
          </MotiView>

          {/* Brand name */}
          <MotiText
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500, duration: 700, easing: Easing.out(Easing.cubic) }}
            style={{
              color: "#FFFFFF",
              fontFamily: "Sora_700Bold",
              fontSize: 40,
              letterSpacing: 3,
            }}
          >
            ZADPAY
          </MotiText>

          {/* Animated underline */}
          <MotiView
            from={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: width * 0.28 }}
            transition={{ delay: 900, duration: 800, easing: Easing.out(Easing.cubic) }}
            style={{
              height: 3,
              backgroundColor: "rgba(255,255,255,0.6)",
              marginTop: 16,
              borderRadius: 2,
            }}
          />
        </View>
      </MotiView>
    </LinearGradient>
  );
}
