import { useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

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

const PRICE_HISTORY = [
  { label: "1W", from: 178, to: 182 },
  { label: "1M", from: 165, to: 182 },
  { label: "3M", from: 155, to: 182 },
  { label: "1Y", from: 130, to: 182 },
];

type TradeTab = "buy" | "sell";

export default function StockDetailScreen() {
  const insets = useSafeAreaInsets();
  const { ticker } = useLocalSearchParams<{ ticker: string; price: string }>();
  const { stockHoldings, buyStock, sellStock, balances, activeCurrency } = useApp();

  const stock = STOCKS.find((s) => s.ticker === ticker);
  const holding = stockHoldings.find((h) => h.ticker === ticker);

  const [tradeTab, setTradeTab] = useState<TradeTab>("buy");
  const [dollarAmount, setDollarAmount] = useState("");
  const [sellShares, setSellShares] = useState("");

  const currentPrice = stock?.currentPrice ?? parseFloat(String(0));
  const sharesFromDollars = useMemo(() => {
    const amt = parseFloat(dollarAmount);
    if (!amt || amt <= 0 || currentPrice <= 0) return 0;
    return amt / currentPrice;
  }, [dollarAmount, currentPrice]);

  const balance = balances[activeCurrency] ?? 0;

  function handleBuy() {
    const amt = parseFloat(dollarAmount);
    if (!amt || amt <= 0) {
      Alert.alert("Invalid amount", "Please enter a dollar amount to invest.");
      return;
    }
    if (amt > balance) {
      Alert.alert(
        "Insufficient balance",
        `Your ${activeCurrency} balance is $${balance.toFixed(2)}.`,
      );
      return;
    }
    const shares = amt / currentPrice;
    buyStock(ticker!, shares, currentPrice, "USD");
    setDollarAmount("");
    Alert.alert(
      "Order Placed",
      `You bought ${shares.toFixed(4)} shares of ${ticker} for $${amt.toFixed(2)}.`,
    );
  }

  function handleSell() {
    const shares = parseFloat(sellShares);
    if (!shares || shares <= 0) {
      Alert.alert("Invalid amount", "Please enter the number of shares to sell.");
      return;
    }
    if (!holding || shares > holding.shares) {
      Alert.alert(
        "Insufficient shares",
        `You only hold ${holding?.shares.toFixed(4) ?? 0} shares.`,
      );
      return;
    }
    sellStock(ticker!, shares, currentPrice);
    setSellShares("");
    const proceeds = shares * currentPrice;
    Alert.alert(
      "Order Placed",
      `Sold ${shares.toFixed(4)} shares of ${ticker} for $${proceeds.toFixed(2)}.`,
    );
  }

  if (!stock) {
    return (
      <Screen bg={Colors.white}>
        <Header title="Stock Detail" />
        <View style={styles.center}>
          <Text style={styles.notFound}>Stock not found.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen bg={Colors.surface.background}>
      <Header title={stock.ticker} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Stock Header Card */}
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 350 }}
          >
            <View style={styles.headerCard}>
              <View style={styles.headerRow}>
                <View style={styles.stockEmojiLg}>
                  <Text style={styles.emojiLg}>{stock.emoji}</Text>
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.companyName}>{stock.companyName}</Text>
                  <Text style={styles.sectorText}>{stock.sector}</Text>
                </View>
                <View
                  style={[
                    styles.changeBadgeLg,
                    {
                      backgroundColor:
                        stock.change >= 0 ? Colors.accent.greenSoft : Colors.accent.redSoft,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.changeTextLg,
                      { color: stock.change >= 0 ? Colors.accent.green : Colors.accent.red },
                    ]}
                  >
                    {stock.change >= 0 ? "+" : ""}
                    {stock.change.toFixed(1)}%
                  </Text>
                </View>
              </View>
              <Text style={styles.priceHero}>${currentPrice.toFixed(2)}</Text>
            </View>
          </MotiView>

          {/* Price History */}
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 80, duration: 320 }}
          >
            <View style={styles.historyCard}>
              <Text style={styles.historyTitle}>Price History</Text>
              <View style={styles.historyRow}>
                {PRICE_HISTORY.map((item) => (
                  <View key={item.label} style={styles.historyItem}>
                    <Text style={styles.historyLabel}>{item.label}</Text>
                    <Text style={styles.historyRange}>
                      ${item.from} → ${item.to}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </MotiView>

          {/* Balance chip */}
          <View style={styles.balanceChip}>
            <Text style={styles.balanceChipText}>
              Available: ${balance.toFixed(2)} {activeCurrency}
            </Text>
          </View>

          {/* Trade Tabs */}
          <View style={styles.tradeTabRow}>
            <Pressable
              style={[styles.tradeTab, tradeTab === "buy" && styles.tradeTabActive]}
              onPress={() => setTradeTab("buy")}
            >
              <Text style={[styles.tradeTabText, tradeTab === "buy" && styles.tradeTabTextActive]}>
                Buy
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tradeTab, tradeTab === "sell" && styles.tradeTabActive]}
              onPress={() => setTradeTab("sell")}
            >
              <Text style={[styles.tradeTabText, tradeTab === "sell" && styles.tradeTabTextActive]}>
                Sell
              </Text>
            </Pressable>
          </View>

          {/* Buy Panel */}
          {tradeTab === "buy" ? (
            <MotiView
              key="buy"
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ duration: 250 }}
            >
              <View style={styles.tradeCard}>
                <Text style={styles.inputLabel}>Dollar Amount (USD)</Text>
                <View style={styles.amountInputWrap}>
                  <Text style={styles.currencyPrefix}>$</Text>
                  <TextInput
                    value={dollarAmount}
                    onChangeText={setDollarAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={Colors.ink[300]}
                    style={styles.amountInput}
                  />
                </View>
                {sharesFromDollars > 0 && (
                  <Text style={styles.sharesPreview}>= {sharesFromDollars.toFixed(6)} shares</Text>
                )}
                <View style={styles.quickAmounts}>
                  {[10, 25, 50, 100].map((amt) => (
                    <Pressable
                      key={amt}
                      style={styles.quickBtn}
                      onPress={() => setDollarAmount(String(amt))}
                    >
                      <Text style={styles.quickBtnText}>${amt}</Text>
                    </Pressable>
                  ))}
                </View>
                <Button title={`Buy ${ticker}`} onPress={handleBuy} />
              </View>
            </MotiView>
          ) : (
            /* Sell Panel */
            <MotiView
              key="sell"
              from={{ opacity: 0, translateX: 10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ duration: 250 }}
            >
              <View style={styles.tradeCard}>
                {holding ? (
                  <View style={styles.holdingInfo}>
                    <Text style={styles.holdingInfoLabel}>Your holdings</Text>
                    <Text style={styles.holdingInfoValue}>{holding.shares.toFixed(6)} shares</Text>
                    <Text style={styles.holdingInfoSub}>
                      Avg. buy price: ${holding.avgBuyPrice.toFixed(2)}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.noHolding}>
                    <Text style={styles.noHoldingText}>You don't hold any {ticker} shares.</Text>
                  </View>
                )}
                <Text style={styles.inputLabel}>Shares to Sell</Text>
                <View style={styles.amountInputWrap}>
                  <TextInput
                    value={sellShares}
                    onChangeText={setSellShares}
                    keyboardType="decimal-pad"
                    placeholder="0.0000"
                    placeholderTextColor={Colors.ink[300]}
                    style={[styles.amountInput, { paddingLeft: 14 }]}
                    editable={!!holding}
                  />
                </View>
                {sellShares && parseFloat(sellShares) > 0 && (
                  <Text style={styles.sharesPreview}>
                    = ${(parseFloat(sellShares) * currentPrice).toFixed(2)} proceeds
                  </Text>
                )}
                {holding && (
                  <View style={styles.quickAmounts}>
                    <Pressable
                      style={styles.quickBtn}
                      onPress={() => setSellShares((holding.shares * 0.25).toFixed(6))}
                    >
                      <Text style={styles.quickBtnText}>25%</Text>
                    </Pressable>
                    <Pressable
                      style={styles.quickBtn}
                      onPress={() => setSellShares((holding.shares * 0.5).toFixed(6))}
                    >
                      <Text style={styles.quickBtnText}>50%</Text>
                    </Pressable>
                    <Pressable
                      style={styles.quickBtn}
                      onPress={() => setSellShares((holding.shares * 0.75).toFixed(6))}
                    >
                      <Text style={styles.quickBtnText}>75%</Text>
                    </Pressable>
                    <Pressable
                      style={styles.quickBtn}
                      onPress={() => setSellShares(holding.shares.toFixed(6))}
                    >
                      <Text style={styles.quickBtnText}>Max</Text>
                    </Pressable>
                  </View>
                )}
                <Button
                  title={`Sell ${ticker}`}
                  onPress={handleSell}
                  disabled={!holding}
                  variant={holding ? "primary" : "secondary"}
                />
              </View>
            </MotiView>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: Colors.ink[500],
  },
  headerCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.ink[100],
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  stockEmojiLg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  emojiLg: {
    fontSize: 28,
  },
  headerInfo: {
    flex: 1,
  },
  companyName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.ink[900],
  },
  sectorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    marginTop: 2,
  },
  changeBadgeLg: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  changeTextLg: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  priceHero: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 34,
    color: Colors.ink[900],
    letterSpacing: -0.5,
  },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.ink[100],
  },
  historyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[900],
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyItem: {
    alignItems: "center",
  },
  historyLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.brand.primary,
    marginBottom: 4,
  },
  historyRange: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.ink[600],
  },
  balanceChip: {
    alignSelf: "flex-start",
    backgroundColor: Colors.brand.primary50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  balanceChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.brand.primary,
  },
  tradeTabRow: {
    flexDirection: "row",
    backgroundColor: Colors.ink[100],
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tradeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tradeTabActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.ink[900],
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tradeTabText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.ink[500],
  },
  tradeTabTextActive: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.ink[900],
  },
  tradeCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.ink[100],
  },
  inputLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.ink[700],
    marginBottom: 8,
  },
  amountInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.ink[200],
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 14,
    marginBottom: 8,
    backgroundColor: Colors.surface.background,
  },
  currencyPrefix: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.ink[400],
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 20,
    color: Colors.ink[900],
    paddingVertical: 0,
  },
  sharesPreview: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.brand.primary,
    marginBottom: 12,
    marginLeft: 4,
  },
  quickAmounts: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.brand.primary,
    alignItems: "center",
  },
  quickBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.brand.primary,
  },
  holdingInfo: {
    backgroundColor: Colors.brand.primary50,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  holdingInfoLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.brand.primary,
    marginBottom: 4,
  },
  holdingInfoValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.ink[900],
  },
  holdingInfoSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    marginTop: 2,
  },
  noHolding: {
    backgroundColor: Colors.accent.redSoft,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  noHoldingText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.accent.red,
    textAlign: "center",
  },
});
