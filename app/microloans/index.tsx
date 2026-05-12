import { useState } from "react";
import {
  View, Text, Pressable, ScrollView, StyleSheet, StatusBar, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Colors } from "@/theme/colors";

type LoanStatus = "active" | "pending" | "completed" | "overdue" | "rejected";

type Loan = {
  id: string;
  amount: number;
  remainingBalance: number;
  monthlyPayment: number;
  interestRate: number;
  term: number; // months
  startDate: string;
  nextDueDate: string;
  status: LoanStatus;
  lateFees: number;
  gracePeriodDays: number;
  autoDebit: boolean;
};

type CreditScore = {
  score: number;
  maxLoan: number;
  factors: { label: string; impact: "positive" | "negative" | "neutral"; value: string }[];
};

const creditScore: CreditScore = {
  score: 720,
  maxLoan: 5000,
  factors: [
    { label: "Wallet Activity", impact: "positive", value: "High (200+ transactions)" },
    { label: "Repayment History", impact: "positive", value: "100% on-time" },
    { label: "Account Age", impact: "neutral", value: "8 months" },
    { label: "Average Balance", impact: "positive", value: "$2,400" },
    { label: "Frequency of Use", impact: "positive", value: "Daily user" },
  ],
};

const sampleLoans: Loan[] = [
  {
    id: "l1", amount: 2000, remainingBalance: 1200, monthlyPayment: 220, interestRate: 5,
    term: 10, startDate: new Date(Date.now() - 86400000 * 120).toISOString(),
    nextDueDate: new Date(Date.now() + 86400000 * 15).toISOString(),
    status: "active", lateFees: 0, gracePeriodDays: 5, autoDebit: true,
  },
  {
    id: "l2", amount: 500, remainingBalance: 0, monthlyPayment: 175, interestRate: 3,
    term: 3, startDate: new Date(Date.now() - 86400000 * 200).toISOString(),
    nextDueDate: "", status: "completed", lateFees: 0, gracePeriodDays: 5, autoDebit: true,
  },
  {
    id: "l3", amount: 1500, remainingBalance: 1500, monthlyPayment: 0, interestRate: 4.5,
    term: 6, startDate: "", nextDueDate: "", status: "pending", lateFees: 0,
    gracePeriodDays: 5, autoDebit: false,
  },
];

const loanOffers = [
  { amount: 500, term: 3, rate: 3, monthly: 172 },
  { amount: 1000, term: 6, rate: 4, monthly: 174 },
  { amount: 2500, term: 12, rate: 5, monthly: 220 },
  { amount: 5000, term: 18, rate: 5.5, monthly: 295 },
];

export default function MicroloansScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"overview" | "apply" | "history">("overview");
  const [loans, setLoans] = useState(sampleLoans);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showApply, setShowApply] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<typeof loanOffers[0] | null>(null);

  const activeLoan = loans.find((l) => l.status === "active");
  const scoreColor = creditScore.score >= 700 ? Colors.accent.green : creditScore.score >= 500 ? Colors.accent.amber : Colors.accent.red;

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="dark-content" />
      <Header title="Microloans" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Credit Score Card */}
        <View style={styles.scoreCard}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={styles.scoreValue}>{creditScore.score}</Text>
            <Text style={styles.scoreLabel}>Credit Score</Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreTitle}>Your Credit Profile</Text>
            <Text style={styles.scoreSub}>Based on wallet activity and history</Text>
            <View style={styles.maxLoanRow}>
              <Ionicons name="wallet" size={16} color={Colors.brand.primary} />
              <Text style={styles.maxLoanText}>Max loan: <Text style={{ fontFamily: "Inter_700Bold" }}>${creditScore.maxLoan.toLocaleString()}</Text></Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(["overview", "apply", "history"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tabChip, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Overview */}
        {tab === "overview" && (
          <View style={styles.section}>
            {activeLoan ? (
              <View style={styles.activeLoanCard}>
                <Text style={styles.activeLoanTitle}>Active Loan</Text>
                <View style={styles.loanAmountRow}>
                  <View>
                    <Text style={styles.loanBigLabel}>Remaining</Text>
                    <Text style={styles.loanBigValue}>${activeLoan.remainingBalance.toLocaleString()}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.loanBigLabel}>Original</Text>
                    <Text style={styles.loanOriginal}>${activeLoan.amount.toLocaleString()}</Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${((activeLoan.amount - activeLoan.remainingBalance) / activeLoan.amount) * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {(((activeLoan.amount - activeLoan.remainingBalance) / activeLoan.amount) * 100).toFixed(0)}% repaid
                </Text>

                <View style={styles.loanDetails}>
                  <View style={styles.loanDetailItem}>
                    <Text style={styles.loanDetailLabel}>Monthly Payment</Text>
                    <Text style={styles.loanDetailValue}>${activeLoan.monthlyPayment}</Text>
                  </View>
                  <View style={styles.loanDetailItem}>
                    <Text style={styles.loanDetailLabel}>Next Due</Text>
                    <Text style={styles.loanDetailValue}>{new Date(activeLoan.nextDueDate).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.loanDetailItem}>
                    <Text style={styles.loanDetailLabel}>Interest Rate</Text>
                    <Text style={styles.loanDetailValue}>{activeLoan.interestRate}%</Text>
                  </View>
                  <View style={styles.loanDetailItem}>
                    <Text style={styles.loanDetailLabel}>Auto-Debit</Text>
                    <Text style={[styles.loanDetailValue, { color: activeLoan.autoDebit ? Colors.accent.green : Colors.accent.red }]}>
                      {activeLoan.autoDebit ? "Enabled" : "Disabled"}
                    </Text>
                  </View>
                </View>

                {activeLoan.lateFees > 0 && (
                  <View style={styles.lateFeeRow}>
                    <Ionicons name="warning" size={16} color={Colors.accent.red} />
                    <Text style={styles.lateFeeText}>Late fees: ${activeLoan.lateFees}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.noLoanCard}>
                <Ionicons name="cash" size={40} color={Colors.brand.primary} />
                <Text style={styles.noLoanTitle}>No Active Loans</Text>
                <Text style={styles.noLoanSub}>Apply for a microloan based on your wallet activity</Text>
                <Button title="Apply Now" onPress={() => setTab("apply")} size="md" style={{ marginTop: 16, paddingHorizontal: 20 }} />
              </View>
            )}

            {/* Credit Factors */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Credit Factors</Text>
            {creditScore.factors.map((f, i) => (
              <View key={i} style={styles.factorRow}>
                <Ionicons
                  name={f.impact === "positive" ? "arrow-up-circle" : f.impact === "negative" ? "arrow-down-circle" : "remove-circle"}
                  size={20}
                  color={f.impact === "positive" ? Colors.accent.green : f.impact === "negative" ? Colors.accent.red : Colors.ink[400]}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.factorLabel}>{f.label}</Text>
                  <Text style={styles.factorValue}>{f.value}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Apply */}
        {tab === "apply" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Loan Offers</Text>
            <Text style={styles.sectionSub}>Based on your credit score of {creditScore.score}</Text>
            {loanOffers.map((offer) => (
              <Pressable
                key={offer.amount}
                onPress={() => setSelectedOffer(offer)}
                style={[styles.offerCard, selectedOffer?.amount === offer.amount && styles.offerSelected]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <Text style={styles.offerAmount}>${offer.amount.toLocaleString()}</Text>
                  <View style={styles.offerTermBadge}>
                    <Text style={styles.offerTermText}>{offer.term} months</Text>
                  </View>
                </View>
                <View style={styles.offerGrid}>
                  <View style={styles.offerGridItem}>
                    <Text style={styles.offerGridLabel}>Monthly</Text>
                    <Text style={styles.offerGridValue}>${offer.monthly}/mo</Text>
                  </View>
                  <View style={styles.offerGridItem}>
                    <Text style={styles.offerGridLabel}>Interest</Text>
                    <Text style={styles.offerGridValue}>{offer.rate}%</Text>
                  </View>
                  <View style={styles.offerGridItem}>
                    <Text style={styles.offerGridLabel}>Total Repay</Text>
                    <Text style={styles.offerGridValue}>${(offer.monthly * offer.term).toLocaleString()}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
            {selectedOffer && (
              <Button
                title={`Apply for $${selectedOffer.amount.toLocaleString()}`}
                onPress={() => {
                  const newLoan: Loan = {
                    id: `l-${Date.now()}`, amount: selectedOffer.amount, remainingBalance: selectedOffer.amount,
                    monthlyPayment: selectedOffer.monthly, interestRate: selectedOffer.rate, term: selectedOffer.term,
                    startDate: "", nextDueDate: "", status: "pending", lateFees: 0, gracePeriodDays: 5, autoDebit: true,
                  };
                  setLoans([newLoan, ...loans]);
                  setSelectedOffer(null);
                  setTab("overview");
                }}
                style={{ marginTop: 12 }}
              />
            )}

            {/* Terms */}
            <View style={styles.termsCard}>
              <Text style={styles.termsTitle}>Loan Terms</Text>
              <View style={styles.termsRow}><Ionicons name="time" size={14} color={Colors.ink[500]} /><Text style={styles.termsText}>Grace period: 5 days after due date</Text></View>
              <View style={styles.termsRow}><Ionicons name="warning" size={14} color={Colors.accent.amber} /><Text style={styles.termsText}>Late fee: 2% of monthly payment per day</Text></View>
              <View style={styles.termsRow}><Ionicons name="card" size={14} color={Colors.ink[500]} /><Text style={styles.termsText}>Auto-debit from wallet on due date</Text></View>
              <View style={styles.termsRow}><Ionicons name="document-text" size={14} color={Colors.ink[500]} /><Text style={styles.termsText}>Full ledger support for regulators</Text></View>
            </View>
          </View>
        )}

        {/* History */}
        {tab === "history" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loan History</Text>
            {loans.map((l) => (
              <View key={l.id} style={styles.histCard}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.histAmount}>${l.amount.toLocaleString()}</Text>
                    <Text style={styles.histMeta}>{l.term} months · {l.interestRate}% interest</Text>
                  </View>
                  <View style={[styles.histBadge, {
                    backgroundColor: l.status === "active" ? Colors.accent.greenSoft :
                      l.status === "completed" ? Colors.ink[100] :
                      l.status === "overdue" ? Colors.accent.redSoft : "#FFF3E0"
                  }]}>
                    <Text style={[styles.histBadgeText, {
                      color: l.status === "active" ? Colors.accent.green :
                        l.status === "overdue" ? Colors.accent.red : Colors.ink[600]
                    }]}>
                      {l.status}
                    </Text>
                  </View>
                </View>
                {l.status === "active" && (
                  <View style={styles.histProgress}>
                    <View style={[styles.histProgressFill, { width: `${((l.amount - l.remainingBalance) / l.amount) * 100}%` }]} />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scoreCard: { marginHorizontal: 18, backgroundColor: Colors.white, borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", gap: 18, shadowColor: "#101225", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  scoreCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, alignItems: "center", justifyContent: "center" },
  scoreValue: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.ink[900] },
  scoreLabel: { fontFamily: "Inter_400Regular", fontSize: 9, color: Colors.ink[500] },
  scoreInfo: { flex: 1 },
  scoreTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.ink[900] },
  scoreSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], marginTop: 2 },
  maxLoanRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, backgroundColor: Colors.brand.primary50, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  maxLoanText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.brand.primary },
  tabRow: { flexDirection: "row", paddingHorizontal: 18, gap: 8, marginTop: 16 },
  tabChip: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.white, alignItems: "center", borderWidth: 1, borderColor: Colors.ink[200] },
  tabActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  tabText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.ink[600] },
  tabTextActive: { color: Colors.white },
  section: { paddingHorizontal: 18, marginTop: 16 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.ink[900], marginBottom: 8 },
  sectionSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], marginBottom: 12 },
  activeLoanCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 18, shadowColor: "#101225", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  activeLoanTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[600], marginBottom: 12 },
  loanAmountRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  loanBigLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500] },
  loanBigValue: { fontFamily: "Inter_700Bold", fontSize: 26, color: Colors.brand.primary, marginTop: 2 },
  loanOriginal: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.ink[400], marginTop: 2 },
  progressBar: { height: 8, borderRadius: 4, backgroundColor: Colors.ink[100] },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: Colors.accent.green },
  progressText: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500], marginTop: 6, textAlign: "right" },
  loanDetails: { flexDirection: "row", flexWrap: "wrap", marginTop: 14 },
  loanDetailItem: { width: "50%", marginBottom: 12 },
  loanDetailLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500] },
  loanDetailValue: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900], marginTop: 2 },
  lateFeeRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: Colors.accent.redSoft, borderRadius: 10, padding: 10, marginTop: 8 },
  lateFeeText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.accent.red },
  noLoanCard: { alignItems: "center", backgroundColor: Colors.white, borderRadius: 18, padding: 24 },
  noLoanTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.ink[900], marginTop: 12 },
  noLoanSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[500], marginTop: 6, textAlign: "center" },
  factorRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 6 },
  factorLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.ink[900] },
  factorValue: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], marginTop: 2 },
  offerCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: "transparent" },
  offerSelected: { borderColor: Colors.brand.primary, backgroundColor: Colors.brand.primary + "06" },
  offerAmount: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.ink[900], flex: 1 },
  offerTermBadge: { backgroundColor: Colors.brand.primary50, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  offerTermText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.brand.primary },
  offerGrid: { flexDirection: "row", justifyContent: "space-between", backgroundColor: Colors.ink[50], borderRadius: 10, padding: 10 },
  offerGridItem: { alignItems: "center" },
  offerGridLabel: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.ink[500] },
  offerGridValue: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.ink[900], marginTop: 2 },
  termsCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginTop: 16 },
  termsTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900], marginBottom: 10 },
  termsRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  termsText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[600] },
  histCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10 },
  histAmount: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.ink[900] },
  histMeta: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], marginTop: 2 },
  histBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  histBadgeText: { fontFamily: "Inter_500Medium", fontSize: 11, textTransform: "capitalize" },
  histProgress: { height: 6, borderRadius: 3, backgroundColor: Colors.ink[100], marginTop: 10 },
  histProgressFill: { height: 6, borderRadius: 3, backgroundColor: Colors.accent.green },
});
