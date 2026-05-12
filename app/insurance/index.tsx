import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Colors } from "@/theme/colors";

// ─── Types ─────────────────────────────────────────────────────────────────────
type PlanType = "life" | "health" | "business";

type Plan = {
  id: string;
  type: PlanType;
  emoji: string;
  name: string;
  coverage: number;
  premium: number;
  benefits: string[];
};

type Policy = {
  planId: string;
  planName: string;
  type: PlanType;
  emoji: string;
  coverage: number;
  premium: number;
  startDate: string;
};

type ClaimType = "accident" | "illness" | "property";

// ─── Static data ────────────────────────────────────────────────────────────────
const PLANS: Plan[] = [
  {
    id: "life-1",
    type: "life",
    emoji: "❤️",
    name: "Life Shield",
    coverage: 50000,
    premium: 12,
    benefits: [
      "Full death coverage up to $50,000",
      "Disability support payments",
      "Family funeral expenses covered",
    ],
  },
  {
    id: "health-1",
    type: "health",
    emoji: "🏥",
    name: "Health Plus",
    coverage: 15000,
    premium: 18,
    benefits: [
      "Hospitalization & emergency care",
      "Specialist visits & prescriptions",
      "Lab tests & dental basics",
    ],
  },
  {
    id: "biz-1",
    type: "business",
    emoji: "💼",
    name: "Biz Guard",
    coverage: 50000,
    premium: 30,
    benefits: [
      "Inventory & equipment protection",
      "Business interruption cover",
      "Employee injury liability",
    ],
  },
];

const SEED_POLICIES: Policy[] = [
  {
    planId: "health-1",
    planName: "Health Plus",
    type: "health",
    emoji: "🏥",
    coverage: 15000,
    premium: 18,
    startDate: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
];

const CLAIM_TYPES: { value: ClaimType; label: string }[] = [
  { value: "accident", label: "Accident" },
  { value: "illness", label: "Illness" },
  { value: "property", label: "Property Damage" },
];

// ─── Toast ──────────────────────────────────────────────────────────────────────
function SuccessToast({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: 20 }}
      transition={{ type: "timing", duration: 300 }}
      style={styles.toast}
    >
      <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
      <Text style={styles.toastText}>Claim submitted successfully!</Text>
    </MotiView>
  );
}

// ─── Plan card ──────────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  isActive,
  index,
  onGetPlan,
  onViewPolicy,
  onFileClaim,
}: {
  plan: Plan;
  isActive: boolean;
  index: number;
  onGetPlan: () => void;
  onViewPolicy: () => void;
  onFileClaim: () => void;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 340, delay: index * 90 }}
      style={[styles.planCard, isActive && styles.planCardActive]}
    >
      <View style={styles.planCardHeader}>
        <Text style={styles.planEmoji}>{plan.emoji}</Text>
        <View style={styles.planCardHeaderInfo}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planCoverage}>
            Coverage up to ${plan.coverage.toLocaleString()}
          </Text>
        </View>
        <View style={styles.planPriceCol}>
          <Text style={styles.planPrice}>${plan.premium}</Text>
          <Text style={styles.planPriceUnit}>/mo</Text>
        </View>
      </View>

      <View style={styles.benefitsList}>
        {plan.benefits.map((b, i) => (
          <View key={i} style={styles.benefitRow}>
            <Ionicons name="checkmark" size={14} color={Colors.accent.green} />
            <Text style={styles.benefitText}>{b}</Text>
          </View>
        ))}
      </View>

      {isActive ? (
        <View style={styles.activeActions}>
          <View style={styles.activeBadge}>
            <Ionicons name="shield-checkmark" size={13} color={Colors.accent.green} />
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>
          <Pressable onPress={onViewPolicy} style={styles.viewPolicyBtn}>
            <Text style={styles.viewPolicyText}>View Policy</Text>
          </Pressable>
          <Pressable onPress={onFileClaim} style={styles.fileClaimBtn}>
            <Text style={styles.fileClaimText}>File Claim</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={onGetPlan} style={styles.getPlanBtn}>
          <Text style={styles.getPlanText}>Get Plan</Text>
        </Pressable>
      )}
    </MotiView>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────────
export default function InsuranceScreen() {
  const insets = useSafeAreaInsets();
  const [policies, setPolicies] = useState<Policy[]>(SEED_POLICIES);
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);
  const [claimPlan, setClaimPlan] = useState<Plan | null>(null);
  const [claimType, setClaimType] = useState<ClaimType>("accident");
  const [claimDesc, setClaimDesc] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showViewModal, setShowViewModal] = useState<Policy | null>(null);

  const activePlanIds = new Set(policies.map((p) => p.planId));
  const totalPremium = policies.reduce((s, p) => s + p.premium, 0);

  function activatePolicy(plan: Plan) {
    setPolicies((prev) => [
      ...prev,
      {
        planId: plan.id,
        planName: plan.name,
        type: plan.type,
        emoji: plan.emoji,
        coverage: plan.coverage,
        premium: plan.premium,
        startDate: new Date().toISOString(),
      },
    ]);
    setConfirmPlan(null);
  }

  function submitClaim() {
    setClaimPlan(null);
    setClaimDesc("");
    setClaimType("accident");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="dark-content" />
      <Header title="Insurance" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* Summary card */}
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 380 }}
          style={styles.summaryCard}
        >
          <View style={styles.summaryItem}>
            <Ionicons name="shield-checkmark" size={22} color={Colors.accent.green} />
            <Text style={styles.summaryValue}>{policies.length}</Text>
            <Text style={styles.summaryLabel}>Active Policies</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Ionicons name="cash" size={22} color={Colors.brand.primary} />
            <Text style={styles.summaryValue}>${totalPremium}/mo</Text>
            <Text style={styles.summaryLabel}>Total Premium</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Ionicons name="umbrella" size={22} color={Colors.accent.amber} />
            <Text style={styles.summaryValue}>
              ${policies.reduce((s, p) => s + p.coverage, 0).toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>Total Coverage</Text>
          </View>
        </MotiView>

        {/* Plan cards */}
        <Text style={styles.sectionTitle}>Available Plans</Text>
        {PLANS.map((plan, i) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isActive={activePlanIds.has(plan.id)}
            index={i}
            onGetPlan={() => setConfirmPlan(plan)}
            onViewPolicy={() => {
              const pol = policies.find((p) => p.planId === plan.id);
              if (pol) setShowViewModal(pol);
            }}
            onFileClaim={() => setClaimPlan(plan)}
          />
        ))}
      </ScrollView>

      {/* Toast */}
      <View style={styles.toastWrap} pointerEvents="none">
        <SuccessToast visible={showToast} />
      </View>

      {/* Confirm / Get Plan Modal */}
      <Modal
        visible={!!confirmPlan}
        transparent
        animationType="slide"
        onRequestClose={() => setConfirmPlan(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setConfirmPlan(null)}>
          <Pressable style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            {confirmPlan && (
              <>
                <Text style={styles.modalEmoji}>{confirmPlan.emoji}</Text>
                <Text style={styles.modalTitle}>{confirmPlan.name}</Text>
                <Text style={styles.modalSub}>
                  ${confirmPlan.premium}/month · Coverage up to ${confirmPlan.coverage.toLocaleString()}
                </Text>

                <View style={styles.benefitsSection}>
                  {confirmPlan.benefits.map((b, i) => (
                    <View key={i} style={styles.benefitRow}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.accent.green} />
                      <Text style={styles.modalBenefitText}>{b}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.deductionNote}>
                  <Ionicons name="wallet-outline" size={16} color={Colors.brand.primary} />
                  <Text style={styles.deductionText}>
                    Deducted monthly from wallet
                  </Text>
                </View>

                <Button
                  title="Confirm & Activate Policy"
                  onPress={() => activatePolicy(confirmPlan)}
                  style={styles.modalBtn}
                />
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* View Policy Modal */}
      <Modal
        visible={!!showViewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowViewModal(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowViewModal(null)}>
          <Pressable style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            {showViewModal && (
              <>
                <Text style={styles.modalEmoji}>{showViewModal.emoji}</Text>
                <Text style={styles.modalTitle}>{showViewModal.planName}</Text>
                <View style={styles.policyDetails}>
                  <View style={styles.policyDetailRow}>
                    <Text style={styles.policyDetailLabel}>Status</Text>
                    <View style={styles.activeBadge}>
                      <Ionicons name="shield-checkmark" size={12} color={Colors.accent.green} />
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                  </View>
                  <View style={styles.policyDetailRow}>
                    <Text style={styles.policyDetailLabel}>Started</Text>
                    <Text style={styles.policyDetailValue}>
                      {new Date(showViewModal.startDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.policyDetailRow}>
                    <Text style={styles.policyDetailLabel}>Coverage</Text>
                    <Text style={styles.policyDetailValue}>
                      ${showViewModal.coverage.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.policyDetailRow}>
                    <Text style={styles.policyDetailLabel}>Monthly Premium</Text>
                    <Text style={styles.policyDetailValue}>${showViewModal.premium}</Text>
                  </View>
                </View>
                <Button
                  title="Close"
                  variant="secondary"
                  onPress={() => setShowViewModal(null)}
                  style={styles.modalBtn}
                />
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* File Claim Modal */}
      <Modal
        visible={!!claimPlan}
        transparent
        animationType="slide"
        onRequestClose={() => setClaimPlan(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setClaimPlan(null)}>
          <Pressable style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>File a Claim</Text>
            <Text style={styles.modalSub}>
              {claimPlan?.name} — ${claimPlan?.coverage.toLocaleString()} coverage
            </Text>

            {/* Claim type "dropdown" as chips */}
            <Text style={styles.fieldLabel}>Claim Type</Text>
            <View style={styles.claimTypeRow}>
              {CLAIM_TYPES.map((ct) => (
                <Pressable
                  key={ct.value}
                  onPress={() => setClaimType(ct.value)}
                  style={[
                    styles.claimTypeChip,
                    claimType === ct.value && styles.claimTypeChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.claimTypeText,
                      claimType === ct.value && styles.claimTypeTextActive,
                    ]}
                  >
                    {ct.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Description */}
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              value={claimDesc}
              onChangeText={setClaimDesc}
              placeholder="Describe what happened..."
              placeholderTextColor={Colors.ink[400]}
              style={styles.claimDescInput}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Button
              title="Submit Claim"
              onPress={submitClaim}
              disabled={!claimDesc.trim()}
              style={styles.modalBtn}
            />
          </Pressable>
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
  /* Summary card */
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: Colors.ink[900],
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  summaryValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.ink[900],
    marginTop: 4,
  },
  summaryLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: Colors.ink[500],
    textAlign: "center",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.ink[200],
  },
  /* Section title */
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
    marginBottom: 12,
  },
  /* Plan card */
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.ink[900],
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  planCardActive: {
    borderColor: Colors.accent.green,
  },
  planCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  planEmoji: {
    fontSize: 32,
  },
  planCardHeaderInfo: {
    flex: 1,
  },
  planName: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.ink[900],
  },
  planCoverage: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    marginTop: 2,
  },
  planPriceCol: {
    alignItems: "flex-end",
  },
  planPrice: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.brand.primary,
  },
  planPriceUnit: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.ink[500],
  },
  benefitsList: {
    gap: 6,
    marginBottom: 14,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  benefitText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.ink[700],
    flex: 1,
  },
  /* Active actions */
  activeActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.accent.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  activeBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.accent.green,
  },
  viewPolicyBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
  },
  viewPolicyText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.brand.primary,
  },
  fileClaimBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.accent.greenSoft,
    alignItems: "center",
  },
  fileClaimText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.accent.green,
  },
  getPlanBtn: {
    backgroundColor: Colors.brand.primary,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
  },
  getPlanText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.white,
  },
  /* Toast */
  toastWrap: {
    position: "absolute",
    bottom: 100,
    left: 24,
    right: 24,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.accent.green,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: Colors.accent.green,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  toastText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.white,
  },
  /* Modals */
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
  modalEmoji: {
    fontSize: 40,
    marginBottom: 8,
    textAlign: "center",
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.ink[900],
    marginBottom: 4,
  },
  modalSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.ink[500],
    marginBottom: 16,
  },
  benefitsSection: {
    gap: 8,
    marginBottom: 14,
  },
  modalBenefitText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.ink[700],
    flex: 1,
  },
  deductionNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.brand.primary50,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  deductionText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.brand.primary,
    flex: 1,
  },
  modalBtn: {
    marginTop: 4,
  },
  /* Policy details */
  policyDetails: {
    backgroundColor: Colors.surface.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  policyDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  policyDetailLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.ink[500],
  },
  policyDetailValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.ink[900],
  },
  /* Claim form */
  fieldLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.ink[600],
    marginBottom: 8,
    marginTop: 4,
  },
  claimTypeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  claimTypeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  claimTypeChipActive: {
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.brand.primary50,
  },
  claimTypeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.ink[600],
  },
  claimTypeTextActive: {
    color: Colors.brand.primary,
  },
  claimDescInput: {
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.ink[900],
    minHeight: 100,
    marginBottom: 16,
  },
});
