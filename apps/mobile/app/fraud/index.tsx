import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";

// ── Types ────────────────────────────────────────────────────────────────────

type AlertStatus = "warning" | "resolved";

type FraudAlert = {
  id: string;
  icon: string;
  title: string;
  detail: string;
  timestamp: string;
  status: AlertStatus;
  location?: string;
  device?: string;
  amount?: string;
};

// ── Seed Data ─────────────────────────────────────────────────────────────────

const INITIAL_ALERTS: FraudAlert[] = [
  {
    id: "a1",
    icon: "phone-portrait-outline",
    title: "Unusual login from new device",
    detail: "A new device logged in from Dubai, UAE",
    timestamp: "2h ago",
    status: "warning",
    location: "Dubai, UAE",
    device: "iPhone 14 Pro · iOS 17.2",
    amount: undefined,
  },
  {
    id: "a2",
    icon: "swap-horizontal-outline",
    title: "Large transfer flagged for review",
    detail: "$600 transfer to external account",
    timestamp: "Yesterday",
    status: "resolved",
    location: undefined,
    device: undefined,
    amount: "$600.00",
  },
];

const PROTECTION_FEATURES = [
  { id: "p1", label: "Behavioral Analysis", desc: "Monitors unusual spending patterns" },
  { id: "p2", label: "Location Verification", desc: "Flags logins from new locations" },
  { id: "p3", label: "Device Fingerprinting", desc: "Detects unrecognized devices" },
  { id: "p4", label: "Transaction Limits", desc: "Auto-holds high-value transfers" },
];

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ visible, message }: { visible: boolean; message: string }) {
  return (
    <MotiView
      animate={{ opacity: visible ? 1 : 0, translateY: visible ? 0 : 16 }}
      transition={{ type: "timing", duration: 280 }}
      pointerEvents="none"
      style={styles.toast}
    >
      <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
      <Text style={styles.toastText}>{message}</Text>
    </MotiView>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function FraudScreen() {
  const insets = useSafeAreaInsets();

  const [alerts, setAlerts] = useState<FraudAlert[]>(INITIAL_ALERTS);
  const [reviewAlert, setReviewAlert] = useState<FraudAlert | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2400);
  };

  const handleMarkSafe = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "resolved" } : a)));
    setReviewAlert(null);
    showToast("Alert marked as safe");
  };

  const handleBlockReport = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setReviewAlert(null);
    showToast("Alert reported & blocked");
  };

  const handleReport = () => {
    if (!reportText.trim()) return;
    setReportModalOpen(false);
    setReportText("");
    showToast("Report submitted successfully");
  };

  return (
    <Screen bg={Colors.surface.background}>
      <Header title="Security Monitor" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* ── Security Score Card ── */}
        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 420 }}
        >
          <LinearGradient
            colors={["#1A9E7E", "#0E7A60"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreCard}
          >
            <View style={styles.decoCircle1} pointerEvents="none" />
            <View style={styles.decoCircle2} pointerEvents="none" />
            <View style={styles.scoreRow}>
              <View style={styles.scoreLeft}>
                <Text style={styles.scoreTitle}>Security Score</Text>
                <Text style={styles.scoreValue}>94 / 100 ✅</Text>
                <Text style={styles.scoreSub}>Your account is well protected</Text>
              </View>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreCircleNum}>94</Text>
                <Text style={styles.scoreCircleLabel}>/ 100</Text>
              </View>
            </View>
            {/* Score bar */}
            <View style={styles.scoreBarBg}>
              <MotiView
                from={{ width: "0%" }}
                animate={{ width: "94%" as any }}
                transition={{ type: "timing", duration: 900, delay: 300 }}
                style={styles.scoreBarFill}
              />
            </View>
          </LinearGradient>
        </MotiView>

        {/* ── Recent Alerts ── */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 380, delay: 120 }}
        >
          <Text style={styles.sectionLabel}>Recent Alerts</Text>
          {alerts.map((alert, i) => (
            <MotiView
              key={alert.id}
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: "timing", duration: 320, delay: 160 + i * 80 }}
            >
              <View style={styles.alertCard}>
                <View
                  style={[
                    styles.alertIconWrap,
                    {
                      backgroundColor:
                        alert.status === "warning"
                          ? Colors.accent.amber + "20"
                          : Colors.accent.greenSoft,
                    },
                  ]}
                >
                  <Ionicons
                    name={alert.icon as any}
                    size={20}
                    color={alert.status === "warning" ? Colors.accent.amber : Colors.accent.green}
                  />
                </View>
                <View style={styles.alertBody}>
                  <View style={styles.alertTopRow}>
                    <Text style={styles.alertTitle} numberOfLines={1}>
                      {alert.title}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            alert.status === "warning"
                              ? Colors.accent.amber + "20"
                              : Colors.accent.greenSoft,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          {
                            color:
                              alert.status === "warning"
                                ? Colors.accent.amber
                                : Colors.accent.green,
                          },
                        ]}
                      >
                        {alert.status === "warning" ? "Review" : "Resolved"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.alertDetail}>{alert.detail}</Text>
                  <View style={styles.alertFootRow}>
                    <Text style={styles.alertTime}>{alert.timestamp}</Text>
                    {alert.status === "warning" ? (
                      <Pressable style={styles.reviewBtn} onPress={() => setReviewAlert(alert)}>
                        <Text style={styles.reviewBtnText}>Review</Text>
                      </Pressable>
                    ) : (
                      <View style={styles.resolvedChip}>
                        <Ionicons name="checkmark-circle" size={12} color={Colors.accent.green} />
                        <Text style={styles.resolvedText}>Resolved</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </MotiView>
          ))}
        </MotiView>

        {/* ── Protection Features ── */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 380, delay: 340 }}
        >
          <Text style={styles.sectionLabel}>Protection Features</Text>
          <View style={styles.protectionCard}>
            {PROTECTION_FEATURES.map((feat, i) => (
              <MotiView
                key={feat.id}
                from={{ opacity: 0, translateX: -8 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: "timing", duration: 280, delay: 380 + i * 60 }}
              >
                <View
                  style={[
                    styles.featRow,
                    i < PROTECTION_FEATURES.length - 1 && styles.featRowBorder,
                  ]}
                >
                  <View style={styles.featCheck}>
                    <Ionicons name="checkmark" size={14} color={Colors.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.featLabel}>{feat.label} ✓</Text>
                    <Text style={styles.featDesc}>{feat.desc}</Text>
                  </View>
                  <View style={styles.activeDot} />
                </View>
              </MotiView>
            ))}
          </View>
        </MotiView>

        {/* ── Report Button ── */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 380, delay: 500 }}
          style={styles.reportBtnWrap}
        >
          <Button
            title="Report Suspicious Activity"
            variant="secondary"
            onPress={() => setReportModalOpen(true)}
            icon={<Ionicons name="warning-outline" size={18} color={Colors.brand.primary} />}
          />
        </MotiView>
      </ScrollView>

      {/* ── Review Alert Modal ── */}
      <Modal
        visible={!!reviewAlert}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewAlert(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setReviewAlert(null)}>
          <MotiView
            from={{ translateY: 60, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
            style={styles.modalSheet}
          >
            <Pressable onPress={() => {}}>
              <View style={styles.sheetHandle} />

              {reviewAlert && (
                <>
                  {/* Header */}
                  <View style={styles.reviewHeader}>
                    <View
                      style={[styles.reviewIcon, { backgroundColor: Colors.accent.amber + "20" }]}
                    >
                      <Ionicons
                        name={reviewAlert.icon as any}
                        size={26}
                        color={Colors.accent.amber}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewTitle}>{reviewAlert.title}</Text>
                      <Text style={styles.reviewTime}>{reviewAlert.timestamp}</Text>
                    </View>
                  </View>

                  <Text style={styles.reviewDetail}>{reviewAlert.detail}</Text>

                  {/* Detail rows */}
                  <View style={styles.detailBox}>
                    {reviewAlert.location && (
                      <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color={Colors.ink[400]} />
                        <Text style={styles.detailKey}>Location</Text>
                        <Text style={styles.detailVal}>{reviewAlert.location}</Text>
                      </View>
                    )}
                    {reviewAlert.device && (
                      <View style={styles.detailRow}>
                        <Ionicons name="phone-portrait-outline" size={16} color={Colors.ink[400]} />
                        <Text style={styles.detailKey}>Device</Text>
                        <Text style={styles.detailVal}>{reviewAlert.device}</Text>
                      </View>
                    )}
                    {reviewAlert.amount && (
                      <View style={styles.detailRow}>
                        <Ionicons name="cash-outline" size={16} color={Colors.ink[400]} />
                        <Text style={styles.detailKey}>Amount</Text>
                        <Text style={styles.detailVal}>{reviewAlert.amount}</Text>
                      </View>
                    )}
                    <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                      <Ionicons name="time-outline" size={16} color={Colors.ink[400]} />
                      <Text style={styles.detailKey}>Timestamp</Text>
                      <Text style={styles.detailVal}>{reviewAlert.timestamp}</Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.reviewActions}>
                    <Pressable
                      style={[styles.reviewActionBtn, { backgroundColor: Colors.accent.greenSoft }]}
                      onPress={() => handleMarkSafe(reviewAlert.id)}
                    >
                      <Ionicons name="checkmark-circle" size={18} color={Colors.accent.green} />
                      <Text style={[styles.reviewActionText, { color: Colors.accent.green }]}>
                        Mark as Safe
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.reviewActionBtn, { backgroundColor: Colors.accent.redSoft }]}
                      onPress={() => handleBlockReport(reviewAlert.id)}
                    >
                      <Ionicons name="ban" size={18} color={Colors.accent.red} />
                      <Text style={[styles.reviewActionText, { color: Colors.accent.red }]}>
                        Block & Report
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </Pressable>
          </MotiView>
        </Pressable>
      </Modal>

      {/* ── Report Modal ── */}
      <Modal
        visible={reportModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setReportModalOpen(false)}>
            <MotiView
              from={{ translateY: 60, opacity: 0 }}
              animate={{ translateY: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 22, stiffness: 220 }}
              style={styles.modalSheet}
            >
              <Pressable onPress={() => {}}>
                <View style={styles.sheetHandle} />
                <Text style={styles.reportModalTitle}>Report Suspicious Activity</Text>
                <Text style={styles.reportModalSub}>
                  Describe the suspicious activity and our team will review it promptly.
                </Text>
                <TextInput
                  style={styles.reportInput}
                  placeholder="Describe what happened..."
                  placeholderTextColor={Colors.ink[400]}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  value={reportText}
                  onChangeText={setReportText}
                />
                <Button
                  title="Submit Report"
                  onPress={handleReport}
                  disabled={!reportText.trim()}
                  style={{ marginTop: 12 }}
                />
              </Pressable>
            </MotiView>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Toast ── */}
      <Toast visible={toastVisible} message={toastMessage} />
    </Screen>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  // Score card
  scoreCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    overflow: "hidden",
  },
  decoCircle1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  decoCircle2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 14,
  },
  scoreLeft: {
    flex: 1,
  },
  scoreTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 4,
  },
  scoreValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.white,
  },
  scoreSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  scoreCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreCircleNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.white,
  },
  scoreCircleLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
  },
  scoreBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  scoreBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  // Section label
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
    marginBottom: 12,
  },
  // Alert cards
  alertCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#101225",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  alertIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  alertBody: {
    flex: 1,
  },
  alertTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  alertTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.ink[900],
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
  },
  alertDetail: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[600],
    lineHeight: 17,
    marginBottom: 8,
  },
  alertFootRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  alertTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.ink[400],
  },
  reviewBtn: {
    backgroundColor: Colors.brand.primary50,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  reviewBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.brand.primary,
  },
  resolvedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resolvedText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: Colors.accent.green,
  },
  // Protection features
  protectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 22,
    shadowColor: "#101225",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  featRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink[100],
  },
  featCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent.green,
    alignItems: "center",
    justifyContent: "center",
  },
  featLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[900],
  },
  featDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.ink[500],
    marginTop: 1,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent.green,
  },
  reportBtnWrap: {
    marginBottom: 10,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(16,18,37,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ink[200],
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  // Review modal
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  reviewIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.ink[900],
  },
  reviewTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    marginTop: 2,
  },
  reviewDetail: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.ink[700],
    lineHeight: 21,
    marginBottom: 16,
  },
  detailBox: {
    backgroundColor: Colors.ink[50],
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink[100],
  },
  detailKey: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    width: 70,
  },
  detailVal: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.ink[900],
    flex: 1,
  },
  reviewActions: {
    flexDirection: "row",
    gap: 10,
  },
  reviewActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  reviewActionText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  // Report modal
  reportModalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.ink[900],
    marginBottom: 6,
  },
  reportModalSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.ink[500],
    lineHeight: 19,
    marginBottom: 16,
  },
  reportInput: {
    backgroundColor: Colors.ink[50],
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.ink[900],
    minHeight: 120,
  },
  // Toast
  toast: {
    position: "absolute",
    bottom: 48,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.accent.green,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.white,
  },
});
