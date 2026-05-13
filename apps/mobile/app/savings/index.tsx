import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { MotiView } from "moti";
import { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Modal, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/appStore";
import type { SavingsPlan } from "@/store/appStore";
import { Colors } from "@/theme/colors";

function isLocked(lockUntil?: string): boolean {
  if (!lockUntil) return false;
  return new Date(lockUntil) > new Date();
}

function formatLockDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ProgressBar({ progress }: { progress: number }) {
  const pct = Math.min(Math.max(progress, 0), 1);
  return (
    <View style={pStyles.track}>
      <MotiView
        from={{ width: "0%" }}
        animate={{ width: `${Math.round(pct * 100)}%` as any }}
        transition={{ type: "timing", duration: 700, delay: 200 }}
        style={[
          pStyles.fill,
          { backgroundColor: pct >= 1 ? Colors.accent.green : Colors.brand.primary },
        ]}
      />
    </View>
  );
}

const pStyles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: Colors.ink[100],
    borderRadius: 3,
    overflow: "hidden",
    marginVertical: 8,
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
});

type ModalMode = "contribute" | "withdraw" | null;

function AmountModal({
  plan,
  mode,
  onClose,
  onConfirm,
}: {
  plan: SavingsPlan;
  mode: ModalMode;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}) {
  const [raw, setRaw] = useState("");
  const amount = parseFloat(raw) || 0;
  const locked = isLocked(plan.lockUntil);
  const isWithdraw = mode === "withdraw";

  if (isWithdraw && locked) {
    return (
      <Modal transparent animationType="fade" visible onRequestClose={onClose}>
        <Pressable style={mStyles.overlay} onPress={onClose}>
          <Pressable style={mStyles.sheet} onPress={() => {}}>
            <View style={mStyles.lockIconWrap}>
              <Ionicons name="lock-closed" size={32} color={Colors.accent.amber} />
            </View>
            <Text style={mStyles.lockTitle}>Plan is Locked</Text>
            <Text style={mStyles.lockDesc}>
              This savings plan is locked until{" "}
              <Text style={{ color: Colors.brand.primary, fontFamily: "Inter_600SemiBold" }}>
                {formatLockDate(plan.lockUntil!)}
              </Text>
              . Withdrawals are not allowed before the lock-in period ends.
            </Text>
            <Button title="Got it" onPress={onClose} variant="secondary" size="md" />
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={mStyles.overlay} onPress={onClose}>
        <Pressable style={mStyles.sheet} onPress={() => {}}>
          <Text style={mStyles.modalTitle}>
            {isWithdraw ? "Withdraw from" : "Add to"} {plan.emoji} {plan.name}
          </Text>
          <Text style={mStyles.modalBalance}>
            Saved: {plan.currency} {plan.savedAmount.toLocaleString()}
          </Text>
          <View style={mStyles.amountRow}>
            <Text style={mStyles.currencyText}>{plan.currency}</Text>
            <TextInput
              style={mStyles.amountInput}
              placeholder="0.00"
              placeholderTextColor={Colors.ink[300]}
              value={raw}
              onChangeText={setRaw}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
          {isWithdraw && amount > plan.savedAmount ? (
            <Text style={mStyles.errorHint}>Exceeds saved amount</Text>
          ) : null}
          <View style={mStyles.modalActions}>
            <Button
              title="Cancel"
              variant="secondary"
              size="md"
              onPress={onClose}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title={isWithdraw ? "Withdraw" : "Contribute"}
              size="md"
              disabled={amount <= 0 || (isWithdraw && amount > plan.savedAmount)}
              onPress={() => {
                if (amount > 0) {
                  onConfirm(amount);
                  onClose();
                }
              }}
              style={{ flex: 1 }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const mStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.surface.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  lockIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent.amber + "1A",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  lockTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.ink[900],
    textAlign: "center",
    marginBottom: 10,
  },
  lockDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.ink[500],
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: Colors.ink[900],
    marginBottom: 4,
  },
  modalBalance: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.ink[500],
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.brand.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  currencyText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.ink[500],
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 22,
    color: Colors.ink[900],
    paddingVertical: 14,
  },
  errorHint: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.accent.red,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 16,
  },
});

function PlanCard({
  plan,
  index,
  onContribute,
  onWithdraw,
}: {
  plan: SavingsPlan;
  index: number;
  onContribute: () => void;
  onWithdraw: () => void;
}) {
  const progress = plan.targetAmount > 0 ? plan.savedAmount / plan.targetAmount : 0;
  const pct = Math.round(Math.min(progress * 100, 100));
  const locked = isLocked(plan.lockUntil);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 70, type: "timing", duration: 320 }}
      style={cStyles.card}
    >
      <View style={cStyles.topRow}>
        <View style={cStyles.emojiWrap}>
          <Text style={cStyles.emoji}>{plan.emoji}</Text>
        </View>
        <View style={cStyles.titleBlock}>
          <Text style={cStyles.planName}>{plan.name}</Text>
          <Text style={cStyles.planSaved}>
            {plan.currency} {plan.savedAmount.toLocaleString()} of{" "}
            {plan.targetAmount.toLocaleString()}
          </Text>
        </View>
        <View style={cStyles.badgesCol}>
          {locked && (
            <View style={cStyles.lockedBadge}>
              <Ionicons name="lock-closed" size={10} color={Colors.accent.amber} />
              <Text style={cStyles.lockedText}>Locked</Text>
            </View>
          )}
          {plan.interestRate != null && (
            <View style={cStyles.interestBadge}>
              <Text style={cStyles.interestText}>{plan.interestRate}% p.a.</Text>
            </View>
          )}
        </View>
      </View>

      <ProgressBar progress={progress} />

      <View style={cStyles.pctRow}>
        <Text style={cStyles.pctText}>{pct}% saved</Text>
        <Text style={cStyles.freqText}>
          +{plan.currency} {plan.contributionAmount} / {plan.frequency}
        </Text>
      </View>

      <View style={cStyles.actions}>
        <Pressable onPress={onContribute} style={cStyles.contributeBtn}>
          <Ionicons name="add-circle-outline" size={15} color={Colors.white} />
          <Text style={cStyles.contributeBtnText}>Contribute</Text>
        </Pressable>
        <Pressable
          onPress={onWithdraw}
          style={[cStyles.withdrawBtn, locked && cStyles.withdrawBtnLocked]}
        >
          <Ionicons
            name={locked ? "lock-closed-outline" : "arrow-down-circle-outline"}
            size={15}
            color={locked ? Colors.ink[400] : Colors.brand.primary}
          />
          <Text style={[cStyles.withdrawBtnText, locked && { color: Colors.ink[400] }]}>
            Withdraw
          </Text>
        </Pressable>
      </View>
    </MotiView>
  );
}

const cStyles = StyleSheet.create({
  card: {
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
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  emoji: { fontSize: 22 },
  titleBlock: { flex: 1 },
  planName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
  },
  planSaved: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    marginTop: 2,
  },
  badgesCol: {
    alignItems: "flex-end",
    gap: 4,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.accent.amber + "1A",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  lockedText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: Colors.accent.amber,
  },
  interestBadge: {
    backgroundColor: Colors.accent.greenSoft,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  interestText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: Colors.accent.green,
  },
  pctRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pctText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: Colors.ink[500],
  },
  freqText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: Colors.brand.primaryLight,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  contributeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.brand.primary,
    paddingVertical: 10,
    borderRadius: 12,
  },
  contributeBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.white,
  },
  withdrawBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.brand.primary,
    paddingVertical: 10,
    borderRadius: 12,
  },
  withdrawBtnLocked: {
    borderColor: Colors.ink[200],
  },
  withdrawBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.brand.primary,
  },
});

export default function SavingsPlans() {
  const insets = useSafeAreaInsets();
  const { savingsPlans, contributeSavings, withdrawSavings } = useApp();

  const [selectedPlan, setSelectedPlan] = useState<SavingsPlan | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  const totalSaved = savingsPlans.reduce((acc, p) => acc + p.savedAmount, 0);
  const activePlans = savingsPlans.filter((p) => p.isActive);
  const isEmpty = savingsPlans.length === 0;

  function openModal(plan: SavingsPlan, mode: ModalMode) {
    setSelectedPlan(plan);
    setModalMode(mode);
  }

  function closeModal() {
    setSelectedPlan(null);
    setModalMode(null);
  }

  function handleConfirm(amount: number) {
    if (!selectedPlan || !modalMode) return;
    if (modalMode === "contribute") {
      contributeSavings(selectedPlan.id, amount);
    } else {
      withdrawSavings(selectedPlan.id, amount);
    }
  }

  return (
    <Screen bg={Colors.surface.background}>
      <Header title="Savings Plans" />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {savingsPlans.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400 }}
            style={styles.summaryCardWrap}
          >
            <LinearGradient
              colors={[Colors.brand.gradientStart, Colors.brand.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryCard}
            >
              <Text style={styles.summaryLabel}>Total Saved</Text>
              <Text style={styles.summaryAmount}>
                {savingsPlans[0]?.currency ?? "USD"}{" "}
                {totalSaved.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <View style={styles.summaryFooter}>
                <Ionicons name="trending-up" size={14} color="rgba(255,255,255,0.75)" />
                <Text style={styles.summaryFooterText}>
                  {activePlans.length} active {activePlans.length === 1 ? "plan" : "plans"}
                </Text>
              </View>
            </LinearGradient>
          </MotiView>
        )}

        {isEmpty ? (
          <MotiView
            from={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 400 }}
            style={styles.emptyState}
          >
            <Text style={styles.emptyEmoji}>💰</Text>
            <Text style={styles.emptyTitle}>No Savings Plans Yet</Text>
            <Text style={styles.emptySubtitle}>
              Set a goal, choose a contribution schedule, and watch your savings grow.
            </Text>
            <Pressable onPress={() => router.push("/savings/create")} style={styles.emptyButton}>
              <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
              <Text style={styles.emptyButtonText}>Create a Plan</Text>
            </Pressable>
          </MotiView>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Your Plans</Text>
            {savingsPlans.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                index={i}
                onContribute={() => openModal(plan, "contribute")}
                onWithdraw={() => openModal(plan, "withdraw")}
              />
            ))}
          </>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push("/savings/create")}
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </Pressable>

      {selectedPlan && modalMode ? (
        <AmountModal
          plan={selectedPlan}
          mode={modalMode}
          onClose={closeModal}
          onConfirm={handleConfirm}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  summaryCardWrap: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.brand.gradientEnd,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  summaryCard: {
    padding: 22,
    borderRadius: 20,
  },
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
    marginBottom: 10,
  },
  summaryFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryFooterText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.ink[500],
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.ink[900],
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.ink[500],
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  emptyButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.white,
  },
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
