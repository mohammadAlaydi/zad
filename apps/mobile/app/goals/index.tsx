import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MotiView } from "moti";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useUserItems } from "@/features/userdata";
import type { WalletGoal } from "@/store/appStore";
import { Colors } from "@/theme/colors";

type GoalPayload = Omit<WalletGoal, "id">;

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const goalsQuery = useUserItems<GoalPayload>("goals");
  const goals: WalletGoal[] = (goalsQuery.data?.items ?? []).map((it) => ({
    ...it.payload,
    id: it.id,
  }));

  return (
    <Screen bg={Colors.surface.background}>
      <Header title="Savings Goals" />

      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 100 }}
            style={styles.emptyInner}
          >
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>No goals yet</Text>
            <Text style={styles.emptySubtitle}>Start saving towards something meaningful</Text>
            <View style={{ marginTop: 28, width: "100%" }}>
              <Button
                title="Create your first savings goal"
                onPress={() => router.push("/goals/create")}
              />
            </View>
          </MotiView>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 100 }}
          >
            {goals.map((goal, index) => {
              const progress =
                goal.targetAmount > 0 ? Math.min(goal.savedAmount / goal.targetAmount, 1) : 0;
              const pct = Math.round(progress * 100);
              const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);

              return (
                <MotiView
                  key={goal.id}
                  from={{ opacity: 0, translateY: 16 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "timing", duration: 300, delay: index * 60 }}
                >
                  <Pressable
                    style={({ pressed }) => [styles.goalCard, { opacity: pressed ? 0.92 : 1 }]}
                    onPress={() => router.push(`/goals/${goal.id}`)}
                  >
                    <View style={styles.goalHeader}>
                      <View style={styles.emojiWrap}>
                        <Text style={styles.emojiText}>{goal.emoji}</Text>
                      </View>
                      <View style={styles.goalInfo}>
                        <Text style={styles.goalName} numberOfLines={1}>
                          {goal.name}
                        </Text>
                        <Text style={styles.goalPct}>{pct}% complete</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={Colors.ink[400]} />
                    </View>

                    <View style={styles.progressTrack}>
                      <MotiView
                        from={{ width: "0%" }}
                        animate={{ width: `${pct}%` }}
                        transition={{ type: "timing", duration: 600, delay: index * 60 + 200 }}
                        style={styles.progressFill}
                      />
                    </View>

                    <View style={styles.goalAmounts}>
                      <Text style={styles.savedLabel}>
                        Saved:{" "}
                        <Text style={styles.savedValue}>
                          {goal.currency} {goal.savedAmount.toLocaleString()}
                        </Text>
                      </Text>
                      <Text style={styles.targetLabel}>
                        of {goal.currency} {goal.targetAmount.toLocaleString()}
                      </Text>
                    </View>

                    {remaining > 0 && (
                      <Text style={styles.remainingText}>
                        {goal.currency} {remaining.toLocaleString()} remaining
                      </Text>
                    )}

                    <View style={styles.cardActions}>
                      <Pressable
                        style={styles.addFundsBtn}
                        onPress={() => router.push(`/goals/${goal.id}`)}
                      >
                        <Ionicons
                          name="add-circle-outline"
                          size={16}
                          color={Colors.brand.primary}
                        />
                        <Text style={styles.addFundsBtnText}>Add Funds</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                </MotiView>
              );
            })}
          </ScrollView>

          <Pressable
            style={[styles.fab, { bottom: insets.bottom + 20 }]}
            onPress={() => router.push("/goals/create")}
          >
            <Ionicons name="add" size={28} color={Colors.white} />
          </Pressable>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
  },
  emptyInner: {
    alignItems: "center",
    width: "100%",
  },
  emptyEmoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 22,
    color: Colors.ink[900],
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.ink[500],
    textAlign: "center",
  },
  goalCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: Colors.ink[900],
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  emojiText: {
    fontSize: 24,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.ink[900],
    marginBottom: 2,
  },
  goalPct: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.ink[500],
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.ink[100],
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: Colors.brand.primary,
  },
  goalAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  savedLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.ink[500],
  },
  savedValue: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.ink[900],
  },
  targetLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.ink[400],
  },
  remainingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[400],
    marginBottom: 12,
  },
  cardActions: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.ink[100],
    paddingTop: 12,
  },
  addFundsBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
  },
  addFundsBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.brand.primary,
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
