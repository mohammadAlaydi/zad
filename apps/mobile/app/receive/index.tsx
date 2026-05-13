import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AmountStepper } from "@/components/AmountStepper";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

const { width } = Dimensions.get("window");

export default function ReceiveMoney() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { balances, activeCurrency, user } = useApp();
  const [amount, setAmount] = useState(0);
  const [from, setFrom] = useState("");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [tab, setTab] = useState<"username" | "mobile">("username");
  const [showQr, setShowQr] = useState(false);

  const qrValue = JSON.stringify({ user: user.username, amount, currency: activeCurrency });

  return (
    <Screen bg={Colors.white} keyboard>
      <Header title={t("receive.title")} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              backgroundColor: Colors.surface.background,
              borderRadius: 16,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <Text style={{ fontSize: 22, marginRight: 10 }}>USD</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 }}
              >
                {activeCurrency} Balance
              </Text>
              <Text
                style={{ color: Colors.accent.green, fontFamily: "Inter_500Medium", fontSize: 12 }}
              >
                Available {balances[activeCurrency].toLocaleString()} $
              </Text>
            </View>
            <Pressable onPress={() => router.push("/(tabs)/accounts")} hitSlop={8}>
              <Text
                style={{
                  color: Colors.brand.primary,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 13,
                }}
              >
                {t("common.change")}
              </Text>
            </Pressable>
          </View>

          <View
            style={{
              flexDirection: "row",
              marginBottom: 18,
              borderBottomWidth: 1,
              borderBottomColor: Colors.ink[100],
            }}
          >
            {(["username", "mobile"] as const).map((key) => (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 10,
                  borderBottomWidth: key === tab ? 2 : 0,
                  borderBottomColor: Colors.brand.primary,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons
                    name={key === "mobile" ? "phone-portrait-outline" : "at-circle-outline"}
                    size={16}
                    color={key === tab ? Colors.brand.primary : Colors.ink[400]}
                  />
                  <Text
                    style={{
                      color: key === tab ? Colors.brand.primary : Colors.ink[400],
                      fontFamily: key === tab ? "Inter_600SemiBold" : "Inter_400Regular",
                      fontSize: 13,
                    }}
                  >
                    {key === "mobile" ? t("receive.mobileNumber") : t("receive.userName")}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Text
            style={{
              textAlign: "center",
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {t("receive.howMuchCollect")}
          </Text>
          <AmountStepper value={amount} onChange={setAmount} />

          <Text
            style={{
              color: Colors.ink[700],
              fontFamily: "Inter_500Medium",
              fontSize: 13,
              marginTop: 22,
              marginBottom: 8,
            }}
          >
            {t("receive.receiveFrom")}
          </Text>
          <Input
            placeholder={tab === "mobile" ? t("receive.mobileNumber") : "@user Name"}
            value={from}
            onChangeText={setFrom}
            keyboardType={tab === "mobile" ? "phone-pad" : "default"}
            leftIcon={
              <Ionicons
                name={tab === "mobile" ? "phone-portrait-outline" : "at-outline"}
                size={18}
                color={Colors.ink[400]}
              />
            }
          />

          {!showNote ? (
            <Pressable
              onPress={() => setShowNote(true)}
              style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}
            >
              <Ionicons name="add-circle" size={18} color={Colors.accent.green} />
              <Text
                style={{
                  color: Colors.accent.green,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 13,
                }}
              >
                {t("receive.addNote")}
              </Text>
            </Pressable>
          ) : (
            <Input
              placeholder={t("receive.addNote")}
              value={note}
              onChangeText={setNote}
              leftIcon={<Ionicons name="chatbubble-outline" size={18} color={Colors.ink[400]} />}
            />
          )}

          {showQr && (
            <View
              style={{
                alignItems: "center",
                marginTop: 24,
                backgroundColor: Colors.white,
                borderRadius: 20,
                padding: 20,
                shadowColor: "#101225",
                shadowOpacity: 0.06,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
                elevation: 4,
              }}
            >
              <QRCode
                value={qrValue}
                size={width * 0.45}
                color={Colors.brand.primary}
                backgroundColor={Colors.white}
              />
              <Text
                style={{
                  marginTop: 12,
                  color: Colors.ink[500],
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                {t("receive.requestPayment")}
              </Text>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                <Pressable
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: Colors.brand.primary,
                  }}
                >
                  <Ionicons name="link" size={16} color={Colors.white} />
                  <Text
                    style={{ color: Colors.white, fontFamily: "Inter_600SemiBold", fontSize: 13 }}
                  >
                    Share link
                  </Text>
                </Pressable>
                <Pressable
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: Colors.brand.primary,
                  }}
                >
                  <Ionicons name="qr-code" size={16} color={Colors.white} />
                  <Text
                    style={{ color: Colors.white, fontFamily: "Inter_600SemiBold", fontSize: 13 }}
                  >
                    Share QR
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 16 }}>
        <Button
          title={showQr ? t("common.done") : t("common.continue")}
          onPress={() => (showQr ? router.back() : setShowQr(true))}
        />
      </View>
    </Screen>
  );
}
