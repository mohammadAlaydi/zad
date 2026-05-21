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
  ActivityIndicator,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AmountStepper } from "@/components/AmountStepper";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { useAuthSession } from "@/features/auth";
import { buildWirePayload, useCreatePaymentRequest } from "@/features/userdata";
import { useAccountBalance, useMyAccounts } from "@/features/wallet";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

const { width } = Dimensions.get("window");

export default function ReceiveMoney() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { activeCurrency } = useApp();
  const { session } = useAuthSession();
  const user = session?.user;
  const accounts = useMyAccounts();
  const account = accounts.data?.accounts.find((a) => a.currency === activeCurrency);
  const balanceQuery = useAccountBalance(account?.id);
  const balance =
    balanceQuery.data === undefined ? 0 : Number(BigInt(balanceQuery.data.balance.amount)) / 100;
  const [amount, setAmount] = useState(0);
  const [from, setFrom] = useState("");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [tab, setTab] = useState<"username" | "mobile">("username");
  // The QR is rendered after a successful payment_request creation. While
  // null the user is still composing the request.
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createRequest = useCreatePaymentRequest();

  const phone = user?.phone ?? "";

  async function onContinue() {
    if (qrValue !== null) {
      // Second tap acts as Done — back out.
      router.back();
      return;
    }
    setErrorMsg(null);
    if (phone.length === 0) {
      setErrorMsg("Your account has no phone number on file yet.");
      return;
    }
    try {
      const result = await createRequest.mutateAsync({
        recipientPhone: phone,
        recipientName: user?.fullName ?? "",
        amountMinor: String(Math.round(amount * 100)),
        currency: activeCurrency,
        channel: "receive",
        ...(note.length > 0 ? { note } : {}),
      });
      const payload = buildWirePayload({
        phone,
        amountMinor: Math.round(amount * 100),
        currency: activeCurrency,
        ...(note.length > 0 ? { note } : {}),
        requestId: result.id,
      });
      setQrValue(JSON.stringify(payload));
    } catch (err) {
      const code =
        err !== null && typeof err === "object" && "code" in err
          ? String((err as { code: unknown }).code)
          : "UNKNOWN";
      setErrorMsg(`Couldn't create payment request (${code}). Try again.`);
    }
  }

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
            <Text style={{ fontSize: 22, marginRight: 10 }}>{activeCurrency}</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 }}
              >
                {activeCurrency} Balance
              </Text>
              <Text
                style={{ color: Colors.accent.green, fontFamily: "Inter_500Medium", fontSize: 12 }}
              >
                Available {balance.toLocaleString()} $
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

          {errorMsg !== null ? (
            <Text
              style={{
                color: Colors.accent.red,
                fontFamily: "Inter_500Medium",
                fontSize: 12,
                marginTop: 12,
              }}
            >
              {errorMsg}
            </Text>
          ) : null}

          {qrValue !== null && (
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
              <Text
                style={{
                  marginTop: 4,
                  color: Colors.ink[400],
                  fontFamily: "Inter_400Regular",
                  fontSize: 11,
                  textAlign: "center",
                }}
              >
                Waiting for payer to scan…
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 16 }}>
        <Button
          title={
            qrValue !== null
              ? t("common.done")
              : createRequest.isPending
                ? "Generating…"
                : t("common.continue")
          }
          // Block submit if the form is empty: a payment_request with
          // amount=0 or no source label is meaningless. The "done" tap
          // (after QR is shown) always re-enables.
          disabled={
            createRequest.isPending ||
            (qrValue === null && (amount <= 0 || from.trim().length === 0))
          }
          onPress={() => {
            void onContinue();
          }}
        />
        {createRequest.isPending ? (
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <ActivityIndicator color={Colors.brand.primary} />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
