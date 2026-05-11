import { useState } from "react";
import { View, Text, Pressable, ScrollView, RefreshControl } from "react-native";
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
  ];

  return (
    <Screen bg={Colors.surface.background}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
      >
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18, marginBottom: 18 }}>
          <Avatar name={user.fullName} size={44} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 16 }}>
              {t("home.greeting", { name: firstName })}
            </Text>
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
              {t("home.subgreeting")}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/notifications")}
            style={({ pressed }) => ({
              width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.white,
              alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1,
              shadowColor: "#101225", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2,
            })}
          >
            <Ionicons name="notifications-outline" size={18} color={Colors.brand.primary} />
            <View style={{ position: "absolute", top: 8, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent.red, borderWidth: 1.5, borderColor: Colors.white }} />
          </Pressable>
        </View>

        {/* ── USD Balance green pill selector ── */}
        <View style={{ paddingHorizontal: 18, marginBottom: 12 }}>
          <Pressable
            onPress={() => router.push("/(tabs)/accounts")}
            style={({ pressed }) => ({
              flexDirection: "row", alignItems: "center",
              alignSelf: "flex-start",
              backgroundColor: Colors.accent.greenSoft,
              borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent.green, marginRight: 8 }} />
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 13, marginRight: 6 }}>
              {activeCurrency} Balance
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors.ink[500]} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 18 }}>
          <BalanceCard
            amount={balances[activeCurrency]}
            currency={activeCurrency}
            iban={user.username}
            onGetQr={() => router.push("/qr-display")}
          />
        </View>

        {/* ── Services (4 tiles only) ── */}
        <View style={{ paddingHorizontal: 18, marginTop: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 15 }}>{t("home.services")}</Text>
            <Pressable onPress={() => router.push("/bills")} hitSlop={6}>
              <Text style={{ color: Colors.brand.primary, fontFamily: "Inter_500Medium", fontSize: 12 }}>{t("home.seeAll")}</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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

        {/* ── Manage Expenses ── */}
        <View style={{ paddingHorizontal: 18, marginTop: 26 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 15 }}>{t("home.manageExpenses")}</Text>
            <Pressable onPress={() => router.push("/(tabs)/expenses")} hitSlop={6}>
              <Text style={{ color: Colors.brand.primary, fontFamily: "Inter_500Medium", fontSize: 12 }}>{t("home.seeAll")}</Text>
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
