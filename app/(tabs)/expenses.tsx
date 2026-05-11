import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { TransactionRow } from "@/components/TransactionRow";
import { Input } from "@/components/Input";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

type Filter = "all" | "transfers" | "bills";

function groupTransactions(txs: ReturnType<typeof useApp.getState>["transactions"]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yest = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  const groups: Record<string, typeof txs> = { Today: [], Yesterday: [], "Last week": [], Earlier: [] };
  txs.forEach((tx) => {
    const d = new Date(tx.date);
    if (d >= today) groups["Today"].push(tx);
    else if (d >= yest) groups["Yesterday"].push(tx);
    else if (d >= weekAgo) groups["Last week"].push(tx);
    else groups["Earlier"].push(tx);
  });
  return groups;
}

export default function Expenses() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { transactions } = useApp();
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

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const hasResults = Object.values(groups).some((items) => items.length > 0);

  return (
    <Screen bg={Colors.white}>
      <Header
        title={t("expenses.title")}
        showBack={false}
        right={
          <Pressable onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color={Colors.brand.primary} />
          </Pressable>
        }
      />
      <View style={{ paddingHorizontal: 18 }}>
        <Input
          placeholder={t("common.search")}
          value={q}
          onChangeText={setQ}
          leftIcon={<Ionicons name="search" size={16} color={Colors.ink[400]} />}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
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
                style={{
                  paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999,
                  backgroundColor: active ? Colors.brand.primary : "transparent",
                  borderWidth: 1, borderColor: active ? Colors.brand.primary : Colors.ink[200],
                  marginRight: 8,
                  shadowColor: active ? Colors.brand.primary : "transparent",
                  shadowOpacity: active ? 0.25 : 0, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
                }}
              >
                <Text style={{ color: active ? "#FFFFFF" : Colors.ink[700], fontFamily: "Inter_500Medium", fontSize: 13 }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
      >
        {hasResults ? (
          Object.entries(groups).map(([label, items]) =>
            items.length ? (
              <View key={label} style={{ marginBottom: 8 }}>
                <Text style={{ color: Colors.ink[500], fontFamily: "Inter_500Medium", fontSize: 12, marginBottom: 8 }}>
                  {label}
                </Text>
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
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <View style={{
              width: 70, height: 70, borderRadius: 35, backgroundColor: Colors.brand.primary50,
              alignItems: "center", justifyContent: "center", marginBottom: 14,
            }}>
              <Ionicons name="receipt-outline" size={30} color={Colors.brand.primary} />
            </View>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 16 }}>No transactions</Text>
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 }}>
              Try a different filter or search term
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
