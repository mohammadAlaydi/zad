import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  StatusBar,
  TextInput,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";

type POSTransaction = {
  id: string;
  amount: number;
  cardLast4: string;
  cardBrand: string;
  status: "completed" | "declined" | "pending";
  timestamp: string;
  receiptId: string;
};

const samplePOSTx: POSTransaction[] = [
  {
    id: "pos1",
    amount: 42.5,
    cardLast4: "7823",
    cardBrand: "Visa",
    status: "completed",
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    receiptId: "R-001234",
  },
  {
    id: "pos2",
    amount: 18.0,
    cardLast4: "4556",
    cardBrand: "Mastercard",
    status: "completed",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    receiptId: "R-001235",
  },
  {
    id: "pos3",
    amount: 125.75,
    cardLast4: "9012",
    cardBrand: "Visa",
    status: "declined",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    receiptId: "R-001236",
  },
  {
    id: "pos4",
    amount: 8.99,
    cardLast4: "3344",
    cardBrand: "Mastercard",
    status: "completed",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    receiptId: "R-001237",
  },
];

export default function NFCSoftPOS() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<"ready" | "amount" | "tap" | "processing" | "done" | "history">(
    "ready",
  );
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState(samplePOSTx);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const todayTotal = transactions
    .filter(
      (t) =>
        t.status === "completed" &&
        new Date(t.timestamp).toDateString() === new Date().toDateString(),
    )
    .reduce((s, t) => s + t.amount, 0);

  useEffect(() => {
    if (mode === "tap") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [mode]);

  const startPayment = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setMode("tap");
  };

  const simulateTap = () => {
    setMode("processing");
    setTimeout(() => {
      const newTx: POSTransaction = {
        id: `pos-${Date.now()}`,
        amount: parseFloat(amount),
        cardLast4: `${Math.floor(1000 + Math.random() * 9000)}`,
        cardBrand: Math.random() > 0.5 ? "Visa" : "Mastercard",
        status: "completed",
        timestamp: new Date().toISOString(),
        receiptId: `R-${String(Date.now()).slice(-6)}`,
      };
      setTransactions([newTx, ...transactions]);
      setMode("done");
    }, 2000);
  };

  const resetPOS = () => {
    setAmount("");
    setMode("ready");
  };

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="NFC Soft POS"
        right={
          <Pressable onPress={() => setMode(mode === "history" ? "ready" : "history")}>
            <Ionicons
              name={mode === "history" ? "card" : "list"}
              size={22}
              color={Colors.brand.primary}
            />
          </Pressable>
        }
      />

      {/* Ready / Amount Entry */}
      {(mode === "ready" || mode === "amount") && (
        <View style={styles.centered}>
          <View style={styles.posIcon}>
            <MaterialCommunityIcons
              name="contactless-payment"
              size={48}
              color={Colors.brand.primary}
            />
          </View>
          <Text style={styles.posTitle}>Accept Payment</Text>
          <Text style={styles.posSub}>Enter amount and tap customer's card</Text>

          <View style={styles.amountBox}>
            <Text style={styles.amountCurrency}>$</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={Colors.ink[300]}
              keyboardType="decimal-pad"
              style={styles.amountInput}
              autoFocus
            />
          </View>

          <Button
            title="Ready for Tap"
            onPress={startPayment}
            disabled={!amount || parseFloat(amount) <= 0}
            style={{ paddingHorizontal: 40, marginTop: 24 }}
          />

          <View style={styles.todayCard}>
            <Text style={styles.todayLabel}>Today's Total</Text>
            <Text style={styles.todayValue}>${todayTotal.toFixed(2)}</Text>
            <Text style={styles.todayCount}>
              {
                transactions.filter(
                  (t) =>
                    t.status === "completed" &&
                    new Date(t.timestamp).toDateString() === new Date().toDateString(),
                ).length
              }{" "}
              transactions
            </Text>
          </View>
        </View>
      )}

      {/* Tap Mode */}
      {mode === "tap" && (
        <View style={styles.centered}>
          <Animated.View style={[styles.tapCircle, { transform: [{ scale: pulseAnim }] }]}>
            <MaterialCommunityIcons name="contactless-payment" size={64} color={Colors.white} />
          </Animated.View>
          <Text style={styles.tapTitle}>Ready to Tap</Text>
          <Text style={styles.tapAmount}>${parseFloat(amount).toFixed(2)}</Text>
          <Text style={styles.tapSub}>Hold customer's card near the device</Text>

          {/* Simulate tap button for demo */}
          <Pressable onPress={simulateTap} style={styles.simBtn}>
            <Text style={styles.simBtnText}>Simulate Card Tap</Text>
          </Pressable>

          <Pressable onPress={resetPOS} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {/* Processing */}
      {mode === "processing" && (
        <View style={styles.centered}>
          <View style={styles.processingCircle}>
            <Ionicons name="hourglass" size={40} color={Colors.brand.primary} />
          </View>
          <Text style={styles.tapTitle}>Processing...</Text>
          <Text style={styles.tapSub}>Verifying payment</Text>
        </View>
      )}

      {/* Done */}
      {mode === "done" && (
        <View style={styles.centered}>
          <View style={styles.doneCircle}>
            <Ionicons name="checkmark" size={48} color={Colors.white} />
          </View>
          <Text style={styles.doneTitle}>Payment Successful</Text>
          <Text style={styles.doneAmount}>${parseFloat(amount).toFixed(2)}</Text>
          <Text style={styles.tapSub}>Digital receipt sent to customer</Text>

          <View style={styles.receiptCard}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Amount</Text>
              <Text style={styles.receiptValue}>${parseFloat(amount).toFixed(2)}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Card</Text>
              <Text style={styles.receiptValue}>
                {transactions[0]?.cardBrand} ····{transactions[0]?.cardLast4}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Receipt</Text>
              <Text style={styles.receiptValue}>{transactions[0]?.receiptId}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Time</Text>
              <Text style={styles.receiptValue}>
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          </View>

          <Button
            title="New Payment"
            onPress={resetPOS}
            style={{ paddingHorizontal: 40, marginTop: 20 }}
          />
        </View>
      )}

      {/* Transaction History */}
      {mode === "history" && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 40 }}
        >
          <Text style={styles.histTitle}>Transaction History</Text>
          <View style={styles.histSummary}>
            <View style={{ flex: 1 }}>
              <Text style={styles.histLabel}>Today's Revenue</Text>
              <Text style={styles.histValue}>${todayTotal.toFixed(2)}</Text>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={styles.histLabel}>Transactions</Text>
              <Text style={styles.histValue}>{transactions.length}</Text>
            </View>
          </View>

          {transactions.map((tx) => (
            <View key={tx.id} style={styles.histRow}>
              <View
                style={[
                  styles.histIcon,
                  {
                    backgroundColor:
                      tx.status === "completed" ? Colors.accent.greenSoft : Colors.accent.redSoft,
                  },
                ]}
              >
                <Ionicons
                  name={tx.status === "completed" ? "checkmark" : "close"}
                  size={16}
                  color={tx.status === "completed" ? Colors.accent.green : Colors.accent.red}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.histName}>
                  {tx.cardBrand} ····{tx.cardLast4}
                </Text>
                <Text style={styles.histMeta}>
                  {tx.receiptId} ·{" "}
                  {new Date(tx.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={[
                    styles.histAmount,
                    tx.status === "declined" && { color: Colors.accent.red },
                  ]}
                >
                  ${tx.amount.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.histStatus,
                    { color: tx.status === "completed" ? Colors.accent.green : Colors.accent.red },
                  ]}
                >
                  {tx.status}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  posIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  posTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.ink[900] },
  posSub: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.ink[500], marginTop: 6 },
  amountBox: { flexDirection: "row", alignItems: "center", marginTop: 28 },
  amountCurrency: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    color: Colors.ink[900],
    marginRight: 4,
  },
  amountInput: {
    fontFamily: "Inter_700Bold",
    fontSize: 42,
    color: Colors.ink[900],
    minWidth: 120,
    textAlign: "center",
  },
  todayCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 30,
    width: "100%",
    shadowColor: "#101225",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  todayLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500] },
  todayValue: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.ink[900], marginTop: 4 },
  todayCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[400],
    marginTop: 2,
  },
  tapCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 10,
  },
  tapTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.ink[900], marginTop: 8 },
  tapAmount: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: Colors.brand.primary,
    marginTop: 6,
  },
  tapSub: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.ink[500], marginTop: 8 },
  simBtn: {
    marginTop: 30,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.accent.greenSoft,
    borderRadius: 20,
  },
  simBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.accent.green },
  cancelBtn: { marginTop: 16 },
  cancelText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.accent.red },
  processingCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  doneCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.accent.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  doneTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.ink[900] },
  doneAmount: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: Colors.accent.green,
    marginTop: 4,
  },
  receiptCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    width: "100%",
    marginTop: 20,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink[100],
  },
  receiptLabel: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[500] },
  receiptValue: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.ink[900] },
  histTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.ink[900],
    marginBottom: 14,
  },
  histSummary: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  histLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500] },
  histValue: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.ink[900], marginTop: 4 },
  histRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  histIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  histName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  histMeta: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500], marginTop: 2 },
  histAmount: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.ink[900] },
  histStatus: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    marginTop: 2,
    textTransform: "capitalize",
  },
});
