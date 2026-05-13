import { useState } from "react";
import {
  View, Text, Pressable, ScrollView, StyleSheet, StatusBar, Modal,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";
import { useAdminStore, type KYCUser, type KYCStatus } from "@/store/adminStore";

const statusColor: Record<KYCStatus, string> = {
  pending: Colors.accent.amber,
  approved: Colors.accent.green,
  rejected: Colors.accent.red,
  under_review: Colors.brand.primary,
};

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { users, auditLog, stats, filters, setFilter, approveUser, rejectUser, flagUser } = useAdminStore();
  const [selectedUser, setSelectedUser] = useState<KYCUser | null>(null);
  const [tab, setTab] = useState<"users" | "audit">("users");

  const filtered = users.filter((u) => {
    if (filters.status !== "all" && u.kycStatus !== filters.status) return false;
    if (filters.type !== "all" && u.type !== filters.type) return false;
    return true;
  });

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="dark-content" />
      <Header title="Admin Dashboard" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Stat Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          {[
            { label: "Total Users", value: stats.totalUsers, icon: "people", color: Colors.brand.primary },
            { label: "Pending KYC", value: stats.pendingKYC, icon: "time", color: Colors.accent.amber },
            { label: "Flagged", value: stats.flagged, icon: "flag", color: Colors.accent.red },
            { label: "Approved", value: stats.approved, icon: "checkmark-circle", color: Colors.accent.green },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "18" }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          {(["users", "audit"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === "users" ? "KYC Users" : "Audit Log"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Filters */}
        {tab === "users" && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {(["all", "pending", "approved", "rejected", "under_review"] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setFilter("status", s)}
                style={[styles.filterChip, filters.status === s && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, filters.status === s && styles.filterTextActive]}>
                  {s === "all" ? "All" : s.replace("_", " ")}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Users List */}
        {tab === "users" && (
          <View style={styles.listContainer}>
            {filtered.map((u) => (
              <Pressable key={u.id} onPress={() => setSelectedUser(u)} style={styles.userRow}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userInitial}>{u.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={styles.userName}>{u.name}</Text>
                    {u.flagged && <Ionicons name="flag" size={12} color={Colors.accent.red} />}
                  </View>
                  <Text style={styles.userSub}>{u.type} · {u.region} · {u.documentType}</Text>
                </View>
                <View style={[styles.kycBadge, { backgroundColor: statusColor[u.kycStatus] + "20" }]}>
                  <Text style={[styles.kycBadgeText, { color: statusColor[u.kycStatus] }]}>
                    {u.kycStatus.replace("_", " ")}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Audit Log */}
        {tab === "audit" && (
          <View style={styles.listContainer}>
            {auditLog.map((a) => (
              <View key={a.id} style={styles.auditRow}>
                <View style={styles.auditDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.auditAction}>{a.action}</Text>
                  <Text style={styles.auditDetail}>
                    {a.targetUser} — {a.details}
                  </Text>
                  <Text style={styles.auditTime}>
                    {a.performedBy} · {new Date(a.timestamp).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* User Detail Modal */}
      <Modal visible={!!selectedUser} transparent animationType="slide" onRequestClose={() => setSelectedUser(null)}>
        <Pressable style={styles.modalBg} onPress={() => setSelectedUser(null)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            {selectedUser && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalInitial}>{selectedUser.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.modalName}>{selectedUser.name}</Text>
                    <Text style={styles.modalEmail}>{selectedUser.email}</Text>
                  </View>
                  <Pressable onPress={() => setSelectedUser(null)}>
                    <Ionicons name="close-circle" size={28} color={Colors.ink[300]} />
                  </Pressable>
                </View>

                <View style={styles.detailGrid}>
                  {[
                    { label: "Phone", value: selectedUser.phone },
                    { label: "Type", value: selectedUser.type },
                    { label: "Region", value: selectedUser.region },
                    { label: "Document", value: selectedUser.documentType },
                    { label: "Risk Score", value: `${selectedUser.riskScore}%` },
                    { label: "Submitted", value: new Date(selectedUser.submittedAt).toLocaleDateString() },
                  ].map((d) => (
                    <View key={d.label} style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{d.label}</Text>
                      <Text style={styles.detailValue}>{d.value}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    onPress={() => { approveUser(selectedUser.id); setSelectedUser(null); }}
                    style={[styles.actionBtn, { backgroundColor: Colors.accent.green }]}
                  >
                    <Ionicons name="checkmark" size={18} color={Colors.white} />
                    <Text style={styles.actionText}>Approve</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { rejectUser(selectedUser.id); setSelectedUser(null); }}
                    style={[styles.actionBtn, { backgroundColor: Colors.accent.red }]}
                  >
                    <Ionicons name="close" size={18} color={Colors.white} />
                    <Text style={styles.actionText}>Reject</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { flagUser(selectedUser.id); setSelectedUser(null); }}
                    style={[styles.actionBtn, { backgroundColor: Colors.accent.amber }]}
                  >
                    <Ionicons name="flag" size={18} color={Colors.white} />
                    <Text style={styles.actionText}>Flag</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: { paddingHorizontal: 18, gap: 12, paddingBottom: 6, marginTop: 4 },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    width: 130,
    shadowColor: "#101225",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.ink[900] },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], marginTop: 2 },
  tabRow: { flexDirection: "row", marginHorizontal: 18, marginTop: 20, backgroundColor: Colors.ink[100], borderRadius: 12, padding: 3 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  tabActive: { backgroundColor: Colors.white },
  tabText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.ink[500] },
  tabTextActive: { color: Colors.brand.primary, fontFamily: "Inter_600SemiBold" },
  filterRow: { paddingHorizontal: 18, gap: 8, marginTop: 14, paddingBottom: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.ink[200] },
  filterChipActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.ink[600], textTransform: "capitalize" },
  filterTextActive: { color: Colors.white },
  listContainer: { paddingHorizontal: 18, marginTop: 14 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#101225",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  userAvatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.brand.primary50, alignItems: "center", justifyContent: "center", marginRight: 12 },
  userInitial: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.brand.primary },
  userName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  userSub: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500], marginTop: 2, textTransform: "capitalize" },
  kycBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  kycBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 10, textTransform: "capitalize" },
  auditRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.ink[100] },
  auditDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.brand.primary, marginTop: 5, marginRight: 12 },
  auditAction: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.ink[900] },
  auditDetail: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[600], marginTop: 2 },
  auditTime: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[400], marginTop: 4 },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  modalAvatar: { width: 50, height: 50, borderRadius: 14, backgroundColor: Colors.brand.primary50, alignItems: "center", justifyContent: "center" },
  modalInitial: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.brand.primary },
  modalName: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.ink[900] },
  modalEmail: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], marginTop: 2 },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  detailItem: { width: "50%", marginBottom: 14 },
  detailLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[400] },
  detailValue: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900], marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12 },
  actionText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.white },
});
