import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { Colors } from "@/theme/colors";

const COINS = [
  { symbol: "BTC", name: "Bitcoin", currentPrice: 64000, emoji: "₿" },
  { symbol: "ETH", name: "Ethereum", currentPrice: 3500, emoji: "⟠" },
  { symbol: "USDT", name: "Tether", currentPrice: 1.0, emoji: "₮" },
  { symbol: "BNB", name: "BNB", currentPrice: 580, emoji: "🔶" },
  { symbol: "SOL", name: "Solana", currentPrice: 145, emoji: "◎" },
];

type CoinSymbol = (typeof COINS)[number]["symbol"];

function formatPrice(price: number): string {
  if (price >= 1000) return `$${(price / 1000).toFixed(1)}k`;
  return `$${price.toFixed(2)}`;
}

export default function SwapScreen() {
  const insets = useSafeAreaInsets();
  const [fromSymbol, setFromSymbol] = useState<CoinSymbol>("BTC");
  const [toSymbol, setToSymbol] = useState<CoinSymbol>("ETH");
  const [amount, setAmount] = useState("");
  const [pickerFor, setPickerFor] = useState<"from" | "to" | null>(null);

  const fromCoin = COINS.find((c) => c.symbol === fromSymbol)!;
  const toCoin = COINS.find((c) => c.symbol === toSymbol)!;

  const rate = fromCoin.currentPrice / toCoin.currentPrice;
  const toAmount = amount && parseFloat(amount) > 0 ? parseFloat(amount) * rate : 0;

  function flipCoins() {
    const prev = fromSymbol;
    setFromSymbol(toSymbol);
    setToSymbol(prev);
    setAmount("");
  }

  function handleSwap() {
    Alert.alert("Coming Soon", "P2P swaps launching soon!");
  }

  return (
    <Screen bg={Colors.surface.background}>
      <Header title="Swap Crypto" />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Rate Card */}
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 300 }}
        >
          <View style={styles.rateCard}>
            <Text style={styles.rateLabel}>Exchange Rate</Text>
            <Text style={styles.rateValue}>
              1 {fromCoin.symbol} = {rate.toFixed(4)} {toCoin.symbol}
            </Text>
            <Text style={styles.rateSub}>
              {formatPrice(fromCoin.currentPrice)} / {formatPrice(toCoin.currentPrice)}
            </Text>
          </View>
        </MotiView>

        {/* From Selector */}
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 60, duration: 300 }}
        >
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>From</Text>
            <Pressable
              style={styles.coinSelector}
              onPress={() => setPickerFor("from")}
            >
              <Text style={styles.selectorEmoji}>{fromCoin.emoji}</Text>
              <View style={styles.selectorInfo}>
                <Text style={styles.selectorSymbol}>{fromCoin.symbol}</Text>
                <Text style={styles.selectorName}>{fromCoin.name}</Text>
              </View>
              <Ionicons name="chevron-down" size={18} color={Colors.ink[400]} />
            </Pressable>

            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Amount</Text>
              <View style={styles.amountInputWrap}>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={Colors.ink[300]}
                  style={styles.amountInput}
                />
                <Text style={styles.amountSuffix}>{fromCoin.symbol}</Text>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Flip Button */}
        <View style={styles.flipRow}>
          <Pressable style={styles.flipBtn} onPress={flipCoins}>
            <Ionicons name="swap-vertical" size={22} color={Colors.brand.primary} />
          </Pressable>
        </View>

        {/* To Selector */}
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 120, duration: 300 }}
        >
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>To</Text>
            <Pressable
              style={styles.coinSelector}
              onPress={() => setPickerFor("to")}
            >
              <Text style={styles.selectorEmoji}>{toCoin.emoji}</Text>
              <View style={styles.selectorInfo}>
                <Text style={styles.selectorSymbol}>{toCoin.symbol}</Text>
                <Text style={styles.selectorName}>{toCoin.name}</Text>
              </View>
              <Ionicons name="chevron-down" size={18} color={Colors.ink[400]} />
            </Pressable>

            {toAmount > 0 && (
              <View style={styles.receiveRow}>
                <Text style={styles.receiveLabel}>You receive approximately</Text>
                <Text style={styles.receiveValue}>
                  {toAmount.toFixed(6)} {toCoin.symbol}
                </Text>
              </View>
            )}
          </View>
        </MotiView>

        {/* Swap Summary */}
        {amount && parseFloat(amount) > 0 && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 200 }}
          >
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Rate</Text>
                <Text style={styles.summaryVal}>
                  1 {fromCoin.symbol} = {rate.toFixed(4)} {toCoin.symbol}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Network Fee</Text>
                <Text style={styles.summaryVal}>~$1.50</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Estimated Time</Text>
                <Text style={styles.summaryVal}>~30 seconds</Text>
              </View>
            </View>
          </MotiView>
        )}

        <View style={styles.buttonWrap}>
          <Button
            title="Swap Now"
            onPress={handleSwap}
            disabled={!amount || parseFloat(amount) <= 0}
          />
        </View>
      </ScrollView>

      {/* Coin Picker Modal */}
      <Modal
        visible={pickerFor !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerFor(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPickerFor(null)}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              Select {pickerFor === "from" ? "From" : "To"} Coin
            </Text>
            {COINS.filter((c) =>
              pickerFor === "from" ? c.symbol !== toSymbol : c.symbol !== fromSymbol
            ).map((c) => (
              <Pressable
                key={c.symbol}
                style={[
                  styles.pickerRow,
                  (pickerFor === "from" ? fromSymbol : toSymbol) === c.symbol &&
                    styles.pickerRowActive,
                ]}
                onPress={() => {
                  if (pickerFor === "from") setFromSymbol(c.symbol);
                  else setToSymbol(c.symbol);
                  setAmount("");
                  setPickerFor(null);
                }}
              >
                <Text style={styles.pickerEmoji}>{c.emoji}</Text>
                <View style={styles.selectorInfo}>
                  <Text style={styles.selectorSymbol}>{c.symbol}</Text>
                  <Text style={styles.selectorName}>{c.name}</Text>
                </View>
                <Text style={styles.pickerPrice}>{formatPrice(c.currentPrice)}</Text>
                {(pickerFor === "from" ? fromSymbol : toSymbol) === c.symbol && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.brand.primary} style={{ marginLeft: 8 }} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  rateCard: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    alignItems: "center",
  },
  rateLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 6,
  },
  rateValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    color: Colors.white,
  },
  rateSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.ink[100],
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.ink[500],
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  coinSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface.background,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  selectorEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  selectorInfo: {
    flex: 1,
  },
  selectorSymbol: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
  },
  selectorName: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    marginTop: 2,
  },
  amountRow: {
    marginTop: 4,
  },
  amountLabel: {
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
    backgroundColor: Colors.surface.background,
  },
  amountInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 20,
    color: Colors.ink[900],
    paddingVertical: 0,
  },
  amountSuffix: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[400],
  },
  flipRow: {
    alignItems: "center",
    marginVertical: 12,
  },
  flipBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.brand.primary,
  },
  receiveRow: {
    marginTop: 4,
    backgroundColor: Colors.accent.greenSoft,
    borderRadius: 12,
    padding: 12,
  },
  receiveLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.accent.green,
    marginBottom: 4,
  },
  receiveValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.ink[900],
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: Colors.ink[100],
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink[100],
  },
  summaryKey: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.ink[500],
  },
  summaryVal: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[900],
  },
  buttonWrap: {
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(16,18,37,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ink[200],
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: Colors.ink[900],
    marginBottom: 16,
    textAlign: "center",
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: Colors.surface.background,
  },
  pickerRowActive: {
    backgroundColor: Colors.brand.primary50,
  },
  pickerEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  pickerPrice: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[600],
  },
});
