import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { Colors } from "@/theme/colors";

export default function QrConfirm() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { name, phone, amount, fee } = useLocalSearchParams<{ name: string; phone: string; amount: string; fee: string }>();
  const amt = Number(amount || 0);
  const feeVal = Number(fee || 0);
  const total = amt + feeVal;

  return (
    <Screen bg={Colors.white}>
      <Header title={t("qr.confirmation")} />
      <View style={{ flex: 1, paddingHorizontal: 18, alignItems: "center", paddingTop: 30 }}>
        <Avatar name={name || "Tom Coffee"} size={90} />
        <Text style={{ marginTop: 14, color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 18 }}>{name || "Tom Coffee"}</Text>
        <Text style={{ color: Colors.accent.green, fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 4 }}>{phone || "1654464646464596"}</Text>

        <View style={{ width: "100%", backgroundColor: Colors.surface.background, borderRadius: 16, padding: 16, marginTop: 28 }}>
          <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 12 }}>{t("send.transferDetails")}</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 }}>{t("send.transferAmount")}</Text>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 13 }}>{amt}$</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 }}>{t("send.transferFee")}</Text>
            <Text style={{ color: Colors.accent.red, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>{feeVal}$</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.ink[200] }}>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 }}>{t("common.total")}</Text>
            <Text style={{ color: Colors.brand.primary, fontFamily: "Inter_700Bold", fontSize: 16 }}>{total}$</Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 16 }}>
        <Button title={t("common.payNow")} onPress={() => router.replace("/(tabs)/home")} />
      </View>
    </Screen>
  );
}
