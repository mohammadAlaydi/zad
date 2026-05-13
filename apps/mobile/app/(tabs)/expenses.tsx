import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { TransactionRow } from "@/components/TransactionRow";
import { Input } from "@/components/Input";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

type Tab = "insights" | "transactions";
type Filter = "all" | "transfers" | "bills";

function groupTransactions(txs: ReturnType<typeof useApp.getState>["transactions"]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yest = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  const groups: Record<string, typeof txs> = {
    Today: [],
    Yesterday: [],
    "Last week": [],
    Earlier: [],
  };
  txs.forEach((tx) => {
    const d = new Date(tx.date);
    if (d >= today) groups["Today"].push(tx);
    else if (d >= yest) groups["Yesterday"].push(tx);
    else if (d >= weekAgo) groups["Last week"].push(tx);
    else groups["Earlier"].push(tx);
  });
  return groups;
}

const CATEGORY_META: Record<string, { color: string; icon: string }> = {
  "food":     { color: Colors.accent.amber,   icon: "fast-food-outline" },
  "bill":     { color: Colors.accent.red,     icon: "receipt-outline" },
  "sent":     { color: Colors.brand.primary,  icon: "paper-plane-outline" },
  "visa":     { color: "#1A1F71",             icon: "card-outline" },
  "received": { color: Colors.accent.green,   icon: "arrow-down-circle-outline" },
  "cash out": { color: Colors.accent.amber,   icon: "cash-outline" },
  "cash in":  { color: Colors.accent.green,   icon: "cash-outline" },
};

function getCategoryMeta(cat: string) {
  const lower = cat.toLowerCase();
  for (const [key, meta] of Object.entries(CATEGORY_META)) {
    if (lower.includes(key)) return meta;
  }
  return { color: Colors.brand.primaryLight, icon: "ellipse-outline" };
}

function CategoryBar({ pct, color, index }: { pct: number; color: string; index: number }) {
  return (
    <View style={s.barTrack}>
      <MotiView
        from={{ width: "0%" }}
        animate={{ width: `${Math.min(pct, 100)}%` as any }}
        transition={{ type: "timing", duration: 550, delay: 100 + index * 80 }}
        style={[s.barFill, { backgroundColor: color }]}
      />
    </View>
  );
}

function InsightsTab() {
  const { transactions } = useApp();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = transactions.filter((tx) => new Date(tx.date) >= monthStart);

  const totalSpent = thisMonth
    .filter((tx) => tx.amount < 0)
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
  const totalReceived = thisMonth
    .filter((tx) => tx.amount > 0)
    .reduce((acc, tx) => acc + tx.amount, 0);
  const netFlow = totalReceived - totalSpent;

  const categoryMap = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonth
      .filter((tx) => tx.amount < 0)
      .forEach((tx) => {
        map[tx.category] = (map[tx.category] ?? 0) + Math.abs(tx.amount);
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  const maxCat = categoryMap[0]?.[1] ?? 1;
  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.insightScroll}
    >
      {/* Summary gradient card */}
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ duration: 400 }}
      >
        <LinearGradient
          colors={[Colors.brand.gradientStart, Colors.brand.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.summaryCard}
        >
          <Text style={s.summaryMonth}>{monthName}</Text>
          <Text style={s.summaryLabel}>Total Spent</Text>
          <Text style={s.summaryAmount}>
            ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
          <View style={s.summaryRow}>
            <View style={s.summaryCol}>
              <View style={s.summaryIconRow}>
                <Ionicons name="arrow-up-circle-outline" size={13} color="rgba(255,255,255,0.65)" />
                <Text style={s.summaryColLabel}> Spent</Text>
              </View>
              <Text style={s.summaryColVal}>${totalSpent.toFixed(2)}</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryCol}>
              <View style={s.summaryIconRow}>
                <Ionicons name="arrow-down-circle-outline" size={13} color="rgba(255,255,255,0.65)" />
                <Text style={s.summaryColLabel}> Received</Text>
              </View>
              <Text style={s.summaryColVal}>${totalReceived.toFixed(2)}</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryCol}>
              <View style={s.summaryIconRow}>
                <Ionicons
                  name={netFlow >= 0 ? "trending-up-outline" : "trending-down-outline"}
                  size={13}
                  color="rgba(255,255,255,0.65)"
                />
                <Text style={s.summaryColLabel}> Net</Text>
              </View>
              <Text style={[s.summaryColVal, { color: netFlow >= 0 ? "#A8F5E0" : "#FFAFB7" }]}>
                {netFlow >= 0 ? "+" : ""}${netFlow.toFixed(2)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </MotiView>

      {/* Category breakdown */}
      {categoryMap.length > 0 ? (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200, duration: 380 }}
          style={s.categoryCard}
        >
          <Text style={s.categoryTitle}>Spending by Category</Text>
          {categoryMap.map(([cat, amount], i) => {
            const meta = getCategoryMeta(cat);
            const pct = (amount / maxCat) * 100;
            return (
              <View key={cat} style={s.categoryRow}>
                <View style={[s.categoryIcon, { backgroundColor: meta.color + "22" }]}>
                  <Ionicons name={meta.icon as any} size={16} color={meta.color} />
                </View>
                <View style={s.categoryInfo}>
                  <View style={s.categoryTopRow}>
                    <Text style={s.categoryName}>{cat}</Text>
                    <Text style={[s.categoryAmount, { color: meta.color }]}>
                      ${amount.toFixed(2)}
                    </Text>
                  </View>
                  <CategoryBar pct={pct} color={meta.color} index={i} />
                </View>
              </View>
            );
          })}
        </MotiView>
      ) : (
        <View style={s.emptyState}>
          <View style={s.emptyIcon}>
            <Ionicons name="bar-chart-outline" size={32} color={Colors.brand.primary} />
          </View>
          <Text style={s.emptyTitle}>No spending this month</Text>
          <Text style={s.emptySub}>Your category breakdown will appear here</Text>
        </View>
      )}
    </ScrollView>
  );
}

export default function Expenses() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { transactions } = useApp();
  const [tab, setTab] = useState<Tab>("insights");
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    let r = transactions;
    if (filter === "transfers") r = r.filter((t) => t.category.toLowerCase().includes("money"));
    if (filter === "bills") r = r.filter((t) => t.category.toLowerCase().includes("bill"));
    if (q.trim()) r = r.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));
    return r;
  }, [filter, q, transactions]);

  const groups = useMemo(() => groupTransactions(filtered), [filtered]);
  const hasResults = Object.values(groups).some((items) => items.length > 0);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <Screen bg={Colors.surface.background}>
      <Header
        title={t("expenses.title")}
        showBack={false}
        right={
          <Pressable onPress={onRefresh} hitSlop={8}>
            <Ionicons name="refresh" size={20} color={Colors.brand.primary} />
          </Pressable>
        }
      />

      {/* Tab toggle */}
      <View style={s.tabRow}>
        {(["insights", "transactions"] as Tab[]).map((key) => {
          const active = tab === key;
          return (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={[s.tabBtn, active && s.tabBtnActive]}
            >
              <Text style={[s.tabLabel, active && s.tabLabelActive]}>
                {key === "insights" ? "Insights" : "Transactions"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === "insights" ? (
        <InsightsTab />
      ) : (
        <>
          <View style={{ paddingHorizontal: 18 }}>
            <Input
              placeholder={t("common.search")}
              value={q}
              onChangeText={setQ}
              leftIcon={<Ionicons name="search" size={16} color={Colors.ink[400]} />}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 14 }}
            >
              {(
                [
                  ["all", t("expenses.all")],
                  ["transfers", t("expenses.transfers")],
                  ["bills", t("expenses.bills")],
                ] as const
              ).map(([key, label]) => {
                const active = key === filter;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setFilter(key as Filter)}
                    style={[s.chip, active && s.chipActive]}
                  >
                    <Text style={[s.chipLabel, active && s.chipLabelActive]}>{label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 110 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.brand.primary}
              />
            }
          >
            {hasResults ? (
              Object.entries(groups).map(([label, items]) =>
                items.length ? (
                  <View key={label} style={{ marginBottom: 8 }}>
                    <Text style={s.groupLabel}>{label}</Text>
                    {items.map((tx, i) => (
                      <MotiView
                        key={tx.id}
                        from={{ opacity: 0, translateX: -8 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        transition={{ delay: i * 40, duration: 280 }}
                      >
                        <TransactionRow tx={tx} />
                      </MotiView>
                    ))}
                  </View>
                ) : null,
              )
            ) : (
              <View style={s.emptyState}>
                <View style={s.emptyIcon}>
                  <Ionicons name="receipt-outline" size={30} color={Colors.brand.primary} />
                </View>
                <Text style={s.emptyTitle}>No transactions</Text>
                <Text style={s.emptySub}>Try a different filter or search term</Text>
              </View>
            )}
          </ScrollView>
        </>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 18,
    marginBottom: 16,
    backgroundColor: Colors.ink[100],
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.ink[900],
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.ink[500],
  },
  tabLabelActive: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.ink[900],
  },
  insightScroll: {
    paddingHorizontal: 18,
    paddingBottom: 120,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
  },
  summaryMonth: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 6,
  },
  summaryLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 4,
  },
  summaryAmount: {
    fontFamily: "Sora_700Bold",
    fontSize: 34,
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryCol: {
    flex: 1,
  },
  summaryIconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  summaryColLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
  },
  summaryColVal: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.white,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 12,
  },
  categoryCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  categoryTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[900],
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryName: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.ink[800],
  },
  categoryAmount: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  barTrack: {
    height: 6,
    backgroundColor: Colors.ink[100],
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.ink[200],
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  chipLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.ink[700],
  },
  chipLabelActive: {
    color: Colors.white,
  },
  groupLabel: {
    color: Colors.ink[500],
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginBottom: 8,
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginBottom: 4,
  },
  emptySub: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
  },
});
