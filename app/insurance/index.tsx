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

type InsuranceType = "life" | "health" | "business";
type PlanTier = "basic" | "standard" | "premium";
type PolicyStatus = "active" | "pending" | "expired" | "claimed";

type InsurancePlan = {
  id: string;
  type: InsuranceType;
  tier: PlanTier;
  name: string;
  monthlyPremium: number;
  coverageAmount: number;
  features: string[];
};

type Policy = {
  id: string;
  planId: string;
  planName: string;
  type: InsuranceType;
  status: PolicyStatus;
  startDate: string;
  expiryDate: string;
  monthlyPremium: number;
  totalPaid: number;
  coverageAmount: number;
  claimHistory: { id: string; amount: number; reason: string; status: string; date: string }[];
};

const plans: InsurancePlan[] = [
  // Life
  { id: "lp1", type: "life", tier: "basic", name: "Life Essentials", monthlyPremium: 5, coverageAmount: 10000, features: ["Accidental death cover", "Natural death cover", "Simple enrollment"] },
  { id: "lp2", type: "life", tier: "standard", name: "Life Shield", monthlyPremium: 12, coverageAmount: 30000, features: ["Full death coverage", "Disability cover", "Funeral expenses", "Family support benefit"] },
  { id: "lp3", type: "life", tier: "premium", name: "Life Complete", monthlyPremium: 25, coverageAmount: 75000, features: ["Full death coverage", "Critical illness", "Disability", "Education fund", "Investment return"] },
  // Health
  { id: "hp1", type: "health", tier: "basic", name: "Health Lite", monthlyPremium: 8, coverageAmount: 5000, features: ["Emergency hospitalization", "Basic lab tests", "GP consultations"] },
  { id: "hp2", type: "health", tier: "standard", name: "Health Plus", monthlyPremium: 18, coverageAmount: 15000, features: ["Hospitalization", "Specialist visits", "Prescriptions", "Lab tests", "Dental basic"] },
  { id: "hp3", type: "health", tier: "premium", name: "Health Max", monthlyPremium: 35, coverageAmount: 50000, features: ["Full hospitalization", "Surgery", "Mental health", "Dental & vision", "International coverage"] },
  // Business
  { id: "bp1", type: "business", tier: "basic", name: "Biz Starter", monthlyPremium: 15, coverageAmount: 20000, features: ["Inventory protection", "Basic liability", "Fire & theft"] },
  { id: "bp2", type: "business", tier: "standard", name: "Biz Guard", monthlyPremium: 30, coverageAmount: 50000, features: ["Inventory & equipment", "Liability", "Business interruption", "Employee injury"] },
  { id: "bp3", type: "business", tier: "premium", name: "Biz Complete", monthlyPremium: 55, coverageAmount: 150000, features: ["Full property", "Professional liability", "Cyber insurance", "Key person cover", "Legal expenses"] },
];

const samplePolicies: Policy[] = [
  {
    id: "pol1", planId: "hp2", planName: "Health Plus", type: "health", status: "active",
    startDate: new Date(Date.now() - 86400000 * 90).toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 275).toISOString(),
    monthlyPremium: 18, totalPaid: 54, coverageAmount: 15000,
    claimHistory: [
      { id: "cl1", amount: 350, reason: "GP Consultation", status: "approved", date: new Date(Date.now() - 86400000 * 30).toISOString() },
    ],
  },
];

const typeIcons: Record<InsuranceType, string> = { life: "heart", health: "medkit", business: "briefcase" };
const typeColors: Record<InsuranceType, string> = { life: Colors.accent.red, health: Colors.accent.green, business: Colors.brand.primary };
const tierColors: Record<PlanTier, string> = { basic: Colors.ink[500], standard: Colors.accent.amber, premium: "#E040FB" };

export default function InsuranceScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"plans" | "policies" | "claims">("plans");
  const [selectedType, setSelectedType] = useState<InsuranceType>("life");
  const [policies, setPolicies] = useState(samplePolicies);
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const filteredPlans = plans.filter((p) => p.type === selectedType);

  const enrollInPlan = (plan: InsurancePlan) => {
    const newPolicy: Policy = {
      id: `pol-${Date.now()}`, planId: plan.id, planName: plan.name, type: plan.type, status: "pending",
      startDate: new Date().toISOString(), expiryDate: new Date(Date.now() + 86400000 * 365).toISOString(),
      monthlyPremium: plan.monthlyPremium, totalPaid: 0, coverageAmount: plan.coverageAmount, claimHistory: [],
    };
    setPolicies([newPolicy, ...policies]);
    setSelectedPlan(null);
    setTab("policies");
  };

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="dark-content" />
      <Header title="Insurance" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Top Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.accent.green} />
            <Text style={styles.statVal}>{policies.filter((p) => p.status === "active").length}</Text>
            <Text style={styles.statLbl}>Active Policies</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash" size={20} color={Colors.brand.primary} />
            <Text style={styles.statVal}>${policies.reduce((s, p) => s + p.totalPaid, 0)}</Text>
            <Text style={styles.statLbl}>Total Paid</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="umbrella" size={20} color={Colors.accent.amber} />
            <Text style={styles.statVal}>${policies.reduce((s, p) => s + p.coverageAmount, 0).toLocaleString()}</Text>
            <Text style={styles.statLbl}>Coverage</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(["plans", "policies", "claims"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tabChip, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Plans */}
        {tab === "plans" && (
          <View style={styles.section}>
            {/* Type Selector */}
            <View style={styles.typeRow}>
              {(["life", "health", "business"] as const).map((type) => (
                <Pressable key={type} onPress={() => setSelectedType(type)} style={[styles.typeChip, selectedType === type && { backgroundColor: typeColors[type] + "18", borderColor: typeColors[type] }]}>
                  <Ionicons name={typeIcons[type] as any} size={18} color={selectedType === type ? typeColors[type] : Colors.ink[400]} />
                  <Text style={[styles.typeText, selectedType === type && { color: typeColors[type] }]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {filteredPlans.map((plan) => (
              <Pressable key={plan.id} onPress={() => setSelectedPlan(plan)} style={styles.planCard}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <View style={[styles.planIcon, { backgroundColor: typeColors[plan.type] + "18" }]}>
                    <Ionicons name={typeIcons[plan.type] as any} size={20} color={typeColors[plan.type]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={[styles.tierBadge, { backgroundColor: tierColors[plan.tier] + "18" }]}>
                      <Text style={[styles.tierText, { color: tierColors[plan.tier] }]}>{plan.tier}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.planPrice}>${plan.monthlyPremium}</Text>
                    <Text style={styles.planPriceUnit}>/month</Text>
                  </View>
                </View>
                <Text style={styles.planCoverage}>Coverage: up to ${plan.coverageAmount.toLocaleString()}</Text>
                <View style={styles.featList}>
                  {plan.features.slice(0, 3).map((f, i) => (
                    <View key={i} style={styles.featRow}>
                      <Ionicons name="checkmark" size={14} color={Colors.accent.green} />
                      <Text style={styles.featText}>{f}</Text>
                    </View>
                  ))}
                  {plan.features.length > 3 && (
                    <Text style={styles.moreFeat}>+{plan.features.length - 3} more features</Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Policies */}
        {tab === "policies" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Policies</Text>
            {policies.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="document-text" size={40} color={Colors.ink[300]} />
                <Text style={styles.emptyText}>No policies yet. Browse plans to get started.</Text>
              </View>
            ) : (
              policies.map((pol) => (
                <View key={pol.id} style={styles.policyCard}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                    <View style={[styles.planIcon, { backgroundColor: typeColors[pol.type] + "18" }]}>
                      <Ionicons name={typeIcons[pol.type] as any} size={20} color={typeColors[pol.type]} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.planName}>{pol.planName}</Text>
                      <Text style={styles.polDate}>Since {new Date(pol.startDate).toLocaleDateString()}</Text>
                    </View>
                    <View style={[styles.polStatusBadge, {
                      backgroundColor: pol.status === "active" ? Colors.accent.greenSoft : pol.status === "pending" ? "#FFF3E0" : Colors.ink[100]
                    }]}>
                      <Text style={styles.polStatusText}>{pol.status}</Text>
                    </View>
                  </View>
                  <View style={styles.polDetails}>
                    <View style={styles.polDetailItem}>
                      <Text style={styles.polDetailLabel}>Premium</Text>
                      <Text style={styles.polDetailValue}>${pol.monthlyPremium}/mo</Text>
                    </View>
                    <View style={styles.polDetailItem}>
                      <Text style={styles.polDetailLabel}>Coverage</Text>
                      <Text style={styles.polDetailValue}>${pol.coverageAmount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.polDetailItem}>
                      <Text style={styles.polDetailLabel}>Total Paid</Text>
                      <Text style={styles.polDetailValue}>${pol.totalPaid}</Text>
                    </View>
                    <View style={styles.polDetailItem}>
                      <Text style={styles.polDetailLabel}>Expires</Text>
                      <Text style={styles.polDetailValue}>{new Date(pol.expiryDate).toLocaleDateString()}</Text>
                    </View>
                  </View>
                  {pol.status === "active" && (
                    <Pressable onPress={() => setShowClaimModal(true)} style={styles.claimBtn}>
                      <Ionicons name="document-attach" size={14} color={Colors.brand.primary} />
                      <Text style={styles.claimBtnText}>Submit Claim</Text>
                    </Pressable>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Claims */}
        {tab === "claims" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Claim History</Text>
            {policies.flatMap((p) => p.claimHistory).length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="clipboard" size={40} color={Colors.ink[300]} />
                <Text style={styles.emptyText}>No claims filed yet.</Text>
              </View>
            ) : (
              policies.flatMap((p) =>
                p.claimHistory.map((c) => (
                  <View key={c.id} style={styles.claimCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.claimReason}>{c.reason}</Text>
                      <Text style={styles.claimDate}>{new Date(c.date).toLocaleDateString()}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.claimAmount}>${c.amount}</Text>
                      <View style={[styles.claimStatusBadge, { backgroundColor: c.status === "approved" ? Colors.accent.greenSoft : "#FFF3E0" }]}>
                        <Text style={styles.claimStatusText}>{c.status}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )
            )}
          </View>
        )}
      </ScrollView>

      {/* Enroll Modal */}
      <Modal visible={!!selectedPlan} transparent animationType="slide" onRequestClose={() => setSelectedPlan(null)}>
        <Pressable style={styles.modalBg} onPress={() => setSelectedPlan(null)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            {selectedPlan && (
              <>
                <Text style={styles.modalTitle}>Enroll in {selectedPlan.name}</Text>
                <Text style={styles.modalSub}>
                  ${selectedPlan.monthlyPremium}/month · Coverage up to ${selectedPlan.coverageAmount.toLocaleString()}
                </Text>
                <View style={{ marginVertical: 16 }}>
                  {selectedPlan.features.map((f, i) => (
                    <View key={i} style={styles.featRow}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.accent.green} />
                      <Text style={styles.modalFeat}>{f}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.modalNote}>Premium will be auto-deducted from your wallet monthly.</Text>
                <Button title="Confirm Enrollment" onPress={() => enrollInPlan(selectedPlan)} style={{ marginTop: 14 }} />
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Claim Modal */}
      <Modal visible={showClaimModal} transparent animationType="slide" onRequestClose={() => setShowClaimModal(false)}>
        <Pressable style={styles.modalBg} onPress={() => setShowClaimModal(false)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Submit a Claim</Text>
            <Text style={styles.modalSub}>Your claim will be reviewed within 2-3 business days.</Text>
            <View style={styles.claimSteps}>
              {["Upload supporting documents", "Describe the incident", "Submit for review", "Receive payout to wallet"].map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
            <Button title="Start Claim Process" onPress={() => setShowClaimModal(false)} style={{ marginTop: 14 }} />
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: "row", paddingHorizontal: 18, gap: 10 },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 12, alignItems: "center", shadowColor: "#101225", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  statVal: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.ink[900], marginTop: 6 },
  statLbl: { fontFamily: "Inter_400Regular", fontSize: 9, color: Colors.ink[500], marginTop: 2 },
  tabRow: { flexDirection: "row", paddingHorizontal: 18, gap: 8, marginTop: 16 },
  tabChip: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.white, alignItems: "center", borderWidth: 1, borderColor: Colors.ink[200] },
  tabActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  tabText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.ink[600] },
  tabTextActive: { color: Colors.white },
  section: { paddingHorizontal: 18, marginTop: 16 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.ink[900], marginBottom: 12 },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  typeChip: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.ink[200] },
  typeText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: Colors.ink[500] },
  planCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: "#101225", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  planIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  planName: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.ink[900] },
  tierBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  tierText: { fontFamily: "Inter_600SemiBold", fontSize: 10, textTransform: "uppercase" },
  planPrice: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.brand.primary },
  planPriceUnit: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500] },
  planCoverage: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[600], marginBottom: 10 },
  featList: { gap: 4 },
  featRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[700] },
  moreFeat: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.brand.primary, marginTop: 4, marginLeft: 22 },
  policyCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 10 },
  polDate: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500], marginTop: 2 },
  polStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  polStatusText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.ink[700], textTransform: "capitalize" },
  polDetails: { flexDirection: "row", flexWrap: "wrap", backgroundColor: Colors.ink[50], borderRadius: 10, padding: 10, gap: 4 },
  polDetailItem: { width: "48%", marginBottom: 6 },
  polDetailLabel: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.ink[500] },
  polDetailValue: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.ink[900], marginTop: 1 },
  claimBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10, paddingVertical: 10, backgroundColor: Colors.brand.primary50, borderRadius: 10 },
  claimBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.brand.primary },
  emptyCard: { alignItems: "center", padding: 30, backgroundColor: Colors.white, borderRadius: 16 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[500], marginTop: 10, textAlign: "center" },
  claimCard: { flexDirection: "row", backgroundColor: Colors.white, borderRadius: 12, padding: 14, marginBottom: 8 },
  claimReason: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  claimDate: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500], marginTop: 2 },
  claimAmount: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.ink[900] },
  claimStatusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  claimStatusText: { fontFamily: "Inter_500Medium", fontSize: 10, textTransform: "capitalize", color: Colors.ink[700] },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.ink[900] },
  modalSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[500], marginTop: 4 },
  modalFeat: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[700] },
  modalNote: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], fontStyle: "italic" },
  claimSteps: { marginTop: 16, gap: 10 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.brand.primary, alignItems: "center", justifyContent: "center" },
  stepNumText: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.white },
  stepText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[700] },
});
