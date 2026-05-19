import { router } from "expo-router";
import { MotiView } from "moti";
import { useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
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

export default function PortfolioScreen() {
  const insets = useSafeAreaInsets();
  const stocksQuery = useUserItems<StockPayload>("stocks");
  const stockHoldings: StockHolding[] = (stocksQuery.data?.items ?? []).map((it) => ({
    ...it.payload,
    id: it.id,
  }));

  const portfolioValue = useMemo(() => {
    return stockHoldings.reduce((acc, h) => {
      const stock = STOCKS.find((s) => s.ticker === h.ticker);
      const price = stock ? stock.currentPrice : h.currentPrice;
      return acc + h.shares * price;
    }, 0);
  }, [stockHoldings]);

  const totalCost = useMemo(() => {
    return stockHoldings.reduce((acc, h) => acc + h.shares * h.avgBuyPrice, 0);
  }, [stockHoldings]);

  const totalGainLoss = portfolioValue - totalCost;
  const totalGainLossPct = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  return (
    <Screen bg={Colors.surface.background}>
      <Header title="My Portfolio" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 350 }}
        >
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Value</Text>
            <Text style={styles.summaryValue}>${portfolioValue.toFixed(2)}</Text>
            <View style={styles.summaryRow}>
              <View
                style={[
                  styles.glBadge,
                  {
                    backgroundColor:
                      totalGainLoss >= 0 ? "rgba(31,207,165,0.2)" : "rgba(226,85,99,0.2)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.glText,
                    { color: totalGainLoss >= 0 ? Colors.accent.green : Colors.accent.red },
                  ]}
                >
                  {totalGainLoss >= 0 ? "+" : ""}${totalGainLoss.toFixed(2)} (
                  {totalGainLossPct.toFixed(1)}%)
                </Text>
              </View>
              <Text style={styles.holdingCount}>
                {stockHoldings.length} position{stockHoldings.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </MotiView>

        {stockHoldings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📈</Text>
            <Text style={styles.emptyTitle}>No investments yet</Text>
            <Text style={styles.emptySubtitle}>Start investing with as little as $1</Text>
            <Pressable style={styles.emptyBtn} onPress={() => router.replace("/invest")}>
              <Text style={styles.emptyBtnText}>Browse Stocks</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Your Holdings</Text>
            {stockHoldings.map((h, i) => {
              const stock = STOCKS.find((s) => s.ticker === h.ticker);
              const currentPrice = stock ? stock.currentPrice : h.currentPrice;
              const gainLossPct = ((currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100;
              const gainLossAmt = (currentPrice - h.avgBuyPrice) * h.shares;
              const totalValue = h.shares * currentPrice;
              return (
                <MotiView
                  key={h.id}
                  from={{ opacity: 0, translateX: -8 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: i * 60, duration: 300 }}
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
                    <View style={styles.holdingInfo}>
                      <View style={styles.holdingTopRow}>
                        <Text style={styles.holdingTicker}>{h.ticker}</Text>
                        <Text style={styles.holdingValue}>${totalValue.toFixed(2)}</Text>
                      </View>
                      <View style={styles.holdingBottomRow}>
                        <Text style={styles.holdingShares}>{h.shares.toFixed(4)} shares</Text>
                        <View
                          style={[
                            styles.glSmall,
                            {
                              backgroundColor:
                                gainLossPct >= 0 ? Colors.accent.greenSoft : Colors.accent.redSoft,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.glSmallText,
                              { color: gainLossPct >= 0 ? Colors.accent.green : Colors.accent.red },
                            ]}
                          >
                            {gainLossPct >= 0 ? "+" : ""}
                            {gainLossPct.toFixed(1)}%
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.avgPrice}>
                        Avg ${h.avgBuyPrice.toFixed(2)} · P&L {gainLossAmt >= 0 ? "+" : ""}$
                        {gainLossAmt.toFixed(2)}
                      </Text>
                    </View>
                  </Pressable>
                </MotiView>
              );
            })}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  summaryCard: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  summaryLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 6,
  },
  summaryValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 34,
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  glBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  glText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  holdingCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.ink[900],
    marginBottom: 12,
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
  holdingEmoji: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  emojiText: {
    fontSize: 24,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  holdingTicker: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
  },
  holdingValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
  },
  holdingBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  holdingShares: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
  },
  glSmall: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 7,
  },
  glSmallText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  avgPrice: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.ink[400],
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 40,
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
