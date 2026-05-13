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

const COINS = [
  { symbol: "BTC", name: "Bitcoin", currentPrice: 64000, emoji: "₿", change: +2.1 },
  { symbol: "ETH", name: "Ethereum", currentPrice: 3500, emoji: "⟠", change: +1.4 },
  { symbol: "USDT", name: "Tether", currentPrice: 1.0, emoji: "₮", change: 0.0 },
  { symbol: "BNB", name: "BNB", currentPrice: 580, emoji: "🔶", change: -0.8 },
  { symbol: "SOL", name: "Solana", currentPrice: 145, emoji: "◎", change: +3.2 },
];

type TradeTab = "buy" | "sell";

export default function CoinDetailScreen() {
  const insets = useSafeAreaInsets();
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const { cryptoHoldings, buyCrypto, sellCrypto, balances, activeCurrency } = useApp();

  const coin = COINS.find((c) => c.symbol === symbol);
  const holding = cryptoHoldings.find((h) => h.symbol === symbol);

  const [tradeTab, setTradeTab] = useState<TradeTab>("buy");
  const [usdAmount, setUsdAmount] = useState("");
  const [coinAmount, setCoinAmount] = useState("");

  const currentPrice = coin?.currentPrice ?? 0;

  const coinsFromUsd = useMemo(() => {
    const amt = parseFloat(usdAmount);
    if (!amt || amt <= 0 || currentPrice <= 0) return 0;
    return amt / currentPrice;
  }, [usdAmount, currentPrice]);

  const balance = balances[activeCurrency] ?? 0;

  function handleBuy() {
    const amt = parseFloat(usdAmount);
    if (!amt || amt <= 0) {
      Alert.alert("Invalid amount", "Please enter a USD amount to invest.");
      return;
    }
    if (amt > balance) {
      Alert.alert(
        "Insufficient balance",
        `Your ${activeCurrency} balance is $${balance.toFixed(2)}.`,
      );
      return;
    }
    const coins = amt / currentPrice;
    buyCrypto(symbol!, coins, currentPrice, "USD");
    setUsdAmount("");
    Alert.alert(
      "Purchase Successful",
      `You bought ${coins.toFixed(6)} ${symbol} for $${amt.toFixed(2)}.`,
    );
  }

  function handleSell() {
    const amt = parseFloat(coinAmount);
    if (!amt || amt <= 0) {
      Alert.alert("Invalid amount", "Please enter the amount of coins to sell.");
      return;
    }
    if (!holding || amt > holding.amount) {
      Alert.alert(
        "Insufficient balance",
        `You only hold ${holding?.amount.toFixed(6) ?? 0} ${symbol}.`,
      );
      return;
    }
    sellCrypto(symbol!, amt, currentPrice);
    setCoinAmount("");
    const proceeds = amt * currentPrice;
    Alert.alert("Sale Successful", `Sold ${amt.toFixed(6)} ${symbol} for $${proceeds.toFixed(2)}.`);
  }

  if (!coin) {
    return (
      <Screen bg={Colors.white}>
        <Header title="Crypto" />
        <View style={styles.center}>
          <Text style={styles.notFound}>Coin not found.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen bg={Colors.surface.background}>
      <Header title={coin.name} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Coin Header */}
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 350 }}
          >
            <View style={styles.headerCard}>
              <View style={styles.headerRow}>
                <View style={styles.coinEmojiLg}>
                  <Text style={styles.emojiLg}>{coin.emoji}</Text>
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.coinName}>{coin.name}</Text>
                  <Text style={styles.coinSymbolText}>{coin.symbol} · Crypto</Text>
                </View>
                <View
                  style={[
                    styles.changeBadgeLg,
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
                      styles.changeTextLg,
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
              <Text style={styles.priceHero}>
                $
                {currentPrice >= 1000
                  ? currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })
                  : currentPrice.toFixed(2)}
              </Text>
              <Text style={styles.priceLabel}>Current Price (USD)</Text>
            </View>
          </MotiView>

          {/* Balance Chip */}
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
                <Text style={styles.inputLabel}>USD Amount</Text>
                <View style={styles.amountInputWrap}>
                  <Text style={styles.currencyPrefix}>$</Text>
                  <TextInput
                    value={usdAmount}
                    onChangeText={setUsdAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={Colors.ink[300]}
                    style={styles.amountInput}
                  />
                </View>
                {coinsFromUsd > 0 && (
                  <Text style={styles.conversionPreview}>
                    = {coinsFromUsd.toFixed(6)} {symbol}
                  </Text>
                )}
                <View style={styles.quickAmounts}>
                  {[25, 50, 100, 250].map((amt) => (
                    <Pressable
                      key={amt}
                      style={styles.quickBtn}
                      onPress={() => setUsdAmount(String(amt))}
                    >
                      <Text style={styles.quickBtnText}>${amt}</Text>
                    </Pressable>
                  ))}
                </View>
                <Button title={`Buy ${symbol}`} onPress={handleBuy} />
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
                    <Text style={styles.holdingInfoLabel}>Your {symbol} balance</Text>
                    <Text style={styles.holdingInfoValue}>
                      {holding.amount.toFixed(6)} {symbol}
                    </Text>
                    <Text style={styles.holdingInfoSub}>
                      ≈ ${(holding.amount * currentPrice).toFixed(2)} · Avg $
                      {holding.avgBuyPrice.toFixed(2)}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.noHolding}>
                    <Text style={styles.noHoldingText}>You don't hold any {symbol}.</Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>Amount to Sell ({symbol})</Text>
                <View style={styles.amountInputWrap}>
                  <TextInput
                    value={coinAmount}
                    onChangeText={setCoinAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.000000"
                    placeholderTextColor={Colors.ink[300]}
                    style={[styles.amountInput, { paddingLeft: 14 }]}
                    editable={!!holding}
                  />
                  <Text style={styles.coinSuffix}>{symbol}</Text>
                </View>
                {coinAmount && parseFloat(coinAmount) > 0 && (
                  <Text style={styles.conversionPreview}>
                    = ${(parseFloat(coinAmount) * currentPrice).toFixed(2)} proceeds
                  </Text>
                )}
                {holding && (
                  <View style={styles.quickAmounts}>
                    <Pressable
                      style={styles.quickBtn}
                      onPress={() => setCoinAmount((holding.amount * 0.25).toFixed(6))}
                    >
                      <Text style={styles.quickBtnText}>25%</Text>
                    </Pressable>
                    <Pressable
                      style={styles.quickBtn}
                      onPress={() => setCoinAmount((holding.amount * 0.5).toFixed(6))}
                    >
                      <Text style={styles.quickBtnText}>50%</Text>
                    </Pressable>
                    <Pressable
                      style={styles.quickBtn}
                      onPress={() => setCoinAmount((holding.amount * 0.75).toFixed(6))}
                    >
                      <Text style={styles.quickBtnText}>75%</Text>
                    </Pressable>
                    <Pressable
                      style={styles.quickBtn}
                      onPress={() => setCoinAmount(holding.amount.toFixed(6))}
                    >
                      <Text style={styles.quickBtnText}>Max</Text>
                    </Pressable>
                  </View>
                )}
                <Button
                  title={`Sell ${symbol}`}
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
    marginBottom: 16,
  },
  coinEmojiLg: {
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
  coinName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.ink[900],
  },
  coinSymbolText: {
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
  priceLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[400],
    marginTop: 4,
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
  coinSuffix: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[400],
    marginLeft: 4,
  },
  amountInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 20,
    color: Colors.ink[900],
    paddingVertical: 0,
  },
  conversionPreview: {
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
