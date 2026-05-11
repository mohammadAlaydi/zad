import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { FlagSelect } from "@/components/FlagSelect";
import { Header } from "@/components/Header";
import { WelcomeIllustration } from "@/illustrations/WelcomeIllustration";
import { Colors } from "@/theme/colors";

export default function Welcome() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Screen>
      <Header showBack={false} right={<FlagSelect />} />
      <View style={{ flex: 1, paddingHorizontal: 28, alignItems: "center" }}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={{ marginTop: 18 }}
        >
          <WelcomeIllustration size={220} />
        </MotiView>
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 120, duration: 500 }}
          style={{ alignItems: "center", marginTop: 26 }}
        >
          <Text style={{ color: Colors.ink[900], fontFamily: "Sora_700Bold", fontSize: 22, textAlign: "center" }}>
            {t("auth.createTitle")}
          </Text>
          <Text style={{ marginTop: 12, color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 20, textAlign: "center", maxWidth: 320 }}>
            {t("auth.createSubtitle")}
          </Text>
        </MotiView>
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 18, gap: 12 }}>
        <Button title={t("auth.signUp")} onPress={() => router.push("/(auth)/signup")} />
        <Button title={t("auth.logIn")} variant="secondary" onPress={() => router.push("/(auth)/login")} />
        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 4, gap: 10 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: Colors.ink[200] }} />
          <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12 }}>{t("auth.continueWith")}</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: Colors.ink[200] }} />
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => router.replace("/(tabs)/home")}
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              height: 50,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: Colors.ink[200],
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="logo-google" size={18} color="#DB4437" />
            <Text style={{ color: Colors.ink[800], fontFamily: "Inter_500Medium", fontSize: 14 }}>{t("auth.google")}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace("/(tabs)/home")}
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              height: 50,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: Colors.ink[200],
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="logo-apple" size={20} color={Colors.ink[900]} />
            <Text style={{ color: Colors.ink[800], fontFamily: "Inter_500Medium", fontSize: 14 }}>{t("auth.apple")}</Text>
          </Pressable>
        </View>
        <Text style={{ textAlign: "center", color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 8 }}>
          {t("auth.termsHint")}{" "}
          <Text style={{ color: Colors.brand.primary, fontFamily: "Inter_500Medium" }}>{t("auth.terms")}</Text>{" "}
          {t("auth.and")}{" "}
          <Text style={{ color: Colors.brand.primary, fontFamily: "Inter_500Medium" }}>{t("auth.privacy")}</Text>
        </Text>
      </View>
    </Screen>
  );
}
