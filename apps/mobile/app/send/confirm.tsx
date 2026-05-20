import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { markPaymentRequestPaid } from "@/features/userdata";
import { useAccountBalance, useMyAccounts, useSendByPhone, useSendFlow } from "@/features/wallet";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

export default function SendConfirm() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { activeCurrency } = useApp();
  const accounts = useMyAccounts();
  const account = accounts.data?.accounts.find((a) => a.currency === activeCurrency);
  const balanceQuery = useAccountBalance(account?.id);
  const balance =
    balanceQuery.data === undefined ? 0 : Number(BigInt(balanceQuery.data.balance.amount)) / 100;

  const recipientName = useSendFlow((s) => s.recipientName);
  const recipientPhone = useSendFlow((s) => s.recipientPhone);
  const recipientCurrency = useSendFlow((s) => s.recipientCurrency);
  const amountMinor = useSendFlow((s) => s.amountMinor);
  const note = useSendFlow((s) => s.note);
  const idempotencyKey = useSendFlow((s) => s.idempotencyKey);
  const pendingRequestId = useSendFlow((s) => s.pendingRequestId);
  const setPendingRequestId = useSendFlow((s) => s.setPendingRequestId);
  const resetIdempotencyKey = useSendFlow((s) => s.resetIdempotencyKey);

  const sendMutation = useSendByPhone();
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  // Tracks the LAST error code returned by the API. Wrong-password keeps
  // the modal open with an inline error; all other failures close the
  // modal and route to the dedicated /send/failure screen.
  const [resultCode, setResultCode] = useState<string | null>(null);

  const amountDisplay = (amountMinor / 100).toFixed(2);
  const recipient = recipientName ?? "ZADPAY user";
  const username = "@" + recipient.replace(/\s+/g, "").toLowerCase();

  // Guard: if the flow store is empty (deep-link / refresh), bounce home.
  if (recipientPhone === null || amountMinor <= 0) {
    return (
      <Screen bg={Colors.white}>
        <Header title={t("send.confirmation")} />
        <View style={{ padding: 24 }}>
          <Text style={{ color: Colors.ink[700], fontFamily: "Inter_500Medium" }}>
            Start a new send from the home screen.
          </Text>
          <View style={{ height: 16 }} />
          <Button title="Go home" onPress={() => router.replace("/(tabs)/home")} />
        </View>
      </Screen>
    );
  }

  async function onConfirmSend() {
    if (recipientPhone === null) return;
    if (password.length === 0) return;
    setResultCode(null);
    try {
      const result = await sendMutation.mutateAsync({
        request: {
          recipientPhone,
          amount: { amount: String(amountMinor), currency: recipientCurrency ?? activeCurrency },
          password,
          ...(note.length > 0 ? { note } : {}),
        },
        idempotencyKey,
      });
      setPwModalOpen(false);
      setPassword("");
      // If the send was triggered by a payment request (QR / receive),
      // flip the request's status to "paid". We don't await — the receipt
      // page can render immediately while this fires in the background.
      if (pendingRequestId !== null) {
        const requestIdForUpdate = pendingRequestId;
        const txIdForUpdate = result.transaction.id;
        setPendingRequestId(null);
        void markPaymentRequestPaid(requestIdForUpdate, txIdForUpdate);
      }
      router.replace({
        pathname: "/send/success",
        params: {
          amount: String(amountMinor / 100),
          mobile: result.recipient.phone,
          contactName: result.recipient.fullName,
          message: note,
          transactionId: result.transaction.id,
        },
      });
    } catch (err) {
      const code =
        err !== null && typeof err === "object" && "code" in err
          ? String((err as { code: unknown }).code)
          : undefined;
      setResultCode(code ?? "UNKNOWN");

      if (code === "WALLET.INVALID_PASSWORD") {
        // Wrong password is the one case where staying put is the best UX —
        // the user just retypes the password and tries again. Modal stays
        // open, inline error inside the modal.
        return;
      }

      // For every other failure, the send didn't post — close the modal
      // and land the user on a dedicated failure screen with the specific
      // reason. The idempotency key rotates so retrying creates a fresh
      // attempt (the previous key may be cached as a failed result).
      setPwModalOpen(false);
      resetIdempotencyKey();
      router.replace({
        pathname: "/send/failure",
        params: {
          code: code ?? "UNKNOWN",
          amount: String(amountMinor / 100),
          recipient: recipientName ?? recipientPhone ?? "",
        },
      });
    }
  }

  return (
    <Screen bg={Colors.white}>
      <Header title={t("send.confirmation")} />
      <View style={{ flex: 1, paddingHorizontal: 18 }}>
        {/* Avatar */}
        <View style={{ alignItems: "center", marginTop: 10, marginBottom: 20 }}>
          <Avatar name={recipient} size={80} />
          <Text
            style={{
              marginTop: 12,
              color: Colors.ink[900],
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
            }}
          >
            {recipient}
          </Text>
          <Text
            style={{
              color: Colors.accent.green,
              fontFamily: "Inter_500Medium",
              fontSize: 13,
              marginTop: 4,
            }}
          >
            {recipientPhone}
          </Text>
          <Text
            style={{
              color: Colors.ink[400],
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {username}
          </Text>
        </View>

        {/* From */}
        <View style={styles.balanceCard}>
          <Text style={{ fontSize: 22, marginRight: 10 }}>🇺🇸</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
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
              style={{ color: Colors.brand.primary, fontFamily: "Inter_600SemiBold", fontSize: 13 }}
            >
              {t("common.change")}
            </Text>
          </Pressable>
        </View>

        {/* Message */}
        {note.length > 0 ? (
          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12 }}>
              {t("send.message")}
            </Text>
            <Text
              style={{
                color: Colors.ink[900],
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                marginTop: 4,
              }}
            >
              {note}
            </Text>
          </View>
        ) : null}

        {/* Transfer details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsHeader}>{t("send.transferDetails")}</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>{t("send.transferAmount")}</Text>
            <Text style={styles.detailsValue}>${amountDisplay}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>{t("send.transferFee")}</Text>
            <Text style={[styles.detailsValue, { color: Colors.accent.green }]}>
              {t("send.free")}
            </Text>
          </View>
          <View style={styles.detailsTotalRow}>
            <Text style={styles.detailsTotalLabel}>{t("common.total")}</Text>
            <Text style={styles.detailsTotalValue}>${amountDisplay}</Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 16 }}>
        <Button
          title={t("send.sentMoney")}
          onPress={() => {
            setResultCode(null);
            setPassword("");
            setPwModalOpen(true);
          }}
        />
      </View>

      {/* Password modal */}
      <Modal
        visible={pwModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => {
          if (!sendMutation.isPending) setPwModalOpen(false);
        }}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => {
            if (!sendMutation.isPending) setPwModalOpen(false);
          }}
        >
          <Pressable
            style={[styles.modalSheet, { paddingBottom: insets.bottom + 24 }]}
            onPress={(e) => e.stopPropagation()}
          >
            <KeyboardAwareScrollView contentContainerStyle={{ padding: 24 }}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Confirm with your password</Text>
              <Text style={styles.modalBody}>
                For your security, please enter your account password to send{" "}
                <Text style={{ fontFamily: "Inter_600SemiBold", color: Colors.ink[900] }}>
                  ${amountDisplay}
                </Text>{" "}
                to {recipient}.
              </Text>
              <View style={{ height: 16 }} />
              <Input
                label={t("auth.password")}
                placeholder="••••••••"
                isPassword
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (resultCode === "WALLET.INVALID_PASSWORD") setResultCode(null);
                }}
              />
              {resultCode === "WALLET.INVALID_PASSWORD" && (
                <Text style={styles.modalInlineError}>Password is incorrect. Try again.</Text>
              )}
              <View style={{ height: 18 }} />
              <Button
                title={sendMutation.isPending ? "Sending…" : "Send money"}
                disabled={password.length === 0 || sendMutation.isPending}
                onPress={onConfirmSend}
              />
              <View style={{ height: 10 }} />
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setPwModalOpen(false)}
                disabled={sendMutation.isPending}
              />
            </KeyboardAwareScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: Colors.surface.background,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  detailsCard: {
    backgroundColor: Colors.surface.background,
    borderRadius: 16,
    padding: 16,
  },
  detailsHeader: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailsLabel: { color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 },
  detailsValue: { color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 13 },
  detailsTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.ink[200],
  },
  detailsTotalLabel: { color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 },
  detailsTotalValue: { color: Colors.brand.primary, fontFamily: "Inter_700Bold", fontSize: 16 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHandle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ink[200],
    marginBottom: 16,
  },
  modalTitle: {
    color: Colors.ink[900],
    fontFamily: "Sora_700Bold",
    fontSize: 18,
    marginBottom: 8,
  },
  modalBody: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
  },
  modalInlineError: {
    marginTop: 8,
    color: Colors.accent.red,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
});
