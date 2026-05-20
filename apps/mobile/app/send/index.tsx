import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AmountStepper } from "@/components/AmountStepper";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { PhoneInput } from "@/components/PhoneInput";
import { Screen } from "@/components/Screen";
import { COUNTRIES } from "@/data/countries";
import {
  useAccountBalance,
  useMyAccounts,
  useRecipientLookup,
  useSendFlow,
} from "@/features/wallet";
import { useHaptic } from "@/hooks/useHaptic";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

type Tab = "mobile" | "username" | "visa";

export default function SendMoney() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const { activeCurrency } = useApp();
  const accounts = useMyAccounts();
  const account = accounts.data?.accounts.find((a) => a.currency === activeCurrency);
  const balanceQuery = useAccountBalance(account?.id);
  const balance =
    balanceQuery.data === undefined ? 0 : Number(BigInt(balanceQuery.data.balance.amount)) / 100;
  const [amount, setAmount] = useState(20);
  // Default to Iraq for the dev/test scenario — adjust later via picker.
  const [country, setCountry] = useState(COUNTRIES[3]);
  // Local digits only; the country dial code is composed at send time.
  const [phoneDigits, setPhoneDigits] = useState("");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [tab, setTab] = useState<Tab>("mobile");

  const setRecipient = useSendFlow((s) => s.setRecipient);
  const setAmountMinor = useSendFlow((s) => s.setAmountMinor);
  const setNote = useSendFlow((s) => s.setNote);
  const resetIdempotencyKey = useSendFlow((s) => s.resetIdempotencyKey);

  // Permissive in dev: send whatever digits the user typed. The country
  // picker stays as a visual hint but doesn't transform the value, so the
  // string sent here matches what was stored at signup byte-for-byte.
  const normalizedPhone = useMemo(
    () => (phoneDigits.trim().length > 0 ? phoneDigits.trim() : null),
    [phoneDigits],
  );
  const lookup = useRecipientLookup(tab === "mobile" ? normalizedPhone : null);

  // Push the resolved recipient (or null) into the flow store so /send/confirm
  // can read it without re-querying.
  useEffect(() => {
    if (tab !== "mobile") return;
    if (lookup.data === undefined) {
      setRecipient(null);
      return;
    }
    setRecipient({
      phone: lookup.data.phone,
      name: lookup.data.fullName,
      userId: lookup.data.userId,
      currency: lookup.data.currency,
    });
  }, [tab, lookup.data, setRecipient]);

  const lookupErrorCode =
    lookup.error !== null && lookup.error !== undefined ? lookup.error.code : null;

  const canContinue =
    tab === "mobile" ? amount > 0 && lookup.data !== undefined && !lookup.isFetching : false;

  const tabs: { key: Tab; label: string; icon: React.ComponentProps<typeof Ionicons>["name"] }[] = [
    { key: "mobile", label: t("send.mobileNumber"), icon: "phone-portrait-outline" },
    { key: "username", label: t("receive.userName"), icon: "at-circle-outline" },
    { key: "visa", label: "Visa Direct", icon: "card-outline" },
  ];

  function onContinue() {
    if (lookup.data === undefined || normalizedPhone === null) return;
    setAmountMinor(Math.round(amount * 100));
    setNote(message);
    // Fresh idempotency key when the user starts a new send intent.
    resetIdempotencyKey();
    router.push("/send/confirm");
  }

  return (
    <Screen bg={Colors.white} keyboard>
      <Header title={t("send.title")} />
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Balance card */}
          <View style={styles.balanceCard}>
            <Text style={styles.flagEmoji}>🇺🇸</Text>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceName}>{activeCurrency} Balance</Text>
              <Text style={styles.balanceAvailable}>Available {balance.toLocaleString()} $</Text>
            </View>
            <Pressable onPress={() => router.push("/(tabs)/accounts")} hitSlop={8}>
              <Text style={styles.changeLink}>{t("common.change")}</Text>
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={styles.tabRow}>
            {tabs.map(({ key, label, icon }) => {
              const active = key === tab;
              return (
                <Pressable
                  key={key}
                  onPress={() => {
                    haptic.selection();
                    setTab(key);
                  }}
                  style={styles.tabItem}
                >
                  <View style={styles.tabInner}>
                    <Ionicons
                      name={icon}
                      size={16}
                      color={active ? Colors.brand.primary : Colors.ink[400]}
                    />
                    <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>
                      {label}
                    </Text>
                  </View>
                  {active ? (
                    <MotiView
                      from={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ type: "timing", duration: 250 }}
                      style={styles.tabIndicator}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {/* Mobile-number tab is the only wired flow on this branch. */}
          {tab !== "mobile" ? (
            <View style={styles.comingSoon}>
              <Ionicons name="construct-outline" size={24} color={Colors.ink[400]} />
              <Text style={styles.comingSoonText}>This flow is coming soon.</Text>
              <Text style={styles.comingSoonSub}>
                For now, send money using the recipient&apos;s phone number.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.howMuch}>{t("send.howMuch")}</Text>
              <AmountStepper value={amount} onChange={setAmount} />

              {/* Quick amounts */}
              <View style={styles.quickGrid}>
                {[5, 10, 20, 50, 100, 200, 500, 1000].map((v) => {
                  const active = amount === v;
                  return (
                    <Pressable
                      key={v}
                      onPress={() => {
                        haptic.selection();
                        setAmount(v);
                      }}
                      style={[styles.quickChip, active ? styles.quickChipActive : null]}
                    >
                      <Text
                        style={[styles.quickChipText, active ? styles.quickChipTextActive : null]}
                      >
                        ${v}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.sendToLabel}>Recipient phone</Text>
              <PhoneInput
                country={country}
                onCountryChange={setCountry}
                value={phoneDigits}
                onChangeText={setPhoneDigits}
                placeholder="Mobile number"
              />
              {/* Recipient preview / lookup status */}
              {tab === "mobile" && (
                <View style={{ marginTop: 8 }}>
                  {normalizedPhone === null && phoneDigits.length > 0 ? (
                    <Text style={styles.lookupHint}>Enter a valid mobile number.</Text>
                  ) : null}
                  {lookup.isFetching ? (
                    <Text style={styles.lookupHint}>Looking up recipient…</Text>
                  ) : null}
                  {lookup.data !== undefined ? (
                    <View style={styles.recipientPreview}>
                      <View style={styles.recipientAvatar}>
                        <Text style={styles.recipientAvatarText}>
                          {lookup.data.fullName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recipientName}>{lookup.data.fullName}</Text>
                        <Text style={styles.recipientPhone}>{lookup.data.phone}</Text>
                      </View>
                      <Ionicons name="checkmark-circle" size={22} color={Colors.accent.green} />
                    </View>
                  ) : null}
                  {lookupErrorCode === "IDENTITY.RECIPIENT_NOT_FOUND" ? (
                    <View style={styles.recipientMissing}>
                      <Ionicons name="alert-circle-outline" size={18} color={Colors.accent.red} />
                      <Text style={styles.recipientMissingText}>
                        No ZADPAY user found with this number.
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}

              {!showMessage ? (
                <Pressable
                  onPress={() => setShowMessage(true)}
                  style={styles.addMessageBtn}
                  hitSlop={6}
                >
                  <Ionicons name="add-circle" size={18} color={Colors.accent.green} />
                  <Text style={styles.addMessageText}>{t("send.addMessage")}</Text>
                </Pressable>
              ) : (
                <Input
                  placeholder={t("send.message")}
                  value={message}
                  onChangeText={setMessage}
                  leftIcon={
                    <Ionicons name="chatbubble-outline" size={18} color={Colors.ink[400]} />
                  }
                />
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {tab === "mobile" && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <Button title={t("common.continue")} disabled={!canContinue} onPress={onContinue} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  scrollContent: { paddingHorizontal: 18 },
  balanceCard: {
    backgroundColor: Colors.surface.background,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  flagEmoji: { fontSize: 28, marginRight: 10 },
  balanceInfo: { flex: 1 },
  balanceName: { color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 },
  balanceAvailable: { color: Colors.accent.green, fontFamily: "Inter_500Medium", fontSize: 12 },
  changeLink: { color: Colors.brand.primary, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  tabRow: {
    flexDirection: "row",
    marginBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink[100],
  },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabInner: { flexDirection: "row", alignItems: "center", gap: 6 },
  tabLabel: { color: Colors.ink[400], fontFamily: "Inter_400Regular", fontSize: 12 },
  tabLabelActive: { color: Colors.brand.primary, fontFamily: "Inter_600SemiBold" },
  tabIndicator: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.brand.primary,
  },
  howMuch: {
    textAlign: "center",
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginBottom: 14,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
    justifyContent: "center",
  },
  quickChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
  },
  quickChipActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  quickChipText: { color: Colors.ink[700], fontFamily: "Inter_600SemiBold", fontSize: 13 },
  quickChipTextActive: { color: Colors.white },
  sendToLabel: {
    color: Colors.ink[700],
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginTop: 24,
    marginBottom: 8,
  },
  lookupHint: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  recipientPreview: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface.background,
    borderRadius: 14,
    padding: 12,
  },
  recipientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  recipientAvatarText: {
    color: Colors.white,
    fontFamily: "Sora_700Bold",
    fontSize: 16,
  },
  recipientName: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  recipientPhone: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  recipientMissing: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FBEAEC",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  recipientMissingText: {
    color: Colors.accent.red,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    flex: 1,
  },
  addMessageBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14 },
  addMessageText: { color: Colors.accent.green, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  bottomBar: { paddingHorizontal: 18 },
  comingSoon: {
    backgroundColor: Colors.surface.background,
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  comingSoonText: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginTop: 4,
  },
  comingSoonSub: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
  },
});
