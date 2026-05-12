import { useState } from "react";
import {
  View, Text, Pressable, ScrollView, StyleSheet, StatusBar, Modal, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";
import { useMerchantStore, type Promotion } from "@/store/merchantStore";

export default function MerchantDashboard() {
  const insets = useSafeAreaInsets();
  const { businessName, transactions, promotions, employees, stats, togglePromotion, refundTransaction, addPromotion, removeEmployee } = useMerchantStore();
  const [tab, setTab] = useState<"overview" | "transactions" | "promotions" | "team">("overview");
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promoTitle, setPromoTitle] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="dark-content" />
      <Header title="Merchant Dashboard" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Business Header */}
        <View style={styles.bizHeader}>
          <View style={styles.bizIcon}>
            <Ionicons name="storefront" size={24} color={Colors.brand.primary} />
          </View>
          <View>
            <Text style={styles.bizName}>{businessName}</Text>
            <Text style={styles.bizSub}>Merchant Portal</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(0)}`, icon: "trending-up", color: Colors.accent.green },
            { label: "Today", value: `$${stats.todayRevenue.toFixed(0)}`, icon: "today", color: Colors.brand.primary },
            { label: "Transactions", value: stats.totalTransactions, icon: "receipt", color: Colors.accent.amber },
            { label: "Active Promos", value: stats.activePromos, icon: "pricetag", color: "#E040FB" },
          ].map((s) => (
            <View key={s.label} style={styles.statTile}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {(["overview", "transactions", "promotions", "team"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tabChip, tab === t && styles.tabChipActive]}>
              <Text style={[styles.tabChipText, tab === t && styles.tabChipTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Overview / Recent */}
        {tab === "overview" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions.slice(0, 4).map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: tx.type === "refund" ? Colors.accent.redSoft : Colors.accent.greenSoft }]}>
                  <Ionicons name={tx.type === "refund" ? "arrow-undo" : "arrow-down"} size={16} color={tx.type === "refund" ? Colors.accent.red : Colors.accent.green} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txName}>{tx.customerName}</Text>
                  <Text style={styles.txMeta}>{tx.method} · {new Date(tx.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
                </View>
                <Text style={[styles.txAmount, tx.type === "refund" && { color: Colors.accent.red }]}>
                  {tx.type === "refund" ? "-" : "+"}${tx.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Transactions */}
        {tab === "transactions" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Transactions</Text>
            {transactions.map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: tx.type === "refund" ? Colors.accent.redSoft : Colors.accent.greenSoft }]}>
                  <Ionicons name={tx.type === "refund" ? "arrow-undo" : "arrow-down"} size={16} color={tx.type === "refund" ? Colors.accent.red : Colors.accent.green} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txName}>{tx.customerName}</Text>
                  <Text style={styles.txMeta}>{tx.method} · {tx.status}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.txAmount, tx.type === "refund" && { color: Colors.accent.red }]}>
                    {tx.type === "refund" ? "-" : "+"}${tx.amount.toFixed(2)}
                  </Text>
                  {tx.status === "completed" && (
                    <Pressable onPress={() => refundTransaction(tx.id)} style={styles.refundBtn}>
                      <Text style={styles.refundText}>Refund</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Promotions */}
        {tab === "promotions" && (
          <View style={styles.section}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>Promotions</Text>
              <Pressable onPress={() => setShowAddPromo(true)} style={styles.addBtn}>
                <Ionicons name="add" size={18} color={Colors.white} />
                <Text style={styles.addBtnText}>New</Text>
              </Pressable>
            </View>
            {promotions.map((p) => (
              <View key={p.id} style={styles.promoCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoTitle}>{p.title}</Text>
                  <Text style={styles.promoDesc}>{p.description}</Text>
                  <Text style={styles.promoMeta}>{p.discountPercent}% off · {p.redemptions} used · Expires {new Date(p.validUntil).toLocaleDateString()}</Text>
                </View>
                <Pressable onPress={() => togglePromotion(p.id)} style={[styles.toggleBtn, p.active && styles.toggleActive]}>
                  <Text style={[styles.toggleText, p.active && { color: Colors.white }]}>{p.active ? "Active" : "Paused"}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Team */}
        {tab === "team" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Members</Text>
            {employees.map((e) => (
              <View key={e.id} style={styles.empRow}>
                <View style={styles.empAvatar}>
                  <Text style={styles.empInitial}>{e.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.empName}>{e.name}</Text>
                  <Text style={styles.empRole}>{e.role}</Text>
                </View>
                <Pressable onPress={() => removeEmployee(e.id)}>
                  <Ionicons name="trash-outline" size={18} color={Colors.accent.red} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Promotion Modal */}
      <Modal visible={showAddPromo} transparent animationType="slide" onRequestClose={() => setShowAddPromo(false)}>
        <Pressable style={styles.modalBg} onPress={() => setShowAddPromo(false)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>New Promotion</Text>
            <TextInput value={promoTitle} onChangeText={setPromoTitle} placeholder="Promotion title" style={styles.modalInput} placeholderTextColor={Colors.ink[400]} />
            <TextInput value={promoDiscount} onChangeText={setPromoDiscount} placeholder="Discount %" keyboardType="numeric" style={styles.modalInput} placeholderTextColor={Colors.ink[400]} />
            <Pressable
              onPress={() => {
                if (promoTitle.trim() && promoDiscount) {
                  addPromotion({
                    id: `p-${Date.now()}`,
                    title: promoTitle,
                    description: `${promoDiscount}% discount`,
                    discountPercent: Number(promoDiscount),
                    validUntil: new Date(Date.now() + 2592000000).toISOString(),
                    active: true,
                    redemptions: 0,
                  });
                  setPromoTitle("");
                  setPromoDiscount("");
                  setShowAddPromo(false);
                }
              }}
              style={styles.createBtn}
            >
              <Text style={styles.createBtnText}>Create Promotion</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bizHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, marginBottom: 16, gap: 14 },
  bizIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.brand.primary50, alignItems: "center", justifyContent: "center" },
  bizName: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.ink[900] },
  bizSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], marginTop: 1 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 18, gap: 10 },
  statTile: { width: "47%", backgroundColor: Colors.white, borderRadius: 14, padding: 14, shadowColor: "#101225", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  statVal: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.ink[900], marginTop: 8 },
  statLbl: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500], marginTop: 2 },
  tabRow: { paddingHorizontal: 18, gap: 8, marginTop: 18, paddingBottom: 4 },
  tabChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.ink[200] },
  tabChipActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  tabChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.ink[600] },
  tabChipTextActive: { color: Colors.white },
  section: { paddingHorizontal: 18, marginTop: 16 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.ink[900], marginBottom: 12 },
  txRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 8 },
  txIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
  txName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  txMeta: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500], marginTop: 2, textTransform: "capitalize" },
  txAmount: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.accent.green },
  refundBtn: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: Colors.accent.redSoft, borderRadius: 8 },
  refundText: { fontFamily: "Inter_500Medium", fontSize: 10, color: Colors.accent.red },
  promoCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10 },
  promoTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  promoDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[600], marginTop: 2 },
  promoMeta: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[400], marginTop: 4 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.ink[100] },
  toggleActive: { backgroundColor: Colors.accent.green },
  toggleText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.ink[600] },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.brand.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  addBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: Colors.white },
  empRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, padding: 14, marginBottom: 8 },
  empAvatar: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.brand.primary50, alignItems: "center", justifyContent: "center", marginRight: 12 },
  empInitial: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.brand.primary },
  empName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  empRole: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], marginTop: 1, textTransform: "capitalize" },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.ink[900], marginBottom: 18 },
  modalInput: { backgroundColor: Colors.ink[50], borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.ink[900], marginBottom: 12 },
  createBtn: { backgroundColor: Colors.brand.primary, borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  createBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.white },
});
