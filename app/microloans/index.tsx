import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Colors } from "@/theme/colors";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Loan = {
  id: string;
  purpose: string;
  amount: number;
  remaining: number;
  nextDue: string;
  term: string;
  interest: number;
  isPaid: boolean;
};

// ─── Seed data ─────────────────────────────────────────────────────────────────
const INITIAL_LOANS: Loan[] = [
  {
    id: "l1",
    purpose: "Medical Expenses",
    amount: 200,
    remaining: 120,
    nextDue: new Date(Date.now() + 86400000 * 8).toISOString(),
    term: "1 month",
    interest: 10,
    isPaid: false,
  },
  {
    id: "l2",
    purpose: "School Supplies",
    amount: 100,
    remaining: 100,
    nextDue: new Date(Date.now() + 86400000 * 14).toISOString(),
    term: "2 weeks",
    interest: 5,
    isPaid: false,
  },
];

const AMOUNT_CHIPS = [50, 100, 200, 500];
const TERM_CHIPS = ["2 weeks", "1 month", "3 months"];
const INTEREST_RATE = 0.05; // 5% flat

// ─── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ pct }: { pct: number }) {
  return (
    <View style={styles.progressTrack}>
      <MotiView
        from={{ width: "0%" }}
        animate={{ width: `${Math.min(pct, 100)}%` as any }}
        transition={{ type: "timing", duration: 600 }}
        style={styles.progressFill}
      />
    </View>
  );
}

// ─── Loan card ─────────────────────────────────────────────────────────────────
function LoanCard({
  loan,
  index,
  onPayNow,
}: {
  loan: Loan;
  index: number;
  onPayNow: (id: string) => void;
}) {
  const repaidPct = ((loan.amount - loan.remaining) / loan.amount) * 100;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 320, delay: index * 80 }}
      style={styles.loanCard}
    >
      <View style={styles.loanCardTop}>
        <View style={styles.loanIconWrap}>
          <Ionicons name="cash-outline" size={20} color={Colors.brand.primary} />
        </View>
        <View style={styles.loanCardInfo}>
          <Text style={styles.loanPurpose}>{loan.purpose}</Text>
          <Text style={styles.loanMeta}>
            {loan.term} · {loan.interest}% interest
          </Text>
        </View>
        <View style={[styles.loanBadge, loan.isPaid && styles.loanBadgePaid]}>
          <Text style={[styles.loanBadgeText, loan.isPaid && styles.loanBadgeTextPaid]}>
            {loan.isPaid ? "Paid" : "Active"}
          </Text>
        </View>
      </View>

      <View style={styles.loanAmountRow}>
        <View>
          <Text style={styles.loanAmountLabel}>Remaining</Text>
          <Text style={styles.loanAmountValue}>${loan.remaining.toFixed(2)}</Text>
        </View>
        <View style={styles.loanAmountDivider} />
        <View>
          <Text style={styles.loanAmountLabel}>Original</Text>
          <Text style={styles.loanAmountOriginal}>${loan.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.loanAmountDivider} />
        <View>
          <Text style={styles.loanAmountLabel}>Next Due</Text>
          <Text style={styles.loanAmountMeta}>
            {new Date(loan.nextDue).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>

      <ProgressBar pct={repaidPct} />
      <Text style={styles.progressLabel}>{repaidPct.toFixed(0)}% repaid</Text>

      {!loan.isPaid && (
        <Pressable
          onPress={() => onPayNow(loan.id)}
          style={styles.payNowBtn}
        >
          <Ionicons name="checkmark-circle-outline" size={16} color={Colors.white} />
          <Text style={styles.payNowText}>Pay Now</Text>
        </Pressable>
      )}
    </MotiView>
  );
}

// ─── Apply Modal ───────────────────────────────────────────────────────────────
function ApplyModal({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (loan: Loan) => void;
}) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  const interest = selectedAmount ? selectedAmount * INTEREST_RATE : 0;
  const total = selectedAmount ? selectedAmount + interest : 0;
  const canConfirm = selectedAmount !== null && selectedTerm !== null;

  function getDueDateForTerm(term: string): string {
    const days = term === "2 weeks" ? 14 : term === "1 month" ? 30 : 90;
    return new Date(Date.now() + 86400000 * days).toISOString();
  }

  function handleConfirm() {
    if (!selectedAmount || !selectedTerm) return;
    const loan: Loan = {
      id: `l-${Date.now()}`,
      purpose: "New Microloan",
      amount: selectedAmount,
      remaining: selectedAmount,
      nextDue: getDueDateForTerm(selectedTerm),
      term: selectedTerm,
      interest: selectedAmount * INTEREST_RATE,
      isPaid: false,
    };
    onConfirm(loan);
    setSelectedAmount(null);
    setSelectedTerm(null);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Apply for a Loan</Text>

          {/* Amount chips */}
          <Text style={styles.modalLabel}>Loan Amount</Text>
          <View style={styles.amountChipRow}>
            {AMOUNT_CHIPS.map((amt) => (
              <Pressable
                key={amt}
                onPress={() => setSelectedAmount(amt)}
                style={[styles.amountChip, selectedAmount === amt && styles.amountChipActive]}
              >
                <Text
                  style={[
                    styles.amountChipText,
                    selectedAmount === amt && styles.amountChipTextActive,
                  ]}
                >
                  ${amt}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Term chips */}
          <Text style={styles.modalLabel}>Repayment Term</Text>
          <View style={styles.termChipRow}>
            {TERM_CHIPS.map((term) => (
              <Pressable
                key={term}
                onPress={() => setSelectedTerm(term)}
                style={[styles.termChip, selectedTerm === term && styles.termChipActive]}
              >
                <Text
                  style={[
                    styles.termChipText,
                    selectedTerm === term && styles.termChipTextActive,
                  ]}
                >
                  {term}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Summary */}
          {selectedAmount && (
            <MotiView
              from={{ opacity: 0, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 260 }}
              style={styles.summaryBox}
            >
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Principal</Text>
                <Text style={styles.summaryValue}>${selectedAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Interest (5% flat)</Text>
                <Text style={styles.summaryValue}>${interest.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Total Repayment</Text>
                <Text style={styles.summaryTotalValue}>${total.toFixed(2)}</Text>
              </View>
            </MotiView>
          )}

          <Button
            title="Confirm & Apply"
            onPress={handleConfirm}
            disabled={!canConfirm}
            style={styles.confirmBtn}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function MicroloansScreen() {
  const insets = useSafeAreaInsets();
  const [loans, setLoans] = useState<Loan[]>(INITIAL_LOANS);
  const [showApply, setShowApply] = useState(false);

  // Gauge calc: 742/850
  const score = 742;
  const maxScore = 850;
  const scorePct = (score / maxScore) * 100;

  function handlePayNow(id: string) {
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        // Reduce remaining by one "payment" (remaining / installments approx)
        const payment = parseFloat((l.remaining * 0.5).toFixed(2));
        const newRemaining = Math.max(0, l.remaining - payment);
        return { ...l, remaining: newRemaining, isPaid: newRemaining === 0 };
      })
    );
  }

  function handleAddLoan(loan: Loan) {
    setLoans((prev) => [loan, ...prev]);
    setShowApply(false);
  }

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="light-content" />
      <Header title="Microloans" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* Credit Score Card */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
          style={styles.scoreCardWrap}
        >
          <LinearGradient
            colors={[Colors.brand.gradientStart, Colors.brand.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreCard}
          >
            {/* Gauge arc (simplified visual) */}
            <View style={styles.gaugeArea}>
              <View style={styles.gaugeOuter}>
                <View style={styles.gaugeInner}>
                  <Text style={styles.gaugeScore}>{score}</Text>
                  <Text style={styles.gaugeMax}>/ {maxScore}</Text>
                </View>
              </View>
              {/* Progress fill strip */}
              <View style={styles.gaugeBar}>
                <View style={[styles.gaugeFill, { width: `${scorePct}%` }]} />
              </View>
            </View>

            <View style={styles.scoreDetails}>
              <View style={styles.scoreLabelRow}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.scoreRating}>Good Credit</Text>
              </View>
              <Text style={styles.scoreEligibility}>Up to USD 500</Text>
              <Text style={styles.scoreEligibilityLabel}>Eligible loan amount</Text>
            </View>
          </LinearGradient>
        </MotiView>

        {/* Apply button */}
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 380, delay: 100 }}
          style={styles.applyBtnWrap}
        >
          <Button
            title="Apply for a Loan"
            onPress={() => setShowApply(true)}
          />
        </MotiView>

        {/* Active loans */}
        <Text style={styles.sectionTitle}>Active Loans</Text>
        {loans.map((loan, i) => (
          <LoanCard key={loan.id} loan={loan} index={i} onPayNow={handlePayNow} />
        ))}

        {loans.length === 0 && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 300 }}
            style={styles.emptyCard}
          >
            <Ionicons name="cash-outline" size={36} color={Colors.ink[300]} />
            <Text style={styles.emptyText}>No active loans. Apply for one above!</Text>
          </MotiView>
        )}
      </ScrollView>

      <ApplyModal
        visible={showApply}
        onClose={() => setShowApply(false)}
        onConfirm={handleAddLoan}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  /* Credit Score Card */
  scoreCardWrap: {
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: Colors.brand.gradientEnd,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  scoreCard: {
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  gaugeArea: {
    alignItems: "center",
  },
  gaugeOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 6,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  gaugeInner: {
    alignItems: "center",
  },
  gaugeScore: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.white,
    lineHeight: 26,
  },
  gaugeMax: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
  },
  gaugeBar: {
    width: 88,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  gaugeFill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "#FFD700",
  },
  scoreDetails: {
    flex: 1,
  },
  scoreLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  scoreRating: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: Colors.white,
  },
  scoreEligibility: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.white,
    marginBottom: 2,
  },
  scoreEligibilityLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  applyBtnWrap: {
    marginBottom: 20,
  },
  /* Section */
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
    marginBottom: 12,
  },
  /* Loan card */
  loanCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.ink[900],
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  loanCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  loanIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
  },
  loanCardInfo: {
    flex: 1,
  },
  loanPurpose: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[900],
  },
  loanMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    marginTop: 2,
  },
  loanBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: Colors.brand.primary50,
  },
  loanBadgePaid: {
    backgroundColor: Colors.accent.greenSoft,
  },
  loanBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.brand.primary,
  },
  loanBadgeTextPaid: {
    color: Colors.accent.green,
  },
  loanAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface.background,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 8,
  },
  loanAmountLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: Colors.ink[500],
  },
  loanAmountValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.brand.primary,
    marginTop: 2,
  },
  loanAmountOriginal: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[600],
    marginTop: 2,
  },
  loanAmountMeta: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.ink[800],
    marginTop: 2,
  },
  loanAmountDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.ink[200],
    marginHorizontal: 6,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.ink[100],
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent.green,
  },
  progressLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.ink[500],
    textAlign: "right",
    marginTop: 4,
    marginBottom: 10,
  },
  payNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: Colors.brand.primary,
    paddingVertical: 11,
    borderRadius: 12,
  },
  payNowText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.white,
  },
  /* Empty state */
  emptyCard: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 28,
    gap: 10,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.ink[500],
    textAlign: "center",
  },
  /* Apply Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.surface.overlay,
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ink[200],
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.ink[900],
    marginBottom: 20,
  },
  modalLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.ink[600],
    marginBottom: 10,
  },
  amountChipRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  amountChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  amountChipActive: {
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.brand.primary50,
  },
  amountChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[600],
  },
  amountChipTextActive: {
    color: Colors.brand.primary,
  },
  termChipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  termChip: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  termChipActive: {
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.brand.primary50,
  },
  termChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.ink[600],
  },
  termChipTextActive: {
    color: Colors.brand.primary,
  },
  /* Loan summary */
  summaryBox: {
    backgroundColor: Colors.surface.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.ink[600],
  },
  summaryValue: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.ink[800],
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.ink[200],
    paddingTop: 8,
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[900],
  },
  summaryTotalValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.brand.primary,
  },
  confirmBtn: {
    marginTop: 4,
  },
});
