import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

export default function TopUpConfirm() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { amount, cardId } = useLocalSearchParams<{ amount: string; cardId: string }>();
  const { cards, addTransaction } = useApp();
  const amt = Number(amount || 0);
  const card = cards.find((c) => c.id === cardId);

  const handleTopUp = () => {
    addTransaction({
      id: "tx-" + Date.now(),
      name: "Top Up",
      category: "Top Up",
      amount: amt,
      currency: "USD",
      date: new Date().toISOString(),
    });
    router.replace("/(tabs)/home");
  };

  return (
    <Screen bg={Colors.white}>
      <Header title={t("common.confirm")} />
      <View style={{ flex: 1, paddingHorizontal: 18, alignItems: "center", paddingTop: 30 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.brand.primary, alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <Text style={{ color: Colors.white, fontFamily: "Sora_700Bold", fontSize: 22 }}>ZP</Text>
        </View>
        <Text style={{ color: Colors.accent.green, fontFamily: "Inter_500Medium", fontSize: 13 }}>{t("topup.topUpYour")}</Text>
        <Text style={{ color: Colors.ink[900], fontFamily: "Sora_700Bold", fontSize: 20, marginTop: 4 }}>{t("topup.zadpayWallet")}</Text>

        {/* From card */}
        <View style={{ width: "100%", backgroundColor: Colors.surface.background, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", marginTop: 28 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#EB001B", alignItems: "center", justifyContent: "center", marginRight: 12, overflow: "hidden" }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#F79E1B", position: "absolute", right: 6 }} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 }}>{t("topup.masterCard")}</Text>
            <Text style={{ color: Colors.ink[400], fontFamily: "Inter_400Regular", fontSize: 12 }}>**** **** **** {card?.last4 ?? "4242"}</Text>
          </View>
        </View>

        {/* Transfer details */}
        <View style={{ width: "100%", backgroundColor: Colors.surface.background, borderRadius: 16, padding: 16, marginTop: 12 }}>
          <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 12 }}>{t("send.transferDetails")}</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 }}>{t("send.transferAmount")}</Text>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 13 }}>{amt}$</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 }}>{t("send.transferFee")}</Text>
            <Text style={{ color: Colors.accent.green, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>{t("send.free")}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.ink[200] }}>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 }}>{t("common.total")}</Text>
            <Text style={{ color: Colors.brand.primary, fontFamily: "Inter_700Bold", fontSize: 16 }}>{amt}$</Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 16 }}>
        <Button title={t("topup.title")} onPress={handleTopUp} />
      </View>
    </Screen>
  );
}
