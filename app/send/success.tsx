import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

export default function SendSuccess() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { amount, mobile, contactName, message } = useLocalSearchParams<{ amount: string; mobile: string; contactName: string; message: string }>();
  const amt = Number(amount || 0);
  const recipient = contactName || mobile || "Recipient";
  const { addTransaction } = useApp();

  const handleShare = () => {
    // Mock share
    router.replace("/(tabs)/home");
  };

  const handleDone = () => {
    addTransaction({
      id: "tx-" + Date.now(),
      name: recipient,
      category: "Money Sent",
      amount: -amt,
      currency: "USD",
      date: new Date().toISOString(),
    });
    router.replace("/(tabs)/home");
  };

  return (
    <Screen bg={Colors.white}>
      <View style={{ flex: 1, paddingHorizontal: 18, alignItems: "center", paddingTop: 40 }}>
        <MotiView from={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", delay: 100 }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.accent.greenSoft, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Ionicons name="checkmark" size={48} color={Colors.accent.green} />
          </View>
        </MotiView>

        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 300 }}>
          <Text style={{ color: Colors.accent.green, fontFamily: "Inter_600SemiBold", fontSize: 16, marginBottom: 8 }}>{t("send.success")}</Text>
          <Text style={{ color: Colors.ink[900], fontFamily: "Sora_700Bold", fontSize: 32, textAlign: "center" }}>$ {amt.toFixed(2)}</Text>
          <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", marginTop: 4 }}>{t("send.totalSentMoney")}</Text>
        </MotiView>

        {/* Sent to card */}
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 500 }} style={{ width: "100%", backgroundColor: Colors.surface.background, borderRadius: 16, padding: 16, marginTop: 28 }}>
          <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12, marginBottom: 10 }}>{t("send.sentTo")}</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Avatar name={recipient} size={48} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 }}>{recipient}</Text>
              <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12 }}>{mobile || "0101663645"}</Text>
              <Text style={{ color: Colors.accent.green, fontFamily: "Inter_500Medium", fontSize: 11 }}>@{(recipient.replace(/\s+/g, "").toLowerCase())}</Text>
            </View>
          </View>
          {message ? (
            <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.ink[200] }}>
              <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12 }}>{t("send.message")}</Text>
              <Text style={{ color: Colors.ink[900], fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 2 }}>{message}</Text>
            </View>
          ) : null}
        </MotiView>

        {/* Transaction details */}
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 650 }} style={{ width: "100%", backgroundColor: Colors.surface.background, borderRadius: 16, padding: 16, marginTop: 12 }}>
          <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 12 }}>{t("send.transferDetails")}</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12 }}>{t("send.reference")}</Text>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_500Medium", fontSize: 12 }}>52545455454515</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12 }}>{t("send.date")}</Text>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_500Medium", fontSize: 12 }}>{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</Text>
          </View>
        </MotiView>
      </View>

      <View style={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 16, gap: 10 }}>
        <Button title={t("send.share")} icon={<Ionicons name="share-outline" size={18} color={Colors.white} />} onPress={handleShare} />
        <Button title={t("common.done")} variant="secondary" onPress={handleDone} />
      </View>
    </Screen>
  );
}
