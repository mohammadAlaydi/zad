import { useEffect } from "react";
import { View, Text, Dimensions } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";
import { Easing } from "react-native-reanimated";
import { useApp } from "@/store/appStore";

const { width } = Dimensions.get("window");

export default function Splash() {
  const { hasOnboarded, isAuthenticated } = useApp();

  useEffect(() => {
    const t = setTimeout(() => {
      if (!hasOnboarded) router.replace("/onboarding");
      else if (!isAuthenticated) router.replace("/(auth)/welcome");
      else router.replace("/(tabs)/home");
    }, 1700);
    return () => clearTimeout(t);
  }, [hasOnboarded, isAuthenticated]);

  return (
    <LinearGradient
      colors={["#4B1F8A", "#2A0F55"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <MotiView
        from={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 700, easing: Easing.out(Easing.cubic) }}
      >
        <View style={{ alignItems: "center" }}>
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200, duration: 600 }}
            style={{ width: 92, height: 92, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", marginBottom: 22 }}
          >
            <View style={{ width: 46, height: 46, borderRadius: 13, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#4B1F8A", fontFamily: "Sora_700Bold", fontSize: 22 }}>Z</Text>
            </View>
          </MotiView>
          <MotiText
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 380, duration: 600 }}
            style={{ color: "#FFFFFF", fontFamily: "Sora_700Bold", fontSize: 36, letterSpacing: 1.2 }}
          >
            ZADPAY
          </MotiText>
          <MotiView
            from={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: width * 0.32 }}
            transition={{ delay: 700, duration: 700 }}
            style={{ height: 3, backgroundColor: "rgba(255,255,255,0.7)", marginTop: 14, borderRadius: 2 }}
          />
        </View>
      </MotiView>
    </LinearGradient>
  );
}
