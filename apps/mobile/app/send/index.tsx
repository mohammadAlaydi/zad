import { useState } from "react";
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { AmountStepper } from "@/components/AmountStepper";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";
import { useHaptic } from "@/hooks/useHaptic";

type Tab = "mobile" | "username" | "visa";

export default function SendMoney() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const { balances, activeCurrency } = useApp();
  const [amount, setAmount] = useState(200);
  const [mobile, setMobile] = useState("");
  const [contactName, setContactName] = useState("");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [tab, setTab] = useState<Tab>("mobile");

  const canContinue = amount > 0 && (tab === "mobile" ? mobile.length > 6 : tab === "username" ? contactName.length > 0 : true);

  const tabs: { key: Tab; label: string; icon: React.ComponentProps<typeof Ionicons>["name"] }[] = [
    { key: "mobile", label: t("send.mobileNumber"), icon: "phone-portrait-outline" },
    { key: "username", label: t("receive.userName"), icon: "at-circle-outline" },
    { key: "visa", label: "Visa Direct", icon: "card-outline" },
  ];

  return (
    <Screen bg={Colors.white} keyboard>
      <Header title={t("send.title")} />
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Balance card */}
          <View style={styles.balanceCard}>
            <Text style={styles.flagEmoji}>🇺🇸</Text>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceName}>{activeCurrency} Balance</Text>
              <Text style={styles.balanceAvailable}>
                Available {balances[activeCurrency].toLocaleString()} $
              </Text>
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
                  onPress={() => { haptic.selection(); setTab(key); }}
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

          {/* Visa Direct panel */}
          {tab === "visa" ? (
            <MotiView
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 300 }}
              style={styles.visaPanel}
            >
              <View style={styles.visaCardGraphic}>
                <Text style={styles.visaCardGraphicWord}>VISA</Text>
              </View>
              <Text style={styles.visaPanelTitle}>Send to any Visa card</Text>
              <Text style={styles.visaPanelDesc}>
                Send directly to any Visa card worldwide. Fast, secure, and reliable. $1.50 fee applies per transfer.
              </Text>
              <Button
                title="Get Started"
                onPress={() => router.push("/send/visa-direct")}
                size="md"
              />
            </MotiView>
          ) : (
            <>
              <Text style={styles.howMuch}>{t("send.howMuch")}</Text>
              <AmountStepper value={amount} onChange={setAmount} />

              {/* Quick amounts */}
              <View style={styles.quickGrid}>
                {[100, 200, 300, 400, 500, 600, 700, 800].map((v) => {
                  const active = amount === v;
                  return (
                    <Pressable
                      key={v}
                      onPress={() => { haptic.selection(); setAmount(v); }}
                      style={[styles.quickChip, active ? styles.quickChipActive : null]}
                    >
                      <Text style={[styles.quickChipText, active ? styles.quickChipTextActive : null]}>
                        ${v}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.sendToLabel}>{t("send.sendTo")}</Text>
              <View style={styles.inputRow}>
                <View style={styles.flex1}>
                  <Input
                    placeholder={tab === "mobile" ? t("send.mobileNumber") : "@username"}
                    value={tab === "mobile" ? mobile : contactName}
                    onChangeText={tab === "mobile" ? setMobile : setContactName}
                    keyboardType={tab === "mobile" ? "phone-pad" : "default"}
                    leftIcon={<Ionicons name={tab === "mobile" ? "phone-portrait-outline" : "at-outline"} size={18} color={Colors.ink[400]} />}
                  />
                </View>
                <Pressable style={styles.contactBtn}>
                  <Ionicons name="person-add-outline" size={20} color={Colors.white} />
                </Pressable>
              </View>

              {tab === "mobile" && (
                <Input
                  placeholder={t("send.contactName")}
                  value={contactName}
                  onChangeText={setContactName}
                  containerStyle={styles.contactNameInput}
                />
              )}

              {!showMessage ? (
                <Pressable onPress={() => setShowMessage(true)} style={styles.addMessageBtn} hitSlop={6}>
                  <Ionicons name="add-circle" size={18} color={Colors.accent.green} />
                  <Text style={styles.addMessageText}>{t("send.addMessage")}</Text>
                </Pressable>
              ) : (
                <Input
                  placeholder={t("send.message")}
                  value={message}
                  onChangeText={setMessage}
                  leftIcon={<Ionicons name="chatbubble-outline" size={18} color={Colors.ink[400]} />}
                />
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {tab !== "visa" && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <Button
            title={t("common.continue")}
            disabled={!canContinue}
            onPress={() =>
              router.push({
                pathname: "/send/confirm",
                params: { amount: amount.toString(), mobile: mobile || "07701234567", contactName: contactName || "Demo User", message, tab },
              })
            }
          />
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
  inputRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  contactBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  contactNameInput: { marginTop: -6 },
  addMessageBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  addMessageText: { color: Colors.accent.green, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  bottomBar: { paddingHorizontal: 18 },
  // Visa panel
  visaPanel: {
    backgroundColor: Colors.surface.background,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginTop: 8,
  },
  visaCardGraphic: {
    width: 120,
    height: 72,
    backgroundColor: "#1A1F71",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#1A1F71",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  visaCardGraphicWord: {
    color: Colors.white,
    fontFamily: "Sora_700Bold",
    fontSize: 20,
    letterSpacing: 3,
    fontStyle: "italic",
  },
  visaPanelTitle: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  visaPanelDesc: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
});
