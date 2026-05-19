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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { useCreateUserItem } from "@/features/userdata";
import { useApp } from "@/store/appStore";
import type { ScheduledFrequency } from "@/store/appStore";
import { Colors } from "@/theme/colors";

type PaymentType = "transfer" | "bill";

const FREQUENCIES: { key: ScheduledFrequency; label: string; icon: string; desc: string }[] = [
  { key: "daily", label: "Daily", icon: "sunny-outline", desc: "Every day" },
  { key: "weekly", label: "Weekly", icon: "calendar-outline", desc: "Every 7 days" },
  { key: "monthly", label: "Monthly", icon: "calendar-number-outline", desc: "Every month" },
];

function computeNextDate(frequency: ScheduledFrequency): string {
  const d = new Date();
  if (frequency === "daily") d.setDate(d.getDate() + 1);
  else if (frequency === "weekly") d.setDate(d.getDate() + 7);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

function formatNextDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function CreateScheduledPayment() {
  const insets = useSafeAreaInsets();
  const { activeCurrency } = useApp();
  const createScheduled = useCreateUserItem("scheduled");

  const [paymentType, setPaymentType] = useState<PaymentType>("transfer");
  const [recipient, setRecipient] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [amountRaw, setAmountRaw] = useState("");
  const [frequency, setFrequency] = useState<ScheduledFrequency>("monthly");
  const [note, setNote] = useState("");

  const amount = parseFloat(amountRaw) || 0;
  const nextDate = computeNextDate(frequency);
  const canSubmit = recipient.trim().length > 0 && amount > 0 && !createScheduled.isPending;

  async function handleCreate() {
    if (!canSubmit) return;
    try {
      await createScheduled.mutateAsync({
        recipient: recipient.trim(),
        recipientPhone: recipientPhone.trim() || undefined,
        amount,
        currency: activeCurrency,
        frequency,
        nextDate,
        type: paymentType,
        isActive: true,
        note: note.trim() || undefined,
      });
      router.back();
    } catch {
      // Swallow; the error surfaces via the mutation state if the screen
      // wants to show it. Keeping create flow forgiving for the demo.
    }
  }

  return (
    <Screen bg={Colors.white}>
      <Header title="Schedule Payment" />
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type selector */}
          <Text style={styles.fieldLabel}>Payment Type</Text>
          <View style={styles.typeRow}>
            {(["transfer", "bill"] as PaymentType[]).map((t) => {
              const active = paymentType === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setPaymentType(t)}
                  style={[styles.typePill, active && styles.typePillActive]}
                >
                  <Ionicons
                    name={t === "transfer" ? "paper-plane-outline" : "receipt-outline"}
                    size={16}
                    color={active ? Colors.white : Colors.ink[500]}
                  />
                  <Text style={[styles.typePillText, active && styles.typePillTextActive]}>
                    {t === "transfer" ? "Transfer" : "Bill Payment"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Recipient */}
          <Input
            label={paymentType === "transfer" ? "Recipient Name" : "Biller / Company"}
            placeholder={paymentType === "transfer" ? "e.g. Ahmed Hassan" : "e.g. Etisalat"}
            value={recipient}
            onChangeText={setRecipient}
            leftIcon={<Ionicons name="person-outline" size={18} color={Colors.ink[400]} />}
          />

          {/* Phone / Account */}
          <Input
            label={paymentType === "transfer" ? "Phone Number" : "Account / Reference"}
            placeholder={paymentType === "transfer" ? "+971 50 000 0000" : "Account number"}
            value={recipientPhone}
            onChangeText={setRecipientPhone}
            keyboardType="phone-pad"
            leftIcon={
              <Ionicons
                name={paymentType === "transfer" ? "phone-portrait-outline" : "barcode-outline"}
                size={18}
                color={Colors.ink[400]}
              />
            }
          />

          {/* Amount */}
          <Text style={styles.fieldLabel}>Amount ({activeCurrency})</Text>
          <View style={styles.amountInputWrap}>
            <Text style={styles.currencyPrefix}>{activeCurrency}</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={Colors.ink[300]}
              value={amountRaw}
              onChangeText={setAmountRaw}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Frequency */}
          <Text style={[styles.fieldLabel, { marginTop: 6 }]}>Frequency</Text>
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
                  <Text style={[styles.freqCardLabel, active && styles.freqCardLabelActive]}>
                    {f.label}
                  </Text>
                  <Text
                    style={[styles.freqCardDesc, active && { color: Colors.brand.primaryLight }]}
                  >
                    {f.desc}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Note */}
          <Input
            label="Note (optional)"
            placeholder="e.g. Rent, electricity..."
            value={note}
            onChangeText={setNote}
            leftIcon={<Ionicons name="chatbubble-outline" size={18} color={Colors.ink[400]} />}
          />

          {/* Next occurrence preview */}
          <MotiView
            from={{ opacity: 0, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300 }}
            style={styles.nextDateCard}
          >
            <View style={styles.nextDateLeft}>
              <Ionicons name="calendar-outline" size={18} color={Colors.brand.primary} />
              <Text style={styles.nextDateLabel}>First payment</Text>
            </View>
            <Text style={styles.nextDateValue}>{formatNextDate(nextDate)}</Text>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          title={createScheduled.isPending ? "Scheduling…" : "Schedule Payment"}
          disabled={!canSubmit}
          onPress={() => void handleCreate()}
          icon={<Ionicons name="time-outline" size={18} color={Colors.white} />}
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
  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  typePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
    backgroundColor: Colors.white,
  },
  typePillActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  typePillText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[500],
  },
  typePillTextActive: {
    color: Colors.white,
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
  currencyPrefix: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[500],
    marginRight: 8,
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
    marginBottom: 18,
  },
  freqCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
    backgroundColor: Colors.white,
    gap: 4,
  },
  freqCardActive: {
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.brand.primary50,
  },
  freqCardLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.ink[700],
  },
  freqCardLabelActive: {
    color: Colors.brand.primary,
  },
  freqCardDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.ink[400],
  },
  nextDateCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.brand.primary50,
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  nextDateLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nextDateLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.ink[700],
  },
  nextDateValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.brand.primary,
    maxWidth: "55%",
    textAlign: "right",
  },
  bottomBar: {
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.ink[100],
  },
});
