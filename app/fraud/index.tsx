import { useState } from "react";
import {
  View, Text, Pressable, ScrollView, StyleSheet, StatusBar, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";
import { useFraudStore, type FraudAlert, type RiskLevel, type AlertStatus } from "@/store/fraudStore";

const riskColors: Record<RiskLevel, string> = {
  low: Colors.accent.green,
  medium: Colors.accent.amber,
  high: "#FF6B35",
  critical: Colors.accent.red,
};

const riskIcons: Record<string, string> = {
  suspicious_login: "log-in",
  unusual_topup: "trending-up",
  large_transfer: "swap-horizontal",
  rapid_transactions: "flash",
  location_anomaly: "navigate",
  device_change: "phone-portrait",
};

export default function FraudDashboard() {
  const insets = useSafeAreaInsets();
  const { alerts, riskProfile, stats, updateAlertStatus, dismissAlert } = useFraudStore();
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [filter, setFilter] = useState<"all" | RiskLevel>("all");

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.riskLevel === filter);

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="dark-content" />
      <Header title="Fraud Detection" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Risk Score Card */}
        <View style={styles.riskCard}>
          <View style={styles.riskScoreCircle}>
            <Text style={styles.riskScoreValue}>{riskProfile.overallScore}</Text>
            <Text style={styles.riskScoreLabel}>Risk Score</Text>
          </View>
          <View style={styles.riskBreakdown}>
            {[
              { label: "Login Risk", value: riskProfile.loginRisk, color: riskProfile.loginRisk > 70 ? Colors.accent.red : Colors.accent.amber },
              { label: "Transaction", value: riskProfile.transactionRisk, color: riskProfile.transactionRisk > 70 ? Colors.accent.red : Colors.accent.amber },
              { label: "Behavior", value: riskProfile.behaviorRisk, color: riskProfile.behaviorRisk > 70 ? Colors.accent.red : Colors.accent.green },
            ].map((r) => (
              <View key={r.label} style={styles.riskBarItem}>
                <View style={styles.riskBarRow}>
                  <Text style={styles.riskBarLabel}>{r.label}</Text>
                  <Text style={[styles.riskBarValue, { color: r.color }]}>{r.value}%</Text>
                </View>
                <View style={styles.riskBarBg}>
                  <View style={[styles.riskBarFill, { width: `${r.value}%`, backgroundColor: r.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          {[
            { label: "Total Alerts", value: stats.totalAlerts, icon: "alert-circle", color: Colors.brand.primary },
            { label: "Critical", value: stats.critical, icon: "warning", color: Colors.accent.red },
            { label: "Investigating", value: stats.investigating, icon: "search", color: Colors.accent.amber },
            { label: "Resolved", value: stats.resolved, icon: "checkmark-circle", color: Colors.accent.green },
          ].map((s) => (
            <View key={s.label} style={styles.statChip}>
              <Ionicons name={s.icon as any} size={18} color={s.color} />
              <Text style={styles.statChipVal}>{s.value}</Text>
              <Text style={styles.statChipLbl}>{s.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(["all", "critical", "high", "medium", "low"] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, filter === f && styles.filterActive]}
            >
              {f !== "all" && <View style={[styles.filterDot, { backgroundColor: riskColors[f] }]} />}
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Alert List */}
        <View style={styles.alertList}>
          {filtered.map((alert) => (
            <Pressable key={alert.id} onPress={() => setSelectedAlert(alert)} style={styles.alertCard}>
              <View style={[styles.alertIcon, { backgroundColor: riskColors[alert.riskLevel] + "18" }]}>
                <Ionicons name={riskIcons[alert.type] as any} size={20} color={riskColors[alert.riskLevel]} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <View style={[styles.riskBadge, { backgroundColor: riskColors[alert.riskLevel] + "20" }]}>
                    <Text style={[styles.riskBadgeText, { color: riskColors[alert.riskLevel] }]}>{alert.riskLevel}</Text>
                  </View>
                </View>
                <Text style={styles.alertDesc} numberOfLines={2}>{alert.description}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
                  <Text style={styles.alertTime}>
                    {new Date(alert.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </Text>
                  <View style={[styles.statusDot, {
                    backgroundColor: alert.status === "resolved" ? Colors.accent.green :
                      alert.status === "investigating" ? Colors.accent.amber :
                      alert.status === "dismissed" ? Colors.ink[400] : Colors.accent.red
                  }]} />
                  <Text style={styles.alertStatus}>{alert.status}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Alert Detail Modal */}
      <Modal visible={!!selectedAlert} transparent animationType="slide" onRequestClose={() => setSelectedAlert(null)}>
        <Pressable style={styles.modalBg} onPress={() => setSelectedAlert(null)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            {selectedAlert && (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                  <View style={[styles.modalAlertIcon, { backgroundColor: riskColors[selectedAlert.riskLevel] + "18" }]}>
                    <Ionicons name={riskIcons[selectedAlert.type] as any} size={24} color={riskColors[selectedAlert.riskLevel]} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.modalTitle}>{selectedAlert.title}</Text>
                    <View style={[styles.riskBadge, { backgroundColor: riskColors[selectedAlert.riskLevel] + "20", alignSelf: "flex-start", marginTop: 4 }]}>
                      <Text style={[styles.riskBadgeText, { color: riskColors[selectedAlert.riskLevel] }]}>
                        {selectedAlert.riskLevel.toUpperCase()} RISK
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => setSelectedAlert(null)}>
                    <Ionicons name="close-circle" size={28} color={Colors.ink[300]} />
                  </Pressable>
                </View>

                <Text style={styles.modalDesc}>{selectedAlert.description}</Text>

                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Time</Text>
                    <Text style={styles.detailValue}>{new Date(selectedAlert.timestamp).toLocaleString()}</Text>
                  </View>
                  {selectedAlert.amount && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Amount</Text>
                      <Text style={styles.detailValue}>${selectedAlert.amount.toFixed(2)}</Text>
                    </View>
                  )}
                  {selectedAlert.location && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Location</Text>
                      <Text style={styles.detailValue}>{selectedAlert.location}</Text>
                    </View>
                  )}
                  {selectedAlert.deviceInfo && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Device</Text>
                      <Text style={styles.detailValue}>{selectedAlert.deviceInfo}</Text>
                    </View>
                  )}
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text style={[styles.detailValue, { textTransform: "capitalize" }]}>{selectedAlert.status}</Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    onPress={() => { updateAlertStatus(selectedAlert.id, "investigating"); setSelectedAlert(null); }}
                    style={[styles.actionBtn, { backgroundColor: Colors.accent.amber }]}
                  >
                    <Ionicons name="search" size={16} color={Colors.white} />
                    <Text style={styles.actionText}>Investigate</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { updateAlertStatus(selectedAlert.id, "resolved"); setSelectedAlert(null); }}
                    style={[styles.actionBtn, { backgroundColor: Colors.accent.green }]}
                  >
                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                    <Text style={styles.actionText}>Resolve</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { dismissAlert(selectedAlert.id); setSelectedAlert(null); }}
                    style={[styles.actionBtn, { backgroundColor: Colors.ink[400] }]}
                  >
                    <Ionicons name="close" size={16} color={Colors.white} />
                    <Text style={styles.actionText}>Dismiss</Text>
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
  riskCard: { marginHorizontal: 18, backgroundColor: Colors.white, borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", gap: 18, marginBottom: 6, shadowColor: "#101225", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  riskScoreCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: Colors.accent.amber, alignItems: "center", justifyContent: "center" },
  riskScoreValue: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.ink[900] },
  riskScoreLabel: { fontFamily: "Inter_400Regular", fontSize: 9, color: Colors.ink[500] },
  riskBreakdown: { flex: 1 },
  riskBarItem: { marginBottom: 8 },
  riskBarRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  riskBarLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[600] },
  riskBarValue: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  riskBarBg: { height: 6, borderRadius: 3, backgroundColor: Colors.ink[100] },
  riskBarFill: { height: 6, borderRadius: 3 },
  statsRow: { paddingHorizontal: 18, gap: 10, marginTop: 14, paddingBottom: 4 },
  statChip: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, alignItems: "center", width: 100, shadowColor: "#101225", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  statChipVal: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.ink[900], marginTop: 6 },
  statChipLbl: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.ink[500], marginTop: 2 },
  filterRow: { paddingHorizontal: 18, gap: 8, marginTop: 14, paddingBottom: 4 },
  filterChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.ink[200] },
  filterActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  filterDot: { width: 8, height: 8, borderRadius: 4 },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.ink[600] },
  filterTextActive: { color: Colors.white },
  alertList: { paddingHorizontal: 18, marginTop: 14 },
  alertCard: { flexDirection: "row", backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#101225", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  alertIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  alertTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.ink[900], flex: 1 },
  riskBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  riskBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 9, textTransform: "uppercase" },
  alertDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[600], marginTop: 4, lineHeight: 17 },
  alertTime: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[400] },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  alertStatus: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.ink[500], textTransform: "capitalize" },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalAlertIcon: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.ink[900] },
  modalDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.ink[700], lineHeight: 21, marginBottom: 16 },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 18 },
  detailItem: { width: "50%", marginBottom: 12 },
  detailLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[400] },
  detailValue: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.ink[900], marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12 },
  actionText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: Colors.white },
});
