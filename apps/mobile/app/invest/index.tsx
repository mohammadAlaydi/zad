import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MotiView } from "moti";
import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useUserItems } from "@/features/userdata";
import type { StockHolding } from "@/store/appStore";
import { Colors } from "@/theme/colors";

type StockPayload = Omit<StockHolding, "id">;

const STOCKS = [
  {
    ticker: "AAPL",
    companyName: "Apple Inc.",
    currentPrice: 182.5,
    sector: "Technology",
    emoji: "🍎",
    change: +1.8,
  },
  {
    ticker: "MSFT",
    companyName: "Microsoft Corp.",
    currentPrice: 325.0,
    sector: "Technology",
    emoji: "🪟",
    change: +0.9,
  },
  {
    ticker: "TSLA",
    companyName: "Tesla Inc.",
    currentPrice: 198.0,
    sector: "Automotive",
    emoji: "🚗",
    change: -2.1,
  },
  {
    ticker: "AMZN",
    companyName: "Amazon.com Inc.",
    currentPrice: 178.0,
    sector: "E-Commerce",
    emoji: "📦",
    change: +0.5,
  },
  {
    ticker: "GOOGL",
    companyName: "Alphabet Inc.",
    currentPrice: 172.0,
    sector: "Technology",
    emoji: "🔍",
    change: +1.2,
  },
  {
    ticker: "META",
    companyName: "Meta Platforms",
    currentPrice: 512.0,
    sector: "Social Media",
    emoji: "👤",
    change: +2.3,
  },
];

type Tab = "market" | "portfolio";

export default function InvestScreen() {
  const insets = useSafeAreaInsets();
  const stocksQuery = useUserItems<StockPayload>("stocks");
  const stockHoldings: StockHolding[] = (stocksQuery.data?.items ?? []).map((it) => ({
    ...it.payload,
    id: it.id,
  }));
  const [activeTab, setActiveTab] = useState<Tab>("market");
  const [search, setSearch] = useState("");

  const filteredStocks = useMemo(() => {
    if (!search.trim()) return STOCKS;
    const q = search.toLowerCase();
    return STOCKS.filter(
      (s) => s.ticker.toLowerCase().includes(q) || s.companyName.toLowerCase().includes(q),
    );
  }, [search]);

  const portfolioValue = useMemo(() => {
    return stockHoldings.reduce((acc, h) => {
      const stock = STOCKS.find((s) => s.ticker === h.ticker);
      const price = stock ? stock.currentPrice : h.currentPrice;
      return acc + h.shares * price;
    }, 0);
  }, [stockHoldings]);

  return (
    <Screen bg={Colors.surface.background}>
      <Header title="Invest" showBack />

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, activeTab === "market" && styles.tabActive]}
          onPress={() => setActiveTab("market")}
        >
          <Text style={[styles.tabText, activeTab === "market" && styles.tabTextActive]}>
            Market
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "portfolio" && styles.tabActive]}
          onPress={() => setActiveTab("portfolio")}
        >
          <Text style={[styles.tabText, activeTab === "portfolio" && styles.tabTextActive]}>
            Portfolio
          </Text>
        </Pressable>
      </View>

      {activeTab === "market" ? (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={18} color={Colors.ink[400]} style={{ marginRight: 8 }} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search stocks..."
              placeholderTextColor={Colors.ink[400]}
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={Colors.ink[300]} />
              </Pressable>
            )}
          </View>

          {filteredStocks.map((stock, i) => (
            <MotiView
              key={stock.ticker}
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 40, duration: 300 }}
            >
              <Pressable
                style={styles.stockRow}
                onPress={() =>
                  router.push({
                    pathname: "/invest/[ticker]",
                    params: { ticker: stock.ticker, price: String(stock.currentPrice) },
                  })
                }
              >
                <View style={styles.stockEmoji}>
                  <Text style={styles.emojiText}>{stock.emoji}</Text>
                </View>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockTicker}>{stock.ticker}</Text>
                  <Text style={styles.stockName} numberOfLines={1}>
                    {stock.companyName}
                  </Text>
                </View>
                <View style={styles.stockRight}>
                  <Text style={styles.stockPrice}>${stock.currentPrice.toFixed(2)}</Text>
                  <View
                    style={[
                      styles.changeBadge,
                      {
                        backgroundColor:
                          stock.change >= 0 ? Colors.accent.greenSoft : Colors.accent.redSoft,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.changeText,
                        { color: stock.change >= 0 ? Colors.accent.green : Colors.accent.red },
                      ]}
                    >
                      {stock.change >= 0 ? "+" : ""}
                      {stock.change.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </Pressable>
            </MotiView>
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 350 }}
          >
            <View style={styles.portfolioCard}>
              <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
              <Text style={styles.portfolioValue}>${portfolioValue.toFixed(2)}</Text>
              <Text style={styles.portfolioSub}>
                {stockHoldings.length} holding{stockHoldings.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </MotiView>

          {stockHoldings.length === 0 ? (
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 100, duration: 300 }}
            >
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📈</Text>
                <Text style={styles.emptyTitle}>No investments yet</Text>
                <Text style={styles.emptySubtitle}>Start investing with as little as $1</Text>
                <Pressable style={styles.emptyBtn} onPress={() => setActiveTab("market")}>
                  <Text style={styles.emptyBtnText}>Browse Stocks</Text>
                </Pressable>
              </View>
            </MotiView>
          ) : (
            stockHoldings.map((h, i) => {
              const stock = STOCKS.find((s) => s.ticker === h.ticker);
              const currentPrice = stock ? stock.currentPrice : h.currentPrice;
              const gainLoss = ((currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100;
              const totalValue = h.shares * currentPrice;
              return (
                <MotiView
                  key={h.id}
                  from={{ opacity: 0, translateX: -8 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: i * 50, duration: 300 }}
                >
                  <Pressable
                    style={styles.holdingRow}
                    onPress={() =>
                      router.push({
                        pathname: "/invest/[ticker]",
                        params: { ticker: h.ticker, price: String(currentPrice) },
                      })
                    }
                  >
                    <View style={styles.holdingEmoji}>
                      <Text style={styles.emojiText}>{stock?.emoji ?? "📊"}</Text>
                    </View>
                    <View style={styles.stockInfo}>
                      <Text style={styles.stockTicker}>{h.ticker}</Text>
                      <Text style={styles.holdingShares}>{h.shares.toFixed(4)} shares</Text>
                    </View>
                    <View style={styles.stockRight}>
                      <Text style={styles.stockPrice}>${totalValue.toFixed(2)}</Text>
                      <View
                        style={[
                          styles.changeBadge,
                          {
                            backgroundColor:
                              gainLoss >= 0 ? Colors.accent.greenSoft : Colors.accent.redSoft,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.changeText,
                            { color: gainLoss >= 0 ? Colors.accent.green : Colors.accent.red },
                          ]}
                        >
                          {gainLoss >= 0 ? "+" : ""}
                          {gainLoss.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </MotiView>
              );
            })
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 18,
    marginBottom: 16,
    backgroundColor: Colors.ink[100],
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.ink[900],
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.ink[500],
  },
  tabTextActive: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.ink[900],
  },
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.ink[200],
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.ink[900],
    paddingVertical: 0,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.ink[100],
  },
  stockEmoji: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  holdingEmoji: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  emojiText: {
    fontSize: 22,
  },
  stockInfo: {
    flex: 1,
  },
  stockTicker: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
  },
  stockName: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    marginTop: 2,
  },
  holdingShares: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    marginTop: 2,
  },
  stockRight: {
    alignItems: "flex-end",
  },
  stockPrice: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
  },
  changeBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  changeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  portfolioCard: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  portfolioLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  },
  portfolioValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 32,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  portfolioSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 6,
  },
  holdingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.ink[100],
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.ink[900],
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.ink[500],
    textAlign: "center",
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
  },
  emptyBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.white,
  },
});
