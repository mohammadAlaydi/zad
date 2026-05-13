import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useState } from "react";
import { View, Text, Pressable, ScrollView, Modal, TextInput, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/appStore";
import type { BNPLInstallment, Currency } from "@/store/appStore";
import { Colors } from "@/theme/colors";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function statusColor(s: BNPLInstallment["status"]) {
  if (s === "overdue") return Colors.accent.red;
  if (s === "completed") return Colors.accent.green;
  return Colors.brand.primary;
}
function statusBg(s: BNPLInstallment["status"]) {
  if (s === "overdue") return Colors.accent.redSoft;
  if (s === "completed") return Colors.accent.greenSoft;
  return Colors.brand.primary50;
}

// ─── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ pct }: { pct: number }) {
  const p = Math.min(Math.max(pct, 0), 100);
  return (
    <View style={pb.track}>
      <MotiView
        from={{ width: "0%" }}
        animate={{ width: `${p}%` as any }}
        transition={{ type: "timing", duration: 600, delay: 150 }}
        style={[
          pb.fill,
          { backgroundColor: p >= 100 ? Colors.accent.green : Colors.brand.primary },
        ]}
      />
    </View>
  );
}
const pb = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: Colors.ink[100],
    borderRadius: 3,
    overflow: "hidden",
    marginVertical: 8,
  },
  fill: { height: "100%", borderRadius: 3 },
});

// ─── Installment card ──────────────────────────────────────────────────────────
function InstallmentCard({
  item,
  index,
  onRepay,
}: {
  item: BNPLInstallment;
  index: number;
  onRepay: () => void;
}) {
  const pct = Math.round((item.paidCount / item.installments) * 100);
  const remaining = item.installments - item.paidCount;
  const isCompleted = item.status === "completed" || item.paidCount >= item.installments;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 60, type: "timing", duration: 320 }}
      style={card.wrap}
    >
      {/* Top row */}
      <View style={card.topRow}>
        <View style={card.merchantIcon}>
          <Ionicons name="storefront-outline" size={20} color={Colors.brand.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={card.merchant}>{item.merchantName}</Text>
          <Text style={card.totalAmt}>
            Total: {item.currency} {item.totalAmount.toLocaleString()}
          </Text>
        </View>
        <View style={[card.badge, { backgroundColor: statusBg(item.status) }]}>
          <Text style={[card.badgeText, { color: statusColor(item.status) }]}>
            {isCompleted ? "Paid" : item.status === "overdue" ? "Overdue" : "Active"}
          </Text>
        </View>
      </View>

      <ProgressBar pct={pct} />

      {/* Stats row */}
      <View style={card.statsRow}>
        <View style={card.statBlock}>
          <Text style={card.statValue}>
            {item.paidCount}/{item.installments}
          </Text>
          <Text style={card.statLabel}>Installments</Text>
        </View>
        <View style={card.statDivider} />
        <View style={card.statBlock}>
          <Text style={card.statValue}>
            {item.currency} {item.amountPerInstallment.toFixed(2)}
          </Text>
          <Text style={card.statLabel}>Per Payment</Text>
        </View>
        <View style={card.statDivider} />
        <View style={card.statBlock}>
          <Text style={card.statValue}>
            {new Date(item.nextDueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Text>
          <Text style={card.statLabel}>Next Due</Text>
        </View>
      </View>

      {item.lateFee > 0 && item.status === "overdue" && (
        <View style={card.lateFeeRow}>
          <Ionicons name="warning-outline" size={13} color={Colors.accent.red} />
          <Text style={card.lateFeeText}>
            Late fee: {item.currency} {item.lateFee.toFixed(2)}
          </Text>
        </View>
      )}

      {!isCompleted && (
        <Pressable onPress={onRepay} style={card.repayBtn}>
          <Ionicons name="checkmark-circle-outline" size={15} color={Colors.white} />
          <Text style={card.repayBtnText}>
            Pay {item.currency} {item.amountPerInstallment.toFixed(2)} now ({remaining} left)
          </Text>
        </Pressable>
      )}
    </MotiView>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.ink[900],
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  merchantIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
  },
  merchant: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.ink[900] },
  totalAmt: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface.background,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  statBlock: { flex: 1, alignItems: "center" },
  statValue: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500], marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.ink[200] },
  lateFeeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.accent.redSoft,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  lateFeeText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.accent.red },
  repayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: Colors.brand.primary,
    paddingVertical: 11,
    borderRadius: 12,
  },
  repayBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.white },
});

// ─── New BNPL Modal ────────────────────────────────────────────────────────────
function NewBNPLModal({
  visible,
  onClose,
  onAdd,
  currency,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: BNPLInstallment) => void;
  currency: Currency;
}) {
  const [merchant, setMerchant] = useState("");
  const [total, setTotal] = useState("");
  const [installments, setInstallments] = useState("3");

  const totalNum = parseFloat(total) || 0;
  const instNum = parseInt(installments) || 3;
  const perInstallment = instNum > 0 ? totalNum / instNum : 0;
  const canSubmit = merchant.trim().length > 0 && totalNum > 0 && instNum >= 2;

  function handleAdd() {
    const now = new Date();
    const nextDue = new Date(now);
    nextDue.setMonth(nextDue.getMonth() + 1);
    onAdd({
      id: "bnpl-" + Date.now(),
      merchantName: merchant.trim(),
      totalAmount: totalNum,
      installments: instNum,
      paidCount: 0,
      amountPerInstallment: perInstallment,
      nextDueDate: nextDue.toISOString(),
      currency,
      lateFee: 0,
      status: "active",
    });
    setMerchant("");
    setTotal("");
    setInstallments("3");
    onClose();
  }

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={nm.overlay} onPress={onClose}>
        <Pressable style={nm.sheet} onPress={() => {}}>
          <View style={nm.handle} />
          <Text style={nm.title}>New BNPL Purchase</Text>

          <Text style={nm.label}>Merchant Name</Text>
          <TextInput
            style={nm.input}
            placeholder="e.g. Apple Store"
            placeholderTextColor={Colors.ink[300]}
            value={merchant}
            onChangeText={setMerchant}
          />

          <Text style={nm.label}>Total Amount ({currency})</Text>
          <TextInput
            style={nm.input}
            placeholder="0.00"
            placeholderTextColor={Colors.ink[300]}
            value={total}
            onChangeText={setTotal}
            keyboardType="decimal-pad"
          />

          <Text style={nm.label}>Number of Installments</Text>
          <View style={nm.installmentRow}>
            {[2, 3, 4, 6, 12].map((n) => (
              <Pressable
                key={n}
                onPress={() => setInstallments(String(n))}
                style={[nm.chip, instNum === n && nm.chipActive]}
              >
                <Text style={[nm.chipText, instNum === n && nm.chipTextActive]}>{n}x</Text>
              </Pressable>
            ))}
          </View>

          {totalNum > 0 && instNum > 0 && (
            <View style={nm.previewRow}>
              <Ionicons name="information-circle-outline" size={15} color={Colors.brand.primary} />
              <Text style={nm.previewText}>
                {currency} {perInstallment.toFixed(2)} × {instNum} monthly payments
              </Text>
            </View>
          )}

          <View style={nm.actions}>
            <Button
              title="Cancel"
              variant="secondary"
              size="md"
              onPress={onClose}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Add Plan"
              size="md"
              disabled={!canSubmit}
              onPress={handleAdd}
              style={{ flex: 1 }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const nm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.surface.overlay, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ink[200],
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.ink[900],
    marginBottom: 20,
  },
  label: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.ink[600], marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.ink[900],
    marginBottom: 16,
  },
  installmentRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
    alignItems: "center",
  },
  chipActive: { borderColor: Colors.brand.primary, backgroundColor: Colors.brand.primary50 },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.ink[500] },
  chipTextActive: { color: Colors.brand.primary },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.brand.primary50,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  previewText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.brand.primary },
  actions: { flexDirection: "row" },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function BNPLScreen() {
  const insets = useSafeAreaInsets();
  const { bnplInstallments, addBNPL, repayBNPL, activeCurrency, balances } = useApp();
  const [showModal, setShowModal] = useState(false);

  const totalOutstanding = bnplInstallments
    .filter((b) => b.status !== "completed" && b.paidCount < b.installments)
    .reduce((sum, b) => sum + (b.installments - b.paidCount) * b.amountPerInstallment, 0);

  const activeCount = bnplInstallments.filter(
    (b) => b.status === "active" || b.status === "overdue",
  ).length;

  return (
    <Screen bg={Colors.surface.background}>
      <Header title="Buy Now, Pay Later" />

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary card */}
        {bnplInstallments.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 380 }}
            style={s.summaryWrap}
          >
            <LinearGradient
              colors={[Colors.brand.gradientStart, Colors.brand.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.summaryCard}
            >
              <Text style={s.summaryLabel}>Total Outstanding</Text>
              <Text style={s.summaryAmount}>
                {activeCurrency}{" "}
                {totalOutstanding.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <View style={s.summaryRow}>
                <View style={s.summaryPill}>
                  <Ionicons name="card-outline" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={s.summaryPillText}>
                    {activeCount} active {activeCount === 1 ? "plan" : "plans"}
                  </Text>
                </View>
                <View style={s.summaryPill}>
                  <Ionicons name="wallet-outline" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={s.summaryPillText}>
                    Balance: {activeCurrency} {balances[activeCurrency].toLocaleString()}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </MotiView>
        )}

        {bnplInstallments.length === 0 ? (
          <MotiView
            from={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 400 }}
            style={s.empty}
          >
            <Text style={s.emptyEmoji}>🛒</Text>
            <Text style={s.emptyTitle}>No BNPL Plans Yet</Text>
            <Text style={s.emptySub}>
              Split any purchase into affordable monthly installments with zero setup fees.
            </Text>
            <Pressable onPress={() => setShowModal(true)} style={s.emptyBtn}>
              <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
              <Text style={s.emptyBtnText}>Add a Purchase</Text>
            </Pressable>
          </MotiView>
        ) : (
          <>
            <Text style={s.sectionTitle}>Your Plans</Text>
            {bnplInstallments.map((item, i) => (
              <InstallmentCard
                key={item.id}
                item={item}
                index={i}
                onRepay={() => repayBNPL(item.id)}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable onPress={() => setShowModal(true)} style={[s.fab, { bottom: insets.bottom + 24 }]}>
        <Ionicons name="add" size={28} color={Colors.white} />
      </Pressable>

      <NewBNPLModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addBNPL}
        currency={activeCurrency}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 18, paddingTop: 8 },
  summaryWrap: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.brand.gradientEnd,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  summaryCard: { padding: 22, borderRadius: 20 },
  summaryLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 6,
  },
  summaryAmount: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 30,
    color: Colors.white,
    marginBottom: 14,
  },
  summaryRow: { flexDirection: "row", gap: 8 },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  summaryPillText: { fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.9)" },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.ink[500],
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.ink[900],
    marginBottom: 8,
    textAlign: "center",
  },
  emptySub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.ink[500],
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  emptyBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.white },
  fab: {
    position: "absolute",
    right: 22,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
