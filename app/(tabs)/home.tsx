import { useState } from "react";
import { View, Text, Pressable, ScrollView, RefreshControl, StyleSheet, StatusBar } from "react-native";
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

const CURRENCY_FLAGS: Record<string, string> = { USD: "🇺🇸", AED: "🇦🇪", CAD: "🇨🇦", AUD: "🇦🇺" };

export default function Home() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user, balances, activeCurrency, transactions } = useApp();
  const firstName = (user.fullName ?? "").split(" ")[0];
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const services = [
    { key: "topUp", icon: <FontAwesome5 name="wallet" size={20} color={Colors.brand.primary} solid />, route: "/topup", highlight: false },
    { key: "send", icon: <Ionicons name="paper-plane" size={20} color={Colors.brand.primary} />, route: "/send", highlight: false },
    { key: "receive", icon: <MaterialCommunityIcons name="cash-multiple" size={20} color={Colors.brand.primary} />, route: "/receive", highlight: false },
    { key: "qrScan", icon: <MaterialCommunityIcons name="qrcode-scan" size={20} color={Colors.brand.primary} />, route: "/qr", highlight: false },
    { key: "bills", icon: <Ionicons name="receipt" size={20} color="#FFFFFF" />, route: "/bills", highlight: true },
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

        {/* Currency selector */}
        <View style={styles.sectionPad}>
          <Pressable
            onPress={() => router.push("/(tabs)/accounts")}
            style={styles.currencySelector}
          >
            <Text style={styles.currencyFlag}>{CURRENCY_FLAGS[activeCurrency] ?? "🌐"}</Text>
            <Text style={styles.currencyLabel}>{activeCurrency} Balance</Text>
            <Ionicons name="chevron-down" size={18} color={Colors.ink[500]} />
          </Pressable>
        </View>

        {/* Balance card */}
        <View style={styles.sectionPad}>
          <BalanceCard
            amount={balances[activeCurrency]}
            currency={activeCurrency}
            iban={user.username}
            onGetQr={() => router.push("/qr-display")}
          />
        </View>

        {/* Services */}
        <View style={styles.servicesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("home.services")}</Text>
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

          <View style={styles.whatsappRow}>
            <View style={styles.whatsappTile}>
              <ServiceTile
                label={t("home.whatsapp")}
                icon={<Ionicons name="logo-whatsapp" size={22} color="#25D366" />}
                index={5}
                onPress={() => router.push("/send")}
              />
            </View>
            <View style={styles.moreWrap}>
              <Text style={styles.moreText}>{t("home.more")}</Text>
            </View>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("home.manageExpenses")}</Text>
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
