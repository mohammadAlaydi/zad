import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, StatusBar, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";

type POSState = "ready" | "waiting" | "success";

type RecentTx = {
  id: string;
  amount: number;
  time: string;
  status: "completed" | "declined";
};

const recentTransactions: RecentTx[] = [
  { id: "tx1", amount: 42.5, time: "10:32 AM", status: "completed" },
  { id: "tx2", amount: 18.0, time: "09:14 AM", status: "completed" },
  { id: "tx3", amount: 125.75, time: "08:47 AM", status: "declined" },
];

export default function SoftPOS() {
  const insets = useSafeAreaInsets();
  const [posState, setPosState] = useState<POSState>("ready");
  const [amount, setAmount] = useState("");
  const [waitTimer, setWaitTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (waitTimer) clearTimeout(waitTimer);
    };
  }, [waitTimer]);

  const handleSimulateTap = () => {
    if (!amount || Number(amount) <= 0) return;
    setPosState("waiting");
    const t = setTimeout(() => {
      setPosState("success");
      const reset = setTimeout(() => {
        setPosState("ready");
        setAmount("");
      }, 2000);
      setWaitTimer(reset);
    }, 3000);
    setWaitTimer(t);
  };

  const handleReset = () => {
    if (waitTimer) clearTimeout(waitTimer);
    setPosState("ready");
    setAmount("");
  };

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="dark-content" />
      <Header title="NFC Soft POS" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount Input */}
        <View style={styles.amountRow}>
          <Text style={styles.currencyPrefix}>AED</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={Colors.ink[300]}
            keyboardType="decimal-pad"
            style={styles.amountInput}
            editable={posState === "ready"}
          />
        </View>

        {/* NFC Animation Area */}
        <View style={styles.nfcArea}>
          {posState === "success" ? (
            /* Success state: green checkmark scales in */
            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 14 }}
              style={styles.successCircle}
            >
              <Ionicons name="checkmark" size={52} color={Colors.white} />
            </MotiView>
          ) : (
            /* NFC pulse rings */
            <View style={styles.nfcRings}>
              {/* Ring 1 */}
              <MotiView
                from={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ loop: true, duration: 1500, type: "timing" }}
                style={[styles.ring, { backgroundColor: Colors.brand.primary + "30" }]}
              />
              {/* Ring 2 */}
              <MotiView
                from={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ loop: true, duration: 1500, type: "timing", delay: 500 }}
                style={[styles.ring, { backgroundColor: Colors.brand.primary + "20" }]}
              />
              {/* Ring 3 */}
              <MotiView
                from={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ loop: true, duration: 1500, type: "timing", delay: 1000 }}
                style={[styles.ring, { backgroundColor: Colors.brand.primary + "10" }]}
              />
              {/* Center NFC icon */}
              <View style={styles.nfcIcon}>
                <Ionicons
                  name="radio"
                  size={44}
                  color={posState === "waiting" ? Colors.accent.amber : Colors.brand.primary}
                />
              </View>
            </View>
          )}

          <MotiView
            key={posState}
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300 }}
          >
            <Text
              style={[styles.nfcTitle, posState === "success" && { color: Colors.accent.green }]}
            >
              {posState === "ready"
                ? "Ready to Accept Payment"
                : posState === "waiting"
                  ? "Waiting for Card / Phone..."
                  : "Payment Successful!"}
            </Text>
            <Text style={styles.nfcSub}>
              {posState === "ready"
                ? "Tap customer's card or phone"
                : posState === "waiting"
                  ? "Hold device near card or phone"
                  : `AED ${Number(amount).toFixed(2)} received`}
            </Text>
          </MotiView>
        </View>

        {/* Action Buttons */}
        <View style={styles.btnRow}>
          {posState === "ready" && (
            <Pressable
              onPress={handleSimulateTap}
              style={({ pressed }) => [
                styles.primaryBtn,
                (!amount || Number(amount) <= 0) && styles.btnDisabled,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Ionicons name="radio-outline" size={20} color={Colors.white} />
              <Text style={styles.primaryBtnText}>Simulate Tap</Text>
            </Pressable>
          )}
          {posState === "waiting" && (
            <Pressable onPress={handleReset} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </Pressable>
          )}
          {posState === "success" && (
            <Pressable onPress={handleReset} style={styles.primaryBtn}>
              <Ionicons name="refresh" size={18} color={Colors.white} />
              <Text style={styles.primaryBtnText}>New Payment</Text>
            </Pressable>
          )}
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Recent Transactions</Text>
          {recentTransactions.map((tx, i) => (
            <MotiView
              key={tx.id}
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: i * 80, type: "timing", duration: 300 }}
            >
              <View style={styles.txRow}>
                <View
                  style={[
                    styles.txIcon,
                    {
                      backgroundColor:
                        tx.status === "completed"
                          ? Colors.accent.greenSoft
                          : (Colors.accent.redSoft ?? "#FBE3E5"),
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
                  <Text style={styles.txAmount}>AED {tx.amount.toFixed(2)}</Text>
                  <Text style={styles.txTime}>{tx.time}</Text>
                </View>
                <View
                  style={[
                    styles.txBadge,
                    {
                      backgroundColor:
                        tx.status === "completed" ? Colors.accent.greenSoft : "#FBE3E5",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.txBadgeText,
                      {
                        color: tx.status === "completed" ? Colors.accent.green : Colors.accent.red,
                      },
                    ]}
                  >
                    {tx.status === "completed" ? "Paid" : "Declined"}
                  </Text>
                </View>
              </View>
            </MotiView>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const RING_SIZE = 140;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 18 },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginBottom: 32,
    shadowColor: "#101225",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currencyPrefix: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.brand.primary,
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    color: Colors.ink[900],
    paddingVertical: 12,
  },

  nfcArea: {
    alignItems: "center",
    marginBottom: 32,
  },
  nfcRings: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  ring: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
  },
  nfcIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accent.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  nfcTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.ink[900],
    textAlign: "center",
    marginBottom: 6,
  },
  nfcSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.ink[500],
    textAlign: "center",
  },

  btnRow: {
    marginBottom: 32,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.brand.primary,
    borderRadius: 14,
    paddingVertical: 14,
  },
  btnDisabled: {
    backgroundColor: Colors.ink[300],
  },
  primaryBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.white,
  },
  secondaryBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
  },
  secondaryBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.ink[700],
  },

  recentSection: { marginTop: 4 },
  recentTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
    marginBottom: 12,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#101225",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txAmount: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[900],
  },
  txTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.ink[500],
    marginTop: 2,
  },
  txBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  txBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
});
