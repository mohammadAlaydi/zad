import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MotiView } from "moti";
import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/appStore";
import type { SavingsFrequency } from "@/store/appStore";
import { Colors } from "@/theme/colors";

const EMOJI_PRESETS = ["💰", "🕌", "✈️", "🎓", "🏠", "🚗", "💊", "📱"];

const FREQUENCIES: { key: SavingsFrequency; label: string; icon: string }[] = [
  { key: "daily", label: "Daily", icon: "sunny-outline" },
  { key: "weekly", label: "Weekly", icon: "calendar-outline" },
  { key: "monthly", label: "Monthly", icon: "calendar-number-outline" },
];

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatLockDate(months: number): string {
  const d = addMonths(new Date(), months);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function CreateSavingsPlan() {
  const insets = useSafeAreaInsets();
  const { addSavingsPlan, activeCurrency } = useApp();

  const [emoji, setEmoji] = useState("💰");
  const [name, setName] = useState("");
  const [targetRaw, setTargetRaw] = useState("");
  const [contributionRaw, setContributionRaw] = useState("");
  const [frequency, setFrequency] = useState<SavingsFrequency>("monthly");
  const [lockEnabled, setLockEnabled] = useState(false);
  const [lockMonths, setLockMonths] = useState(6);
  const [interestRaw, setInterestRaw] = useState("");

  const target = parseFloat(targetRaw) || 0;
  const contribution = parseFloat(contributionRaw) || 0;
  const interest = parseFloat(interestRaw) || undefined;
  const canSubmit = name.trim().length > 0 && target > 0 && contribution > 0;

  function handleCreate() {
    if (!canSubmit) return;
    const lockUntil = lockEnabled ? addMonths(new Date(), lockMonths).toISOString() : undefined;

    addSavingsPlan({
      id: "sav-" + Date.now(),
      name: name.trim(),
      emoji,
      targetAmount: target,
      savedAmount: 0,
      contributionAmount: contribution,
      frequency,
      lockUntil,
      interestRate: interest,
      currency: activeCurrency,
      createdAt: new Date().toISOString(),
      isActive: true,
    });
    router.back();
  }

  return (
    <Screen bg={Colors.white}>
      <Header title="New Savings Plan" />
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Emoji picker */}
          <Text style={styles.fieldLabel}>Choose an Emoji</Text>
          <View style={styles.emojiGrid}>
            {EMOJI_PRESETS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
              >
                <Text style={styles.emojiChar}>{e}</Text>
              </Pressable>
            ))}
          </View>

          {/* Plan name */}
          <Input
            label="Plan Name"
            placeholder="e.g. Hajj Fund, Emergency Fund"
            value={name}
            onChangeText={setName}
            leftIcon={<Ionicons name="bookmark-outline" size={18} color={Colors.ink[400]} />}
          />

          {/* Target amount */}
          <Text style={styles.fieldLabel}>Target Amount ({activeCurrency})</Text>
          <View style={styles.amountInputWrap}>
            <Text style={styles.currencyPrefix}>{activeCurrency}</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={Colors.ink[300]}
              value={targetRaw}
              onChangeText={setTargetRaw}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Auto-contribution */}
          <Text style={styles.fieldLabel}>Auto-Contribution ({activeCurrency})</Text>
          <View style={[styles.amountInputWrap, { marginBottom: 6 }]}>
            <Text style={styles.currencyPrefix}>{activeCurrency}</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={Colors.ink[300]}
              value={contributionRaw}
              onChangeText={setContributionRaw}
              keyboardType="decimal-pad"
            />
          </View>
          <Text style={styles.fieldHint}>
            Amount automatically moved to this plan on each cycle.
          </Text>

          {/* Frequency */}
          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Contribution Frequency</Text>
          <View style={styles.freqGrid}>
            {FREQUENCIES.map((f) => {
              const active = frequency === f.key;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setFrequency(f.key)}
                  style={[styles.freqCard, active && styles.freqCardActive]}
                >
                  <Ionicons
                    name={f.icon as any}
                    size={22}
                    color={active ? Colors.brand.primary : Colors.ink[400]}
                  />
                  <Text style={[styles.freqLabel, active && styles.freqLabelActive]}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Lock-in toggle */}
          <View style={styles.lockRow}>
            <View style={styles.lockLeft}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.brand.primary} />
              <View style={styles.lockTextBlock}>
                <Text style={styles.lockTitle}>Lock-in Period</Text>
                <Text style={styles.lockDesc}>Prevent withdrawals until a set date</Text>
              </View>
            </View>
            <Switch
              value={lockEnabled}
              onValueChange={setLockEnabled}
              trackColor={{ false: Colors.ink[200], true: Colors.brand.primaryLight }}
              thumbColor={lockEnabled ? Colors.brand.primary : Colors.white}
            />
          </View>

          {lockEnabled && (
            <MotiView
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 68 }}
              transition={{ type: "timing", duration: 300 }}
              style={styles.lockPicker}
            >
              <Text style={styles.lockPickerLabel}>Lock until:</Text>
              <View style={styles.lockStepper}>
                <Pressable
                  onPress={() => setLockMonths((m) => Math.max(1, m - 1))}
                  style={styles.stepperBtn}
                  hitSlop={8}
                >
                  <Ionicons name="remove" size={18} color={Colors.brand.primary} />
                </Pressable>
                <View style={styles.stepperValue}>
                  <Text style={styles.stepperMonths}>{lockMonths}</Text>
                  <Text style={styles.stepperMonthsLabel}>
                    {lockMonths === 1 ? "month" : "months"} from today
                  </Text>
                </View>
                <Pressable
                  onPress={() => setLockMonths((m) => Math.min(60, m + 1))}
                  style={styles.stepperBtn}
                  hitSlop={8}
                >
                  <Ionicons name="add" size={18} color={Colors.brand.primary} />
                </Pressable>
              </View>
              <Text style={styles.lockDatePreview}>{formatLockDate(lockMonths)}</Text>
            </MotiView>
          )}

          {/* Interest rate */}
          <View style={styles.interestWrap}>
            <View style={styles.interestHeader}>
              <Text style={styles.fieldLabel}>Interest Rate (optional)</Text>
              <View style={styles.partnerBadge}>
                <Ionicons name="business-outline" size={11} color={Colors.ink[400]} />
                <Text style={styles.partnerBadgeText}>Partner bank required</Text>
              </View>
            </View>
            <View style={[styles.amountInputWrap, styles.disabledInput]}>
              <TextInput
                style={[styles.amountInput, { color: Colors.ink[400] }]}
                placeholder="e.g. 3.5"
                placeholderTextColor={Colors.ink[300]}
                value={interestRaw}
                onChangeText={setInterestRaw}
                keyboardType="decimal-pad"
              />
              <Text style={styles.pctSuffix}>% p.a.</Text>
            </View>
          </View>

          {/* Preview card */}
          {canSubmit && (
            <MotiView
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 300 }}
              style={styles.previewCard}
            >
              <Text style={styles.previewEmoji}>{emoji}</Text>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>{name}</Text>
                <Text style={styles.previewDetail}>
                  {activeCurrency} {contribution.toLocaleString()} / {frequency} toward{" "}
                  {activeCurrency} {target.toLocaleString()}
                </Text>
                {lockEnabled && (
                  <Text style={styles.previewLock}>Locked until {formatLockDate(lockMonths)}</Text>
                )}
              </View>
            </MotiView>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          title="Create Plan"
          disabled={!canSubmit}
          onPress={handleCreate}
          icon={<Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} />}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  fieldLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.ink[700],
    marginBottom: 8,
  },
  fieldHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[400],
    marginBottom: 6,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  emojiBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
    backgroundColor: Colors.white,
  },
  emojiBtnActive: {
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.brand.primary50,
  },
  emojiChar: {
    fontSize: 24,
  },
  amountInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.ink[200],
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: Colors.white,
  },
  disabledInput: {
    backgroundColor: Colors.ink[50],
    borderColor: Colors.ink[100],
  },
  currencyPrefix: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[500],
    marginRight: 8,
  },
  pctSuffix: {
    fontFamily: "Inter_500Medium",
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
  freqGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  freqCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
    backgroundColor: Colors.white,
    gap: 6,
  },
  freqCardActive: {
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.brand.primary50,
  },
  freqLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.ink[500],
  },
  freqLabelActive: {
    color: Colors.brand.primary,
  },
  // Lock row
  lockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  lockLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  lockTextBlock: {
    flex: 1,
  },
  lockTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[900],
  },
  lockDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    marginTop: 1,
  },
  // Lock picker
  lockPicker: {
    backgroundColor: Colors.brand.primary50,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lockPickerLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.ink[700],
  },
  lockStepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.brand.primary200,
  },
  stepperValue: {
    alignItems: "center",
  },
  stepperMonths: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.brand.primary,
  },
  stepperMonthsLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: Colors.ink[500],
  },
  lockDatePreview: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.brand.primaryLight,
  },
  // Interest
  interestWrap: {
    marginBottom: 8,
  },
  interestHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  partnerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.ink[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  partnerBadgeText: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: Colors.ink[500],
  },
  // Preview card
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface.background,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.ink[100],
  },
  previewEmoji: {
    fontSize: 28,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[900],
  },
  previewDetail: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    marginTop: 2,
  },
  previewLock: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: Colors.accent.amber,
    marginTop: 3,
  },
  bottomBar: {
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.ink[100],
  },
});
