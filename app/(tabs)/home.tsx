import { useState } from "react";
import { View, Text, Pressable, ScrollView, RefreshControl, StyleSheet, StatusBar, Modal } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { BalanceCard } from "@/components/BalanceCard";
import { ServiceTile } from "@/components/ServiceTile";
import { TransactionRow } from "@/components/TransactionRow";
import { Avatar } from "@/components/Avatar";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

export default function Home() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user, balances, activeCurrency, transactions, setActiveCurrency } = useApp();
  const firstName = (user.fullName ?? "").split(" ")[0];
  const [refreshing, setRefreshing] = useState(false);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const services = [
    { key: "topUp", icon: <FontAwesome5 name="wallet" size={20} color={Colors.brand.primary} solid />, route: "/topup", highlight: false },
    { key: "send", icon: <Ionicons name="paper-plane" size={20} color={Colors.brand.primary} />, route: "/send", highlight: false },
    { key: "receive", icon: <MaterialCommunityIcons name="cash-multiple" size={20} color={Colors.brand.primary} />, route: "/receive", highlight: false },
    { key: "qrScan", icon: <MaterialCommunityIcons name="qrcode-scan" size={20} color={Colors.brand.primary} />, route: "/qr", highlight: false },
  ];

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface.background} translucent />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
      >
        {/* Header row: avatar + greeting + notification */}
        <View style={styles.headerRow}>
          <Avatar name={user.fullName} size={44} />
          <View style={styles.greetingWrap}>
            <Text style={styles.greetingName}>
              {t("home.greeting", { name: firstName })}
            </Text>
            <Text style={styles.greetingSub}>{t("home.subgreeting")}</Text>
          </View>
          <Pressable
            onPress={() => router.push("/notifications")}
            style={styles.notifBtn}
          >
            <Ionicons name="notifications-outline" size={18} color={Colors.brand.primary} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>

        {/* ── Currency pill + Balance Card ── */}
        <View style={styles.balanceSection}>
          <Pressable
            onPress={() => setCurrencyModalOpen(true)}
            style={({ pressed }) => [styles.currencyPill, pressed && { opacity: 0.7 }]}
          >
            <View style={styles.currencyPillLeft}>
              <Ionicons name="wallet-outline" size={16} color={Colors.accent.green} />
              <Text style={styles.currencyPillText}>{activeCurrency} Balance</Text>
            </View>
          </Pressable>

          <BalanceCard
            amount={balances[activeCurrency]}
            currency={activeCurrency}
            iban={user.username}
            onGetQr={() => router.push("/qr-display")}
          />
        </View>

        {/* Currency Selection Modal */}
        <Modal visible={currencyModalOpen} transparent animationType="fade" onRequestClose={() => setCurrencyModalOpen(false)}>
          <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center", paddingHorizontal: 40 }} onPress={() => setCurrencyModalOpen(false)}>
            <View style={{ width: "100%", backgroundColor: Colors.white, borderRadius: 16, paddingVertical: 20, paddingHorizontal: 16 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.ink[900], marginBottom: 16, textAlign: "center" }}>Select Currency</Text>
              {["USD", "AED", "CAD", "AUD"].map((c) => {
                const isActive = c === activeCurrency;
                return (
                  <Pressable
                    key={c}
                    onPress={() => { setActiveCurrency(c as any); setCurrencyModalOpen(false); }}
                    style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 6, backgroundColor: isActive ? Colors.brand.primary50 : "transparent" }}
                  >
                    <Text style={{ fontSize: 22 }}>
                      {c === "USD" ? "🇺🇸" : c === "AED" ? "🇦🇪" : c === "CAD" ? "🇨🇦" : c === "AUD" ? "🇦🇺" : "💵"}
                    </Text>
                    <Text style={{ fontFamily: isActive ? "Inter_600SemiBold" : "Inter_500Medium", fontSize: 15, color: isActive ? Colors.brand.primary : Colors.ink[700] }}>
                      {c}
                    </Text>
                    {isActive && <Ionicons name="checkmark-circle" size={20} color={Colors.brand.primary} style={{ marginLeft: "auto" }} />}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Modal>

        {/* ── Services (4 tiles only) ── */}
        <View style={{ paddingHorizontal: 18, marginTop: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 15 }}>{t("home.services")}</Text>
            <Pressable onPress={() => router.push("/bills")} hitSlop={6}>
              <Text style={styles.seeAll}>{t("home.seeAll")}</Text>
            </Pressable>
          </View>
          <View style={styles.servicesRow}>
            {services.map((s, i) => (
              <ServiceTile
                key={s.key}
                label={t(`home.${s.key}` as any)}
                icon={s.icon}
                highlight={s.highlight}
                index={i}
                onPress={() => router.push(s.route as any)}
              />
            ))}
          </View>
        </View>

        {/* ── Financial Tools ── */}
        <View style={{ marginTop: 26 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, marginBottom: 14 }}>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 15 }}>Financial Tools</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolsScroll}
          >
            {([
              { label: "Visa Direct", icon: "send",              color: "#5B2C9C", bg: "#F4EFFA", route: "/send/visa-direct" },
              { label: "Agent Cash",  icon: "cash",              color: "#1FCFA5", bg: "#D7F7EE", route: "/agent" },
              { label: "BNPL",        icon: "layers",            color: "#E25563", bg: "#FBE3E5", route: "/bnpl" },
              { label: "My Cards",    icon: "card",              color: "#5B2C9C", bg: "#F4EFFA", route: "/cards/issue" },
              { label: "Savings",     icon: "leaf",              color: "#1FCFA5", bg: "#D7F7EE", route: "/savings" },
              { label: "Goals",       icon: "trophy",            color: "#F2B441", bg: "#FDF6DD", route: "/goals" },
              { label: "Scheduled",   icon: "calendar",          color: "#8159C2", bg: "#EDE5F8", route: "/scheduled" },
              { label: "Vouchers",    icon: "gift",              color: "#E25563", bg: "#FBE3E5", route: "/vouchers" },
              { label: "Loyalty",     icon: "star",              color: "#F2B441", bg: "#FDF6DD", route: "/loyalty" },
              { label: "Invest",      icon: "trending-up",       color: "#1FCFA5", bg: "#D7F7EE", route: "/invest" },
              { label: "Crypto",      icon: "logo-bitcoin",      color: "#F2B441", bg: "#FDF6DD", route: "/crypto" },
              { label: "Bills",       icon: "receipt",           color: "#5B2C9C", bg: "#F4EFFA", route: "/bills" },
            ] as const).map((item, i) => (
              <MotiView
                key={item.label}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: i * 40, type: "timing", duration: 280 }}
              >
                <Pressable
                  onPress={() => router.push(item.route as any)}
                  style={({ pressed }) => [styles.toolTile, { opacity: pressed ? 0.72 : 1 }]}
                >
                  <View style={[styles.toolIconBox, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                  </View>
                  <Text style={styles.toolLabel}>{item.label}</Text>
                </Pressable>
              </MotiView>
            ))}
          </ScrollView>
        </View>

        {/* ── Manage Expenses ── */}
        <View style={{ paddingHorizontal: 18, marginTop: 26 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 15 }}>{t("home.manageExpenses")}</Text>
            <Pressable onPress={() => router.push("/(tabs)/expenses")} hitSlop={6}>
              <Text style={styles.seeAll}>{t("home.seeAll")}</Text>
            </Pressable>
          </View>
          {transactions.slice(0, 5).map((tx, i) => (
            <MotiView
              key={tx.id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 200 + i * 60, duration: 380 }}
            >
              <TransactionRow tx={tx} />
            </MotiView>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 18,
  },
  greetingWrap: {
    flex: 1,
    marginLeft: 12,
  },
  greetingName: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  greetingSub: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#101225",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent.red,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  // Balance section
  balanceSection: {
    marginHorizontal: 18,
    marginBottom: 12,
  },
  currencyPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.accent.greenSoft,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    marginBottom: 10,
  },
  currencyPillLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currencyPillText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.ink[800],
  },
  // Currency selector
  sectionPad: {
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  currencyFlag: {
    fontSize: 18,
    marginRight: 8,
  },
  currencyLabel: {
    flex: 1,
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  // Services
  servicesSection: {
    paddingHorizontal: 18,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  seeAll: {
    color: Colors.brand.primary,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  servicesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toolsScroll: {
    paddingHorizontal: 18,
    gap: 12,
    paddingBottom: 4,
  },
  toolTile: {
    alignItems: "center",
    width: 68,
  },
  toolIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: Colors.ink[900],
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  toolLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: Colors.ink[700],
    textAlign: "center",
  },
  whatsappRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },
  whatsappTile: {
    width: 70,
    alignItems: "center",
  },
  moreWrap: {
    flex: 1,
    alignItems: "flex-start",
    paddingLeft: 18,
  },
  moreText: {
    color: Colors.accent.green,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  // Transactions
  transactionsSection: {
    paddingHorizontal: 18,
    marginTop: 26,
  },
});
