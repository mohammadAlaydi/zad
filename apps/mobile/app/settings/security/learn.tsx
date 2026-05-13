import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Colors } from "@/theme/colors";

const TIPS = [
  { icon: "lock-closed-outline" as const, title: "Use a strong passcode", body: "Avoid simple PINs like 123456. Use a mix of numbers." },
  { icon: "eye-off-outline" as const, title: "Never share your password", body: "ZADPAY will never ask for your password via phone or email." },
  { icon: "notifications-outline" as const, title: "Enable notifications", body: "Stay informed about every transaction on your account." },
  { icon: "wifi-outline" as const, title: "Avoid public Wi-Fi", body: "Don't access ZADPAY on unsecured public networks." },
  { icon: "finger-print-outline" as const, title: "Enable biometrics", body: "Face ID or fingerprint keeps your account safer and faster." },
];

export default function LearnSecurity() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <Screen bg={Colors.surface.background}>
      <Header title={t("security.learnMore")} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: insets.bottom + 24 }}>
        <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 320 }}>
          <Text style={{ color: Colors.brand.primary, fontFamily: "Sora_700Bold", fontSize: 22, marginBottom: 6 }}>
            {t("security.learnMore")}
          </Text>
          <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 24 }}>
            Tips to keep your ZADPAY account safe and secure.
          </Text>

          {TIPS.map((tip, i) => (
            <MotiView
              key={tip.title}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 60, duration: 300 }}
            >
              <View style={{
                backgroundColor: Colors.white,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: Colors.ink[100],
                padding: 16,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 14,
              }}>
                <View style={{
                  width: 42, height: 42, borderRadius: 12,
                  backgroundColor: Colors.brand.primary50,
                  alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Ionicons name={tip.icon} size={20} color={Colors.brand.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 4 }}>
                    {tip.title}
                  </Text>
                  <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 }}>
                    {tip.body}
                  </Text>
                </View>
              </View>
            </MotiView>
          ))}
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
