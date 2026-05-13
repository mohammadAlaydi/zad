import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MotiView } from "moti";
import { useTranslation } from "react-i18next";
import { View, Text, Pressable, Dimensions } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

const { width } = Dimensions.get("window");

export default function QrDisplay() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user, balances, activeCurrency } = useApp();
  const qrValue = JSON.stringify({ user: user.username, amount: 0, currency: activeCurrency });

  return (
    <Screen bg={Colors.white}>
      <Header title={t("home.getQr")} />
      <View style={{ flex: 1, alignItems: "center", paddingTop: 30, paddingHorizontal: 24 }}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 400 }}
          style={{
            backgroundColor: Colors.white,
            borderRadius: 24,
            padding: 28,
            alignItems: "center",
            shadowColor: "#101225",
            shadowOpacity: 0.08,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6,
            width: "100%",
          }}
        >
          <QRCode
            value={qrValue}
            size={width * 0.5}
            color={Colors.brand.primary}
            backgroundColor={Colors.white}
          />
          <Text
            style={{
              marginTop: 18,
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {t("receive.requestPayment")}
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 20, width: "100%" }}>
            <Pressable
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                height: 50,
                borderRadius: 999,
                backgroundColor: Colors.brand.primary,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Ionicons name="link" size={18} color={Colors.white} />
              <Text style={{ color: Colors.white, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
                Share link
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                height: 50,
                borderRadius: 999,
                backgroundColor: Colors.brand.primary,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Ionicons name="qr-code" size={18} color={Colors.white} />
              <Text style={{ color: Colors.white, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
                Share QR
              </Text>
            </Pressable>
          </View>
        </MotiView>

        {/* Balance hint */}
        <View
          style={{
            marginTop: 24,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: Colors.surface.background,
            borderRadius: 16,
            padding: 14,
            width: "100%",
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: Colors.brand.primary50,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="wallet-outline" size={18} color={Colors.brand.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
              {activeCurrency} Balance
            </Text>
            <Text
              style={{ color: Colors.accent.green, fontFamily: "Inter_500Medium", fontSize: 12 }}
            >
              {balances[activeCurrency].toLocaleString()} $
            </Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 16 }}>
        <Button title={t("common.done")} onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
