import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView, Pressable, RefreshControl, Modal, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { CURRENCY_FLAGS } from "@/constants/currencyFlags";
import { useAccountBalance, useMyAccounts } from "@/features/wallet";
import { queryClient } from "@/lib/api/queryClient";
import { useApp, type Currency } from "@/store/appStore";
import { Colors } from "@/theme/colors";

// Per-row balance loader — accounts tab shows several, each needs its own
// query (balance is fetched by accountId, not in bulk).
function useAccountRowBalance(accountId: string) {
  const q = useAccountBalance(accountId);
  return q.data === undefined ? 0 : Number(BigInt(q.data.balance.amount)) / 100;
}

function AccountRow({
  accountId,
  currency,
  name,
  active,
  onPress,
  index,
  onTotal,
}: {
  accountId: string;
  currency: Currency;
  name: string;
  active: boolean;
  onPress: () => void;
  index: number;
  // The total row needs to sum live balances, so each row reports its
  // current major-units balance back up via this callback.
  onTotal: (id: string, amount: number) => void;
}) {
  const bal = useAccountRowBalance(accountId);
  // Push the latest balance up on every render — cheap, parent dedupes.
  onTotal(accountId, bal);
  const symbol = currency === "USD" ? "$" : currency;
  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 80, duration: 350 }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          borderRadius: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: active ? Colors.brand.primary : Colors.ink[100],
          backgroundColor: Colors.white,
          opacity: pressed ? 0.85 : 1,
          shadowColor: "#101225",
          shadowOpacity: 0.03,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: active ? 2 : 1,
        })}
      >
        <View style={{ flexDirection: "row", alignItems: "center", padding: 14 }}>
          <Text style={{ fontSize: 26, marginRight: 12 }}>{CURRENCY_FLAGS[currency] ?? "💵"}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 15 }}>
              {name}
            </Text>
            <Text
              style={{
                color: Colors.accent.green,
                fontFamily: "Inter_500Medium",
                fontSize: 12,
                marginTop: 2,
              }}
            >
              Available {bal.toLocaleString()} {symbol}
            </Text>
          </View>
          <Text
            style={{
              color: Colors.accent.green,
              fontFamily: "Inter_600SemiBold",
              fontSize: 15,
              marginRight: 8,
            }}
          >
            {bal.toLocaleString()} {symbol}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.ink[300]} />
        </View>
      </Pressable>
    </MotiView>
  );
}

export default function Accounts() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { activeCurrency, setActiveCurrency } = useApp();
  const accounts = useMyAccounts();
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [perRowTotals, setPerRowTotals] = useState<Record<string, number>>({});

  const myAccounts = useMemo(
    () => (accounts.data?.accounts ?? []).filter((a) => a.type === "wallet"),
    [accounts.data],
  );

  const total = useMemo(
    () => Object.values(perRowTotals).reduce((a, b) => a + b, 0),
    [perRowTotals],
  );

  const addableRows = [
    { code: "AUD" as Currency, name: t("accounts.aud") },
    { code: "CAD" as Currency, name: t("accounts.cad") },
  ];

  const reportRowTotal = (id: string, amount: number) => {
    setPerRowTotals((prev) => (prev[id] === amount ? prev : { ...prev, [id]: amount }));
  };

  const onRefresh = () => {
    setRefreshing(true);
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ["wallet", "accounts"] }),
      queryClient.invalidateQueries({ queryKey: ["wallet", "balance"] }),
    ]).finally(() => setRefreshing(false));
  };

  return (
    <Screen bg={Colors.white}>
      <Header
        title={t("accounts.title")}
        showBack={false}
        right={
          <Pressable onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color={Colors.brand.primary} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 160 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.brand.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Accounts Details</Text>
        <Text style={styles.subtext}>{t("accounts.addCurrency")}</Text>

        {/* Active currency rows — pulled from /v1/wallet/accounts */}
        {myAccounts.length === 0 ? (
          <Text
            style={{
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              paddingVertical: 24,
              textAlign: "center",
            }}
          >
            {accounts.isLoading ? "Loading accounts…" : "No wallet accounts yet."}
          </Text>
        ) : (
          myAccounts.map((a, i) => (
            <AccountRow
              key={a.id}
              accountId={a.id}
              currency={a.currency as Currency}
              name={a.currency === "USD" ? "US Dollar" : a.currency}
              active={a.currency === activeCurrency}
              onPress={() => setActiveCurrency(a.currency as Currency)}
              index={i}
              onTotal={reportRowTotal}
            />
          ))
        )}

        {/* All accounts summary row */}
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 200 }}>
          <View style={styles.totalCard}>
            <View style={styles.totalIcon}>
              <Ionicons name="cash" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.totalInfo}>
              <Text style={styles.totalLabel}>{t("accounts.allAccounts")}</Text>
              <Text style={styles.totalSub}>
                {myAccounts.length} account{myAccounts.length === 1 ? "" : "s"}
              </Text>
            </View>
            <Text style={styles.totalAmount}>{total.toLocaleString()} $</Text>
          </View>
        </MotiView>

        <Text style={styles.addTitle}>Add new currency</Text>
        {addableRows.map((r, i) => (
          <View
            key={`${r.code}-${i}`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: Colors.white,
              borderRadius: 14,
              padding: 12,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: Colors.ink[100],
            }}
          >
            <Text style={{ fontSize: 22, marginRight: 12 }}>{CURRENCY_FLAGS[r.code]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.ink[900], fontFamily: "Inter_500Medium", fontSize: 14 }}>
                {r.name}
              </Text>
              <Text
                style={{ color: Colors.accent.green, fontFamily: "Inter_400Regular", fontSize: 11 }}
              >
                {r.code}
              </Text>
            </View>
            <Pressable onPress={() => setShowAdd(true)} style={styles.addBtn}>
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.bottomBar, { bottom: insets.bottom + 90 }]}>
        <Button title="+ Add New" onPress={() => setShowAdd(true)} />
      </View>

      {/* Modal */}
      <Modal
        visible={showAdd}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAdd(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowAdd(false)} />
        <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 22 }]}>
          <View style={styles.handle} />
          <Text style={styles.modalTitle}>Coming soon</Text>
          <Text style={styles.modalText}>
            Adding new currencies will be available in the next release.
          </Text>
          <Button title="Got it" onPress={() => setShowAdd(false)} />
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 18 },
  heading: {
    color: Colors.brand.primary,
    fontFamily: "Sora_700Bold",
    fontSize: 20,
    marginTop: 4,
    marginBottom: 6,
  },
  subtext: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginBottom: 16,
  },
  // Account rows
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  flagLarge: {
    fontSize: 28,
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  accountBalance: {
    color: Colors.accent.green,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  // Total card
  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.brand.primary50,
    borderRadius: 16,
    padding: 14,
    marginBottom: 22,
  },
  totalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  totalInfo: {
    flex: 1,
  },
  totalLabel: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  totalSub: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  totalAmount: {
    color: Colors.accent.green,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  // Addable rows
  addTitle: {
    color: Colors.ink[700],
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 12,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.ink[100],
  },
  flagSmall: {
    fontSize: 24,
    marginRight: 12,
  },
  addInfo: {
    flex: 1,
  },
  addName: {
    color: Colors.ink[900],
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  addCode: {
    color: Colors.ink[400],
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: Colors.brand.primary50,
  },
  addBtnText: {
    color: Colors.brand.primary,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  // Bottom / Modal
  bottomBar: {
    position: "absolute",
    left: 24,
    right: 24,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 14,
    paddingHorizontal: 22,
  },
  handle: {
    width: 44,
    height: 4,
    backgroundColor: Colors.ink[200],
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.ink[900],
    marginBottom: 4,
  },
  modalText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.ink[500],
    marginBottom: 20,
  },
});
