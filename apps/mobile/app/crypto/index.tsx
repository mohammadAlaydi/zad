import { router } from "expo-router";
import { MotiView } from "moti";
import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useUserItems } from "@/features/userdata";
import type { CryptoHolding } from "@/store/appStore";
import { Colors } from "@/theme/colors";

type CryptoPayload = Omit<CryptoHolding, "id">;

const COINS = [
  { symbol: "BTC", name: "Bitcoin", currentPrice: 64000, emoji: "₿", change: +2.1 },
  { symbol: "ETH", name: "Ethereum", currentPrice: 3500, emoji: "⟠", change: +1.4 },
  { symbol: "USDT", name: "Tether", currentPrice: 1.0, emoji: "₮", change: 0.0 },
  { symbol: "BNB", name: "BNB", currentPrice: 580, emoji: "🔶", change: -0.8 },
  { symbol: "SOL", name: "Solana", currentPrice: 145, emoji: "◎", change: +3.2 },
];

type Tab = "market" | "wallet";

export default function CryptoScreen() {
  const insets = useSafeAreaInsets();
  const cryptoQuery = useUserItems<CryptoPayload>("crypto");
  const cryptoHoldings: CryptoHolding[] = (cryptoQuery.data?.items ?? []).map((it) => ({
    ...it.payload,
    id: it.id,
  }));
  const [activeTab, setActiveTab] = useState<Tab>("market");

  const totalCryptoValue = useMemo(() => {
    return cryptoHoldings.reduce((acc, h) => {
      const coin = COINS.find((c) => c.symbol === h.symbol);
      const price = coin ? coin.currentPrice : h.currentPrice;
      return acc + h.amount * price;
    }, 0);
  }, [cryptoHoldings]);

  return (
    <Screen bg={Colors.surface.background}>
      <Header title="Crypto" showBack />

      {/* Tabs */}
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
          style={[styles.tab, activeTab === "wallet" && styles.tabActive]}
          onPress={() => setActiveTab("wallet")}
        >
          <Text style={[styles.tabText, activeTab === "wallet" && styles.tabTextActive]}>
            Wallet
          </Text>
        </Pressable>
      </View>

      {activeTab === "market" ? (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Portfolio Summary */}
          {totalCryptoValue > 0 && (
            <MotiView
              from={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 300 }}
            >
              <View style={styles.portfolioMini}>
                <Text style={styles.portfolioMiniLabel}>My Crypto Value</Text>
                <Text style={styles.portfolioMiniValue}>${totalCryptoValue.toFixed(2)}</Text>
              </View>
            </MotiView>
          )}

          {/* Coins List */}
          {COINS.map((coin, i) => (
            <MotiView
              key={coin.symbol}
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 40, duration: 300 }}
            >
              <Pressable
                style={styles.coinRow}
                onPress={() =>
                  router.push({
                    pathname: "/crypto/[symbol]",
                    params: { symbol: coin.symbol },
                  })
                }
              >
                <View style={styles.coinEmoji}>
                  <Text style={styles.emojiText}>{coin.emoji}</Text>
                </View>
                <View style={styles.coinInfo}>
                  <Text style={styles.coinName}>{coin.name}</Text>
                  <Text style={styles.coinSymbol}>{coin.symbol}</Text>
                </View>
                <View style={styles.coinRight}>
                  <Text style={styles.coinPrice}>
                    {coin.currentPrice >= 1000
                      ? `$${(coin.currentPrice / 1000).toFixed(1)}k`
                      : `$${coin.currentPrice.toFixed(2)}`}
                  </Text>
                  <View
                    style={[
                      styles.changeBadge,
                      {
                        backgroundColor:
                          coin.change > 0
                            ? Colors.accent.greenSoft
                            : coin.change < 0
                              ? Colors.accent.redSoft
                              : Colors.ink[100],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.changeText,
                        {
                          color:
                            coin.change > 0
                              ? Colors.accent.green
                              : coin.change < 0
                                ? Colors.accent.red
                                : Colors.ink[500],
                        },
                      ]}
                    >
                      {coin.change > 0 ? "+" : ""}
                      {coin.change.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </Pressable>
            </MotiView>
          ))}

          {/* Swap shortcut */}
          <Pressable style={styles.swapBanner} onPress={() => router.push("/crypto/swap")}>
            <Text style={styles.swapBannerEmoji}>🔄</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.swapBannerTitle}>Swap Crypto</Text>
              <Text style={styles.swapBannerSub}>Exchange between coins instantly</Text>
            </View>
            <Text style={styles.swapBannerArrow}>→</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Wallet Total */}
          <MotiView
            from={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 350 }}
          >
            <View style={styles.walletCard}>
              <Text style={styles.walletCardLabel}>Total Crypto Wallet</Text>
              <Text style={styles.walletCardValue}>${totalCryptoValue.toFixed(2)}</Text>
              <Text style={styles.walletCardSub}>
                {cryptoHoldings.length} asset{cryptoHoldings.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </MotiView>

          {cryptoHoldings.length === 0 ? (
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 100, duration: 300 }}
            >
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>₿</Text>
                <Text style={styles.emptyTitle}>No crypto yet</Text>
                <Text style={styles.emptySubtitle}>No crypto yet. Buy your first Bitcoin!</Text>
                <Pressable style={styles.emptyBtn} onPress={() => setActiveTab("market")}>
                  <Text style={styles.emptyBtnText}>Browse Coins</Text>
                </Pressable>
              </View>
            </MotiView>
          ) : (
            cryptoHoldings.map((h, i) => {
              const coin = COINS.find((c) => c.symbol === h.symbol);
              const currentPrice = coin ? coin.currentPrice : h.currentPrice;
              const value = h.amount * currentPrice;
              return (
                <MotiView
                  key={h.id}
                  from={{ opacity: 0, translateX: -8 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: i * 50, duration: 300 }}
                >
                  <Pressable
                    style={styles.walletHoldingRow}
                    onPress={() =>
                      router.push({
                        pathname: "/crypto/[symbol]",
                        params: { symbol: h.symbol },
                      })
                    }
                  >
                    <View style={styles.coinEmoji}>
                      <Text style={styles.emojiText}>{coin?.emoji ?? "🪙"}</Text>
                    </View>
                    <View style={styles.coinInfo}>
                      <Text style={styles.coinName}>{h.symbol}</Text>
                      <Text style={styles.coinSymbol}>
                        {h.amount < 0.001 ? h.amount.toFixed(8) : h.amount.toFixed(6)} {h.symbol}
                      </Text>
                    </View>
                    <View style={styles.coinRight}>
                      <Text style={styles.coinPrice}>${value.toFixed(2)}</Text>
                      <Text style={styles.coinPriceUSD}>
                        @ $
                        {currentPrice >= 1000
                          ? `${(currentPrice / 1000).toFixed(1)}k`
                          : currentPrice.toFixed(2)}
                      </Text>
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
  portfolioMini: {
    backgroundColor: Colors.brand.primary50,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  portfolioMiniLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.brand.primary,
  },
  portfolioMiniValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.brand.primary,
  },
  coinRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.ink[100],
  },
  coinEmoji: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  emojiText: {
    fontSize: 22,
  },
  coinInfo: {
    flex: 1,
  },
  coinName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
  },
  coinSymbol: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    marginTop: 2,
  },
  coinRight: {
    alignItems: "flex-end",
  },
  coinPrice: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
  },
  coinPriceUSD: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[400],
    marginTop: 2,
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
  swapBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.ink[100],
  },
  swapBannerEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  swapBannerTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
  },
  swapBannerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    marginTop: 2,
  },
  swapBannerArrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.brand.primary,
  },
  walletCard: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  walletCardLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  },
  walletCardValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 32,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  walletCardSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 6,
  },
  walletHoldingRow: {
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
    fontSize: 52,
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
    paddingHorizontal: 16,
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
