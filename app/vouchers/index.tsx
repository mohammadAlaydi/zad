import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";
import type { Voucher, Currency } from "@/store/appStore";

// ─── Voucher catalog ───────────────────────────────────────────────────────────
type CatalogItem = {
  id: string;
  type: Voucher["type"];
  merchant: string;
  value: number;
  price: number;
  emoji: string;
  description: string;
};

const CATALOG: CatalogItem[] = [
  { id: "cat1", type: "mobile_topup", merchant: "Etisalat", value: 20, price: 20, emoji: "📱", description: "Mobile top-up for Etisalat" },
  { id: "cat2", type: "mobile_topup", merchant: "Du",       value: 50, price: 50, emoji: "📱", description: "Mobile top-up for Du" },
  { id: "cat3", type: "gift_card",    merchant: "Amazon",   value: 25, price: 25, emoji: "🎁", description: "Amazon Gift Card" },
  { id: "cat4", type: "gift_card",    merchant: "Apple",    value: 50, price: 50, emoji: "🍎", description: "Apple App Store / iTunes" },
  { id: "cat5", type: "gift_card",    merchant: "Noon",     value: 100, price: 100, emoji: "🛍️", description: "Noon.com Gift Card" },
  { id: "cat6", type: "service_credit", merchant: "Netflix", value: 15, price: 15, emoji: "🎬", description: "1-month Netflix credit" },
  { id: "cat7", type: "service_credit", merchant: "Spotify", value: 10, price: 10, emoji: "🎵", description: "1-month Spotify Premium" },
  { id: "cat8", type: "service_credit", merchant: "Careem", value: 30, price: 30, emoji: "🚗", description: "Careem ride credits" },
];

function typeLabel(t: Voucher["type"]) {
  if (t === "mobile_topup") return "Mobile Top-up";
  if (t === "gift_card") return "Gift Card";
  return "Service Credit";
}
function typeColor(t: Voucher["type"]) {
  if (t === "mobile_topup") return Colors.brand.primary;
  if (t === "gift_card") return Colors.accent.amber;
  return Colors.accent.green;
}
function typeBg(t: Voucher["type"]) {
  if (t === "mobile_topup") return Colors.brand.primary50;
  if (t === "gift_card") return "#FDF6DD";
  return Colors.accent.greenSoft;
}

// ─── My voucher card ───────────────────────────────────────────────────────────
function VoucherCard({
  voucher,
  index,
  onRedeem,
}: {
  voucher: Voucher;
  index: number;
  onRedeem: () => void;
}) {
  const expDate = new Date(voucher.expiresAt);
  const isExpired = expDate < new Date() || voucher.isUsed;
  const daysLeft = Math.ceil((expDate.getTime() - Date.now()) / 86400000);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 55, type: "timing", duration: 300 }}
    >
      <LinearGradient
        colors={
          voucher.isUsed
            ? [Colors.ink[200], Colors.ink[300]]
            : [Colors.brand.gradientStart, Colors.brand.gradientEnd]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={vc.card}
      >
        {/* Decorative circles */}
        <View style={vc.circleLeft} />
        <View style={vc.circleRight} />

        <View style={vc.topRow}>
          <View style={vc.typeTag}>
            <Text style={[vc.typeText, { color: typeColor(voucher.type) }]}>
              {typeLabel(voucher.type)}
            </Text>
          </View>
          {voucher.isUsed ? (
            <View style={vc.usedBadge}>
              <Text style={vc.usedText}>Used</Text>
            </View>
          ) : (
            <Text style={vc.expiry}>
              {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
            </Text>
          )}
        </View>

        <Text style={vc.merchant}>{voucher.merchant}</Text>
        <Text style={vc.value}>
          {voucher.currency} {voucher.value.toFixed(2)}
        </Text>

        <View style={vc.divider}>
          <View style={vc.notchLeft} />
          <View style={vc.dashedLine} />
          <View style={vc.notchRight} />
        </View>

        <View style={vc.bottomRow}>
          <View>
            <Text style={vc.codeLabel}>Code</Text>
            <Text style={vc.codeValue}>{voucher.code}</Text>
          </View>
          {!voucher.isUsed && daysLeft > 0 && (
            <Pressable onPress={onRedeem} style={vc.redeemBtn}>
              <Text style={vc.redeemBtnText}>Redeem</Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>
    </MotiView>
  );
}

const vc = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    overflow: "hidden",
    position: "relative",
  },
  circleLeft: {
    position: "absolute",
    left: -20,
    top: "50%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface.background,
  },
  circleRight: {
    position: "absolute",
    right: -20,
    top: "50%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface.background,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  typeTag: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  typeText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  usedBadge: { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  usedText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.white },
  expiry: { fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.8)" },
  merchant: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.white, marginBottom: 2 },
  value: { fontFamily: "Inter_600SemiBold", fontSize: 28, color: Colors.white, marginBottom: 16 },
  divider: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  notchLeft: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.surface.background },
  dashedLine: { flex: 1, height: 1, borderStyle: "dashed", borderWidth: 1, borderColor: "rgba(255,255,255,0.4)", marginHorizontal: 8 },
  notchRight: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.surface.background },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  codeLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 2 },
  codeValue: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.white, letterSpacing: 2 },
  redeemBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  redeemBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.brand.primary },
});

// ─── Buy modal ─────────────────────────────────────────────────────────────────
function BuyModal({
  visible,
  onClose,
  onBuy,
  currency,
  balance,
}: {
  visible: boolean;
  onClose: () => void;
  onBuy: (item: CatalogItem) => void;
  currency: Currency;
  balance: number;
}) {
  const [tab, setTab] = useState<Voucher["type"]>("mobile_topup");
  const filtered = CATALOG.filter((c) => c.type === tab);

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={bm.overlay} onPress={onClose}>
        <Pressable style={bm.sheet} onPress={() => {}}>
          <View style={bm.handle} />
          <Text style={bm.title}>Buy a Voucher</Text>
          <Text style={bm.balance}>Balance: {currency} {balance.toLocaleString()}</Text>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={bm.tabRow}>
              {(["mobile_topup", "gift_card", "service_credit"] as Voucher["type"][]).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  style={[bm.tab, tab === t && bm.tabActive]}
                >
                  <Text style={[bm.tabText, tab === t && bm.tabTextActive]}>{typeLabel(t)}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
            {filtered.map((item) => {
              const canAfford = balance >= item.price;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => canAfford && onBuy(item)}
                  style={[bm.itemRow, !canAfford && bm.itemDisabled]}
                >
                  <Text style={bm.itemEmoji}>{item.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[bm.itemMerchant, !canAfford && { color: Colors.ink[400] }]}>
                      {item.merchant}
                    </Text>
                    <Text style={bm.itemDesc}>{item.description}</Text>
                  </View>
                  <View style={[bm.priceBadge, !canAfford && { backgroundColor: Colors.ink[100] }]}>
                    <Text style={[bm.priceText, !canAfford && { color: Colors.ink[400] }]}>
                      {currency} {item.price}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const bm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.surface.overlay, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.ink[200], alignSelf: "center", marginBottom: 20 },
  title: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.ink[900], marginBottom: 4 },
  balance: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[500], marginBottom: 16 },
  tabRow: { flexDirection: "row", gap: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
  },
  tabActive: { borderColor: Colors.brand.primary, backgroundColor: Colors.brand.primary50 },
  tabText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.ink[500] },
  tabTextActive: { color: Colors.brand.primary },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink[100],
  },
  itemDisabled: { opacity: 0.45 },
  itemEmoji: { fontSize: 24 },
  itemMerchant: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  itemDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], marginTop: 2 },
  priceBadge: { backgroundColor: Colors.brand.primary50, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  priceText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.brand.primary },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function VouchersScreen() {
  const insets = useSafeAreaInsets();
  const { vouchers, addVoucher, redeemVoucher, activeCurrency, balances, addTransaction } = useApp();
  const [showBuy, setShowBuy] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "used">("active");

  const active = vouchers.filter((v) => !v.isUsed);
  const used = vouchers.filter((v) => v.isUsed);
  const displayed = activeTab === "active" ? active : used;

  function handleBuy(item: CatalogItem) {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    addVoucher({
      id: "vch-" + Date.now(),
      type: item.type,
      merchant: item.merchant,
      value: item.value,
      currency: activeCurrency,
      code,
      expiresAt: expiry.toISOString(),
      isUsed: false,
    });

    addTransaction({
      id: "vch-tx-" + Date.now(),
      name: `${item.merchant} Voucher`,
      category: "Voucher",
      amount: -item.price,
      currency: activeCurrency,
      date: new Date().toISOString(),
      txType: "voucher",
    });

    setShowBuy(false);
  }

  function handleRedeem(id: string) {
    Alert.alert(
      "Redeem Voucher",
      "Mark this voucher as used?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Redeem", style: "destructive", onPress: () => redeemVoucher(id) },
      ]
    );
  }

  const totalValue = active.reduce((sum, v) => sum + v.value, 0);

  return (
    <Screen bg={Colors.surface.background}>
      <Header title="Vouchers" />

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        {active.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 360 }}
            style={s.summaryWrap}
          >
            <LinearGradient
              colors={[Colors.accent.green, "#0EA585"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.summaryCard}
            >
              <Text style={s.summaryLabel}>Active Voucher Value</Text>
              <Text style={s.summaryAmount}>
                {activeCurrency} {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
              <View style={s.summaryRow}>
                <View style={s.pill}>
                  <Ionicons name="ticket-outline" size={12} color="rgba(255,255,255,0.85)" />
                  <Text style={s.pillText}>{active.length} active</Text>
                </View>
                <View style={s.pill}>
                  <Ionicons name="checkmark-circle-outline" size={12} color="rgba(255,255,255,0.85)" />
                  <Text style={s.pillText}>{used.length} used</Text>
                </View>
              </View>
            </LinearGradient>
          </MotiView>
        )}

        {/* Tabs */}
        <View style={s.tabs}>
          {(["active", "used"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setActiveTab(t)}
              style={[s.tab, activeTab === t && s.tabActive]}
            >
              <Text style={[s.tabText, activeTab === t && s.tabTextActive]}>
                {t === "active" ? `Active (${active.length})` : `Used (${used.length})`}
              </Text>
            </Pressable>
          ))}
        </View>

        {displayed.length === 0 ? (
          <MotiView
            from={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 380 }}
            style={s.empty}
          >
            <Text style={s.emptyEmoji}>🎟️</Text>
            <Text style={s.emptyTitle}>
              {activeTab === "active" ? "No Active Vouchers" : "No Used Vouchers"}
            </Text>
            <Text style={s.emptySub}>
              {activeTab === "active"
                ? "Buy vouchers for mobile top-ups, gift cards, and service credits."
                : "Vouchers you've redeemed will appear here."}
            </Text>
            {activeTab === "active" && (
              <Pressable onPress={() => setShowBuy(true)} style={s.emptyBtn}>
                <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
                <Text style={s.emptyBtnText}>Browse Vouchers</Text>
              </Pressable>
            )}
          </MotiView>
        ) : (
          displayed.map((v, i) => (
            <VoucherCard
              key={v.id}
              voucher={v}
              index={i}
              onRedeem={() => handleRedeem(v.id)}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => setShowBuy(true)}
        style={[s.fab, { bottom: insets.bottom + 24 }]}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </Pressable>

      <BuyModal
        visible={showBuy}
        onClose={() => setShowBuy(false)}
        onBuy={handleBuy}
        currency={activeCurrency}
        balance={balances[activeCurrency]}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 18, paddingTop: 8 },
  summaryWrap: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.accent.green,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  summaryCard: { padding: 22, borderRadius: 20 },
  summaryLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 4 },
  summaryAmount: { fontFamily: "Inter_600SemiBold", fontSize: 28, color: Colors.white, marginBottom: 14 },
  summaryRow: { flexDirection: "row", gap: 8 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pillText: { fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.9)" },
  tabs: { flexDirection: "row", gap: 10, marginBottom: 16 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  tabActive: { borderColor: Colors.brand.primary, backgroundColor: Colors.brand.primary50 },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.ink[500] },
  tabTextActive: { color: Colors.brand.primary },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 54, marginBottom: 16 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.ink[900], marginBottom: 8, textAlign: "center" },
  emptySub: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.ink[500], textAlign: "center", lineHeight: 21, marginBottom: 28 },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  emptyBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.white },
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
