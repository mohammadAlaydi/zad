import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

export default function SendConfirm() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { balances, activeCurrency } = useApp();
  const { amount, mobile, contactName, message, tab } = useLocalSearchParams<{ amount: string; mobile: string; contactName: string; message: string; tab: string }>();
  const amt = Number(amount || 0);
  const recipient = contactName || mobile || "Recipient";
  const recipientPhone = mobile || "";

  return (
    <Screen bg={Colors.white}>
      <Header title={t("send.confirmation")} />
      <View style={{ flex: 1, paddingHorizontal: 18 }}>
        {/* Avatar */}
        <View style={{ alignItems: "center", marginTop: 10, marginBottom: 20 }}>
          <Avatar name={recipient} size={80} />
          <Text style={{ marginTop: 12, color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 18 }}>{recipient}</Text>
          {recipientPhone ? <Text style={{ color: Colors.accent.green, fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 4 }}>{recipientPhone}</Text> : null}
          <Text style={{ color: Colors.ink[400], fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>@{recipient.replace(/\s+/g, "").toLowerCase()}</Text>
        </View>

        {/* From */}
        <View style={{ backgroundColor: Colors.surface.background, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ fontSize: 22, marginRight: 10 }}>🇺🇸</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 }}>{activeCurrency} Balance</Text>
            <Text style={{ color: Colors.accent.green, fontFamily: "Inter_500Medium", fontSize: 12 }}>Available {balances[activeCurrency].toLocaleString()} $</Text>
          </View>
          <Pressable onPress={() => router.push("/(tabs)/accounts")} hitSlop={8}>
            <Text style={{ color: Colors.brand.primary, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>{t("common.change")}</Text>
          </Pressable>
        </View>

        {/* Message */}
        {message ? (
          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12 }}>{t("send.message")}</Text>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_500Medium", fontSize: 14, marginTop: 4 }}>{message}</Text>
          </View>
        ) : null}

        {/* Transfer details */}
        <View style={{ backgroundColor: Colors.surface.background, borderRadius: 16, padding: 16 }}>
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
        <Button title={t("send.sentMoney")} onPress={() => router.push({ pathname: "/send/processing", params: { amount: amount.toString(), mobile, contactName, message } })} />
      </View>
    </Screen>
  );
}
