import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";

export default function LostDevice() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <Screen bg={Colors.surface.background}>
      <Header title={t("security.lostDevice")} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 320 }}
        >
          {/* Icon banner */}
          <View style={{ alignItems: "center", marginBottom: 24, marginTop: 12 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: Colors.brand.primary50,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="phone-portrait-outline" size={38} color={Colors.brand.primary} />
            </View>
            <Text
              style={{
                color: Colors.ink[900],
                fontFamily: "Sora_700Bold",
                fontSize: 22,
                marginTop: 16,
                textAlign: "center",
              }}
            >
              {t("security.lostDevice")}
            </Text>
            <Text
              style={{
                color: Colors.ink[500],
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                marginTop: 8,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Lost or stolen device? We can lock{"\n"}your account immediately to protect your
              funds.
            </Text>
          </View>

          {/* Actions */}
          {[
            {
              icon: "lock-closed-outline" as const,
              title: "Lock account instantly",
              body: "Prevents all transactions and logins.",
            },
            {
              icon: "phone-portrait-outline" as const,
              title: "Sign out all devices",
              body: "Remove access from every logged-in device.",
            },
            {
              icon: "call-outline" as const,
              title: "Contact support",
              body: "Speak to an agent within 2 minutes.",
            },
          ].map((a) => (
            <View
              key={a.title}
              style={{
                backgroundColor: Colors.white,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: Colors.ink[100],
                padding: 16,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  backgroundColor: Colors.brand.primary50,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Ionicons name={a.icon} size={20} color={Colors.brand.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: Colors.ink[900],
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    marginBottom: 4,
                  }}
                >
                  {a.title}
                </Text>
                <Text
                  style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12 }}
                >
                  {a.body}
                </Text>
              </View>
            </View>
          ))}

          <View style={{ marginTop: 24 }}>
            <Button
              title="Lock My Account"
              onPress={() =>
                Alert.alert(
                  "Account Locked",
                  "Your account has been locked. Contact support to regain access.",
                )
              }
            />
          </View>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
