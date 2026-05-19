import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MotiView } from "moti";
import { View, Text, Pressable, ScrollView, Alert, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useDeleteUserItem, useUpdateUserItem, useUserItems } from "@/features/userdata";
import type { ScheduledPayment } from "@/store/appStore";
import { Colors } from "@/theme/colors";

type ScheduledPayload = Omit<ScheduledPayment, "id">;

const FREQ_LABEL: Record<ScheduledPayment["frequency"], string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const FREQ_COLOR: Record<ScheduledPayment["frequency"], string> = {
  daily: Colors.accent.green,
  weekly: Colors.brand.primary,
  monthly: Colors.accent.amber,
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function PaymentCard({
  item,
  index,
  onToggle,
  onDelete,
}: {
  item: ScheduledPayment;
  index: number;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const freqColor = FREQ_COLOR[item.frequency];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 60, type: "timing", duration: 300 }}
      style={styles.card}
    >
      <View
        style={[
          styles.cardIconWrap,
          {
            backgroundColor: item.type === "bill" ? Colors.accent.redSoft : Colors.brand.primary50,
          },
        ]}
      >
        <Ionicons
          name={item.type === "bill" ? "receipt-outline" : "paper-plane-outline"}
          size={20}
          color={item.type === "bill" ? Colors.accent.red : Colors.brand.primary}
        />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={styles.recipientName} numberOfLines={1}>
            {item.recipient}
          </Text>
          <View style={[styles.freqBadge, { backgroundColor: freqColor + "1A" }]}>
            <Text style={[styles.freqLabel, { color: freqColor }]}>
              {FREQ_LABEL[item.frequency]}
            </Text>
          </View>
        </View>

        <View style={styles.cardBottomRow}>
          <Text style={styles.amountText}>
            {item.currency} {item.amount.toLocaleString()}
          </Text>
          <View style={styles.nextDateRow}>
            <Ionicons name="calendar-outline" size={12} color={Colors.ink[400]} />
            <Text style={styles.nextDateText}>Next: {formatDate(item.nextDate)}</Text>
          </View>
        </View>

        {item.note ? (
          <Text style={styles.noteText} numberOfLines={1}>
            {item.note}
          </Text>
        ) : null}
      </View>

      <View style={styles.cardActions}>
        <Pressable onPress={onToggle} hitSlop={8} style={styles.actionBtn}>
          <Ionicons
            name={item.isActive ? "pause-circle" : "play-circle"}
            size={26}
            color={item.isActive ? Colors.accent.amber : Colors.accent.green}
          />
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={8} style={[styles.actionBtn, { marginTop: 4 }]}>
          <Ionicons name="trash-outline" size={20} color={Colors.accent.red} />
        </Pressable>
      </View>
    </MotiView>
  );
}

export default function ScheduledPayments() {
  const insets = useSafeAreaInsets();
  const scheduledQuery = useUserItems<ScheduledPayload>("scheduled");
  const scheduledPayments: ScheduledPayment[] = (scheduledQuery.data?.items ?? []).map((it) => ({
    ...it.payload,
    id: it.id,
  }));
  const updateScheduled = useUpdateUserItem("scheduled");
  const deleteScheduled = useDeleteUserItem("scheduled");

  const active = scheduledPayments.filter((p) => p.isActive);
  const paused = scheduledPayments.filter((p) => !p.isActive);
  const isEmpty = scheduledPayments.length === 0;

  function toggleScheduledPayment(id: string) {
    const p = scheduledPayments.find((x) => x.id === id);
    if (p === undefined) return;
    const { id: _, ...rest } = p;
    updateScheduled.mutate({ id, payload: { ...rest, isActive: !p.isActive } });
  }

  function handleDelete(id: string, recipient: string) {
    Alert.alert("Delete Payment", `Remove the scheduled payment to ${recipient}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteScheduled.mutate(id),
      },
    ]);
  }

  return (
    <Screen bg={Colors.surface.background}>
      <Header title="Scheduled Payments" />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {isEmpty ? (
          <MotiView
            from={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 400 }}
            style={styles.emptyState}
          >
            <Text style={styles.emptyEmoji}>🕐</Text>
            <Text style={styles.emptyTitle}>No Scheduled Payments</Text>
            <Text style={styles.emptySubtitle}>
              Automate your transfers and bill payments on a recurring schedule.
            </Text>
            <Pressable onPress={() => router.push("/scheduled/create")} style={styles.emptyButton}>
              <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
              <Text style={styles.emptyButtonText}>Create Payment</Text>
            </Pressable>
          </MotiView>
        ) : (
          <>
            {active.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Active</Text>
                {active.map((item, i) => (
                  <PaymentCard
                    key={item.id}
                    item={item}
                    index={i}
                    onToggle={() => toggleScheduledPayment(item.id)}
                    onDelete={() => handleDelete(item.id, item.recipient)}
                  />
                ))}
              </>
            )}

            {paused.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: active.length > 0 ? 24 : 0 }]}>
                  Paused
                </Text>
                {paused.map((item, i) => (
                  <PaymentCard
                    key={item.id}
                    item={item}
                    index={active.length + i}
                    onToggle={() => toggleScheduledPayment(item.id)}
                    onDelete={() => handleDelete(item.id, item.recipient)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push("/scheduled/create")}
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.ink[500],
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: Colors.ink[900],
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recipientName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
    flex: 1,
  },
  freqBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  freqLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.brand.primary,
  },
  nextDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  nextDateText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.ink[400],
  },
  noteText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    fontStyle: "italic",
  },
  cardActions: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  actionBtn: {
    padding: 2,
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
