import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Modal, Share, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useAuthSession } from "@/features/auth";
import { useCreateUserItem, useUpdateUserItem, useUserItems } from "@/features/userdata";
import type { LoyaltyLevel } from "@/store/appStore";
import { Colors } from "@/theme/colors";

interface LoyaltyState {
  points: number;
  level: LoyaltyLevel;
}

interface ReferralPayload {
  name: string;
  joinedAt: string;
  pointsEarned: number;
}

// ─── Level config ──────────────────────────────────────────────────────────────
const LEVELS: { level: LoyaltyLevel; minPts: number; color: string; bg: string; icon: string }[] = [
  { level: "Bronze", minPts: 0, color: "#B87333", bg: "#F5EBE0", icon: "🥉" },
  { level: "Silver", minPts: 500, color: "#8E9BAE", bg: "#EDF0F5", icon: "🥈" },
  { level: "Gold", minPts: 1500, color: "#D4A017", bg: "#FDF6DD", icon: "🥇" },
  { level: "Platinum", minPts: 5000, color: "#5B6A7E", bg: "#E8EAEE", icon: "💎" },
];

function getLevelIndex(level: LoyaltyLevel) {
  return LEVELS.findIndex((l) => l.level === level);
}
function getNextLevel(level: LoyaltyLevel) {
  const idx = getLevelIndex(level);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}
function getLevelConfig(level: LoyaltyLevel) {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

// ─── Redeem options ────────────────────────────────────────────────────────────
const REDEEM_OPTIONS = [
  {
    label: "Cash Back",
    description: "1 pt = $0.01 wallet credit",
    pts: 100,
    value: "1.00",
    icon: "💸",
  },
  {
    label: "Free Transfer",
    description: "Waive next transfer fee",
    pts: 250,
    value: "Fee waived",
    icon: "✈️",
  },
  {
    label: "Bill Discount",
    description: "5% off your next bill",
    pts: 500,
    value: "5% off",
    icon: "⚡",
  },
  {
    label: "Premium Card",
    description: "Upgrade virtual card",
    pts: 1000,
    value: "Card upgrade",
    icon: "💳",
  },
];

// ─── Redeem Modal ──────────────────────────────────────────────────────────────
function RedeemModal({
  visible,
  points,
  onClose,
  onRedeem,
}: {
  visible: boolean;
  points: number;
  onClose: () => void;
  onRedeem: (pts: number, label: string) => void;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={rm.overlay} onPress={onClose}>
        <Pressable style={rm.sheet} onPress={() => {}}>
          <View style={rm.handle} />
          <Text style={rm.title}>Redeem Points</Text>
          <Text style={rm.balance}>{points.toLocaleString()} pts available</Text>

          {REDEEM_OPTIONS.map((opt) => {
            const canAfford = points >= opt.pts;
            return (
              <Pressable
                key={opt.label}
                onPress={() => {
                  if (canAfford) {
                    onRedeem(opt.pts, opt.label);
                    onClose();
                  }
                }}
                style={[rm.optRow, !canAfford && rm.optDisabled]}
              >
                <Text style={rm.optEmoji}>{opt.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[rm.optLabel, !canAfford && { color: Colors.ink[400] }]}>
                    {opt.label}
                  </Text>
                  <Text style={rm.optDesc}>{opt.description}</Text>
                </View>
                <View style={[rm.ptsBadge, !canAfford && { backgroundColor: Colors.ink[100] }]}>
                  <Text style={[rm.ptsText, !canAfford && { color: Colors.ink[400] }]}>
                    {opt.pts} pts
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const rm = StyleSheet.create({
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
  title: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.ink[900], marginBottom: 4 },
  balance: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.ink[500],
    marginBottom: 20,
  },
  optRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink[100],
  },
  optDisabled: { opacity: 0.5 },
  optEmoji: { fontSize: 22 },
  optLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  optDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], marginTop: 2 },
  ptsBadge: {
    backgroundColor: Colors.brand.primary50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  ptsText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: Colors.brand.primary },
});

// ─── Refer Modal ───────────────────────────────────────────────────────────────
function ReferModal({
  visible,
  userName,
  onClose,
}: {
  visible: boolean;
  userName: string;
  onClose: () => void;
}) {
  const code = (userName.replace("@", "").toUpperCase() + "ZADPAY").slice(0, 10);

  async function handleShare() {
    try {
      await Share.share({
        message: `Join ZADPay and get rewarded! Use my code ${code} when you sign up. Download: https://zadpay.app/ref/${code}`,
      });
    } catch (_) {}
  }

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={ref.overlay} onPress={onClose}>
        <Pressable style={ref.sheet} onPress={() => {}}>
          <View style={ref.handle} />
          <Text style={ref.title}>Refer a Friend</Text>
          <Text style={ref.sub}>
            Earn{" "}
            <Text style={{ color: Colors.brand.primary, fontFamily: "Inter_600SemiBold" }}>
              +200 pts
            </Text>{" "}
            for every friend who signs up with your code.
          </Text>

          <View style={ref.codeWrap}>
            <Text style={ref.codeLabel}>Your referral code</Text>
            <Text style={ref.code}>{code}</Text>
          </View>

          <Button title="Share Code" onPress={handleShare} size="md" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const ref = StyleSheet.create({
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
  title: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.ink[900], marginBottom: 8 },
  sub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.ink[500],
    lineHeight: 21,
    marginBottom: 24,
  },
  codeWrap: {
    backgroundColor: Colors.brand.primary50,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  codeLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.brand.primary,
    marginBottom: 6,
  },
  code: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 26,
    color: Colors.brand.primaryDark,
    letterSpacing: 3,
  },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function LoyaltyScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuthSession();

  // The loyalty "stats" live as a single userdata item (feature="loyalty",
  // first row). Created lazily on first redeem if it doesn't exist.
  const loyaltyQuery = useUserItems<LoyaltyState>("loyalty");
  const loyaltyItem = loyaltyQuery.data?.items[0];
  const loyaltyPoints = loyaltyItem?.payload.points ?? 0;
  const loyaltyLevel = loyaltyItem?.payload.level ?? ("Bronze" as LoyaltyLevel);
  const createLoyalty = useCreateUserItem("loyalty");
  const updateLoyalty = useUpdateUserItem("loyalty");

  // Referrals are 1 row per referral.
  const referralsQuery = useUserItems<ReferralPayload>("referrals");
  const referrals = (referralsQuery.data?.items ?? []).map((it) => ({
    id: it.id,
    ...it.payload,
  }));

  const [showRedeem, setShowRedeem] = useState(false);
  const [showRefer, setShowRefer] = useState(false);
  const [recentRedeemed, setRecentRedeemed] = useState<string | null>(null);

  // Seed the loyalty row on first ever load so subsequent updates have an
  // id to target. Idempotent guard prevents duplicate seeds across renders.
  useEffect(() => {
    if (loyaltyQuery.isFetched && loyaltyItem === undefined && !createLoyalty.isPending) {
      createLoyalty.mutate({ points: 0, level: "Bronze" });
    }
  }, [loyaltyQuery.isFetched, loyaltyItem, createLoyalty]);

  const levelCfg = getLevelConfig(loyaltyLevel);
  const nextLevel = getNextLevel(loyaltyLevel);
  const progressPct = nextLevel
    ? Math.min(
        ((loyaltyPoints - levelCfg.minPts) / (nextLevel.minPts - levelCfg.minPts)) * 100,
        100,
      )
    : 100;

  function handleRedeem(pts: number, label: string) {
    if (loyaltyItem === undefined) return;
    updateLoyalty.mutate({
      id: loyaltyItem.id,
      payload: { points: Math.max(0, loyaltyPoints - pts), level: loyaltyLevel },
    });
    setRecentRedeemed(label);
    setTimeout(() => setRecentRedeemed(null), 3500);
  }

  return (
    <Screen bg={Colors.surface.background}>
      <Header title="Loyalty & Rewards" />

      <ScrollView
        contentContainerStyle={[sc.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Level Hero Card */}
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 380 }}
          style={sc.heroWrap}
        >
          <LinearGradient
            colors={[Colors.brand.gradientStart, Colors.brand.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={sc.heroCard}
          >
            <View style={sc.heroTop}>
              <View>
                <Text style={sc.heroLabel}>Your Points</Text>
                <Text style={sc.heroPoints}>{loyaltyPoints.toLocaleString()} pts</Text>
              </View>
              <View style={[sc.levelBadge, { backgroundColor: levelCfg.bg }]}>
                <Text style={sc.levelEmoji}>{levelCfg.icon}</Text>
                <Text style={[sc.levelText, { color: levelCfg.color }]}>{loyaltyLevel}</Text>
              </View>
            </View>

            {/* Progress to next level */}
            {nextLevel && (
              <View style={sc.progressWrap}>
                <View style={sc.progressTrack}>
                  <MotiView
                    from={{ width: "0%" }}
                    animate={{ width: `${progressPct}%` as any }}
                    transition={{ type: "timing", duration: 800, delay: 300 }}
                    style={sc.progressFill}
                  />
                </View>
                <Text style={sc.progressLabel}>
                  {(nextLevel.minPts - loyaltyPoints).toLocaleString()} pts to {nextLevel.level}
                </Text>
              </View>
            )}
            {!nextLevel && <Text style={sc.maxLevelText}>🏆 You've reached the highest tier!</Text>}
          </LinearGradient>
        </MotiView>

        {/* Toast for redeemed */}
        {recentRedeemed && (
          <MotiView
            from={{ opacity: 0, translateY: -6 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0 }}
            style={sc.toast}
          >
            <Ionicons name="checkmark-circle" size={16} color={Colors.accent.green} />
            <Text style={sc.toastText}>{recentRedeemed} redeemed successfully!</Text>
          </MotiView>
        )}

        {/* Action buttons */}
        <View style={sc.actionsRow}>
          <Pressable onPress={() => setShowRedeem(true)} style={sc.actionBtn}>
            <View style={[sc.actionIcon, { backgroundColor: Colors.brand.primary50 }]}>
              <Ionicons name="gift-outline" size={20} color={Colors.brand.primary} />
            </View>
            <Text style={sc.actionLabel}>Redeem</Text>
          </Pressable>
          <Pressable onPress={() => setShowRefer(true)} style={sc.actionBtn}>
            <View style={[sc.actionIcon, { backgroundColor: Colors.accent.greenSoft }]}>
              <Ionicons name="person-add-outline" size={20} color={Colors.accent.green} />
            </View>
            <Text style={sc.actionLabel}>Refer</Text>
          </Pressable>
          <Pressable style={sc.actionBtn}>
            <View style={[sc.actionIcon, { backgroundColor: Colors.accent.redSoft }]}>
              <Ionicons name="bar-chart-outline" size={20} color={Colors.accent.red} />
            </View>
            <Text style={sc.actionLabel}>History</Text>
          </Pressable>
        </View>

        {/* How to earn */}
        <Text style={sc.sectionTitle}>How to Earn Points</Text>
        <View style={sc.earnCard}>
          {[
            { icon: "paper-plane-outline", label: "Send money", pts: "+5 pts" },
            { icon: "card-outline", label: "Card payments", pts: "+10 pts" },
            { icon: "storefront-outline", label: "Merchant purchase", pts: "+20 pts" },
            { icon: "person-add-outline", label: "Successful referral", pts: "+200 pts" },
          ].map((row, i) => (
            <View
              key={row.label}
              style={[sc.earnRow, i > 0 && { borderTopWidth: 1, borderTopColor: Colors.ink[100] }]}
            >
              <View style={sc.earnIconWrap}>
                <Ionicons name={row.icon as any} size={16} color={Colors.brand.primary} />
              </View>
              <Text style={sc.earnLabel}>{row.label}</Text>
              <Text style={sc.earnPts}>{row.pts}</Text>
            </View>
          ))}
        </View>

        {/* Referral history */}
        {referrals.length > 0 && (
          <>
            <Text style={sc.sectionTitle}>Referrals</Text>
            {referrals.map((r, i) => (
              <MotiView
                key={r.id}
                from={{ opacity: 0, translateX: -10 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: i * 50, type: "timing", duration: 280 }}
                style={sc.referralRow}
              >
                <View style={sc.referralAvatar}>
                  <Text style={sc.referralInitial}>{r.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={sc.referralName}>{r.name}</Text>
                  <Text style={sc.referralDate}>
                    Joined{" "}
                    {new Date(r.joinedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <Text style={sc.referralPts}>+{r.pointsEarned} pts</Text>
              </MotiView>
            ))}
          </>
        )}
      </ScrollView>

      <RedeemModal
        visible={showRedeem}
        points={loyaltyPoints}
        onClose={() => setShowRedeem(false)}
        onRedeem={handleRedeem}
      />
      <ReferModal
        visible={showRefer}
        userName={session?.user.fullName ?? ""}
        onClose={() => setShowRefer(false)}
      />
    </Screen>
  );
}

const sc = StyleSheet.create({
  scroll: { paddingHorizontal: 18, paddingTop: 8 },
  heroWrap: {
    marginBottom: 18,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: Colors.brand.gradientEnd,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heroCard: { padding: 22, borderRadius: 22 },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  heroLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 4,
  },
  heroPoints: { fontFamily: "Inter_600SemiBold", fontSize: 32, color: Colors.white },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelEmoji: { fontSize: 16 },
  levelText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  progressWrap: { gap: 6 },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3, backgroundColor: "rgba(255,255,255,0.85)" },
  progressLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.75)" },
  maxLevelText: { fontFamily: "Inter_500Medium", fontSize: 13, color: "rgba(255,255,255,0.85)" },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.accent.greenSoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  toastText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.accent.green, flex: 1 },
  actionsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1, alignItems: "center", gap: 8 },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.ink[700] },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.ink[500],
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  earnCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 22,
    shadowColor: Colors.ink[900],
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  earnRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13 },
  earnIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
  },
  earnLabel: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.ink[800] },
  earnPts: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.accent.green },
  referralRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: Colors.ink[900],
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  referralAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  referralInitial: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.white },
  referralName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  referralDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    marginTop: 2,
  },
  referralPts: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.accent.green },
});
