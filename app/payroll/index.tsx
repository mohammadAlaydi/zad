import { useState } from "react";
import {
  View, Text, Pressable, ScrollView, StyleSheet, StatusBar, Modal, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Colors } from "@/theme/colors";

type PayrollEntry = {
  id: string;
  employeeName: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  paidAt: string;
};

type SalaryAdvance = {
  id: string;
  employeeName: string;
  requestedAmount: number;
  approvedAmount: number;
  status: "pending" | "approved" | "repaying" | "completed" | "rejected";
  requestDate: string;
  repaidAmount: number;
};

const samplePayroll: PayrollEntry[] = [
  { id: "pr1", employeeName: "Ali Mohammed", amount: 3200, currency: "USD", status: "paid", paidAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "pr2", employeeName: "Hassan Omar", amount: 2800, currency: "USD", status: "paid", paidAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "pr3", employeeName: "Noor Ahmed", amount: 2500, currency: "USD", status: "pending", paidAt: "" },
  { id: "pr4", employeeName: "Fatima Khalil", amount: 3500, currency: "USD", status: "paid", paidAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "pr5", employeeName: "Sara Mohammed", amount: 2900, currency: "USD", status: "failed", paidAt: "" },
];

const sampleAdvances: SalaryAdvance[] = [
  { id: "sa1", employeeName: "Ali Mohammed", requestedAmount: 1000, approvedAmount: 800, status: "repaying", requestDate: new Date(Date.now() - 604800000).toISOString(), repaidAmount: 400 },
  { id: "sa2", employeeName: "Noor Ahmed", requestedAmount: 500, approvedAmount: 500, status: "completed", requestDate: new Date(Date.now() - 2592000000).toISOString(), repaidAmount: 500 },
  { id: "sa3", employeeName: "Hassan Omar", requestedAmount: 1500, approvedAmount: 0, status: "pending", requestDate: new Date(Date.now() - 172800000).toISOString(), repaidAmount: 0 },
];

export default function PayrollModule() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"payroll" | "advances" | "upload">("payroll");
  const [payroll, setPayroll] = useState(samplePayroll);
  const [advances, setAdvances] = useState(sampleAdvances);
  const [showUpload, setShowUpload] = useState(false);

  const totalPayroll = payroll.reduce((s, p) => s + p.amount, 0);
  const paidCount = payroll.filter((p) => p.status === "paid").length;
  const activeAdvances = advances.filter((a) => a.status === "repaying" || a.status === "pending").length;

  const approveAdvance = (id: string) => {
    setAdvances((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "approved" as const, approvedAmount: a.requestedAmount } : a
      )
    );
  };

  const rejectAdvance = (id: string) => {
    setAdvances((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "rejected" as const } : a
      )
    );
  };

  const processPayroll = () => {
    setPayroll((prev) =>
      prev.map((p) =>
        p.status === "pending" ? { ...p, status: "paid" as const, paidAt: new Date().toISOString() } : p
      )
    );
  };

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="dark-content" />
      <Header title="Payroll" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="cash" size={20} color={Colors.brand.primary} />
            <Text style={styles.statVal}>${totalPayroll.toLocaleString()}</Text>
            <Text style={styles.statLbl}>Total Payroll</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.accent.green} />
            <Text style={styles.statVal}>{paidCount}/{payroll.length}</Text>
            <Text style={styles.statLbl}>Paid</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={20} color={Colors.accent.amber} />
            <Text style={styles.statVal}>{activeAdvances}</Text>
            <Text style={styles.statLbl}>Active Advances</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(["payroll", "advances", "upload"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tabChip, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === "upload" ? "Upload" : t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Payroll List */}
        {tab === "payroll" && (
          <View style={styles.section}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>Current Cycle</Text>
              <Pressable onPress={processPayroll} style={styles.processBtn}>
                <Ionicons name="flash" size={14} color={Colors.white} />
                <Text style={styles.processBtnText}>Process All</Text>
              </Pressable>
            </View>
            {payroll.map((p) => (
              <View key={p.id} style={styles.empRow}>
                <View style={styles.empAvatar}>
                  <Text style={styles.empInitial}>{p.employeeName[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.empName}>{p.employeeName}</Text>
                  <Text style={styles.empMeta}>
                    {p.status === "paid" ? `Paid ${new Date(p.paidAt).toLocaleDateString()}` : p.status}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.empAmount}>${p.amount.toLocaleString()}</Text>
                  <View style={[styles.statusDot, {
                    backgroundColor: p.status === "paid" ? Colors.accent.green :
                      p.status === "pending" ? Colors.accent.amber : Colors.accent.red
                  }]} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Salary Advances */}
        {tab === "advances" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Salary Advance Requests</Text>
            {advances.map((a) => (
              <View key={a.id} style={styles.advCard}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <View style={styles.empAvatar}>
                    <Text style={styles.empInitial}>{a.employeeName[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.empName}>{a.employeeName}</Text>
                    <Text style={styles.empMeta}>Requested {new Date(a.requestDate).toLocaleDateString()}</Text>
                  </View>
                  <View style={[styles.advBadge, {
                    backgroundColor: a.status === "completed" ? Colors.accent.greenSoft :
                      a.status === "repaying" ? "#E8F0FE" :
                      a.status === "rejected" ? Colors.accent.redSoft :
                      a.status === "approved" ? Colors.accent.greenSoft : "#FFF3E0"
                  }]}>
                    <Text style={styles.advBadgeText}>{a.status}</Text>
                  </View>
                </View>

                <View style={styles.advDetails}>
                  <View style={styles.advDetailItem}>
                    <Text style={styles.advLabel}>Requested</Text>
                    <Text style={styles.advValue}>${a.requestedAmount}</Text>
                  </View>
                  <View style={styles.advDetailItem}>
                    <Text style={styles.advLabel}>Approved</Text>
                    <Text style={styles.advValue}>${a.approvedAmount}</Text>
                  </View>
                  <View style={styles.advDetailItem}>
                    <Text style={styles.advLabel}>Repaid</Text>
                    <Text style={styles.advValue}>${a.repaidAmount}</Text>
                  </View>
                </View>

                {a.status === "repaying" && (
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${(a.repaidAmount / a.approvedAmount) * 100}%` }]} />
                  </View>
                )}

                {a.status === "pending" && (
                  <View style={styles.advActions}>
                    <Pressable onPress={() => approveAdvance(a.id)} style={[styles.advBtn, { backgroundColor: Colors.accent.green }]}>
                      <Text style={styles.advBtnText}>Approve</Text>
                    </Pressable>
                    <Pressable onPress={() => rejectAdvance(a.id)} style={[styles.advBtn, { backgroundColor: Colors.accent.red }]}>
                      <Text style={styles.advBtnText}>Reject</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Upload */}
        {tab === "upload" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upload Payroll Data</Text>
            <View style={styles.uploadCard}>
              <View style={styles.uploadIcon}>
                <Ionicons name="cloud-upload" size={40} color={Colors.brand.primary} />
              </View>
              <Text style={styles.uploadTitle}>Upload Monthly Payroll</Text>
              <Text style={styles.uploadSub}>
                Upload a CSV or Excel file with employee names, amounts, and wallet IDs. Salaries will be deposited directly into employee wallets.
              </Text>
              <Button
                title="Choose File"
                variant="secondary"
                onPress={() => setShowUpload(true)}
                style={{ marginTop: 16 }}
                size="md"
              />
            </View>

            <View style={styles.formatGuide}>
              <Text style={styles.formatTitle}>Required File Format</Text>
              <View style={styles.formatRow}>
                <Text style={styles.formatHeader}>Column</Text>
                <Text style={styles.formatHeader}>Example</Text>
              </View>
              {[
                { col: "employee_name", ex: "Ali Mohammed" },
                { col: "wallet_id", ex: "@ali_m" },
                { col: "amount", ex: "3200.00" },
                { col: "currency", ex: "USD" },
              ].map((r) => (
                <View key={r.col} style={styles.formatRow}>
                  <Text style={styles.formatCol}>{r.col}</Text>
                  <Text style={styles.formatEx}>{r.ex}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Upload Modal */}
      <Modal visible={showUpload} transparent animationType="slide" onRequestClose={() => setShowUpload(false)}>
        <Pressable style={styles.modalBg} onPress={() => setShowUpload(false)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.accent.green} style={{ alignSelf: "center" }} />
            <Text style={styles.modalTitle}>File Uploaded</Text>
            <Text style={styles.modalSub}>5 employees detected. Payroll will be processed after review.</Text>
            <Button title="Process Payroll" onPress={() => { processPayroll(); setShowUpload(false); }} style={{ marginTop: 16 }} />
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: "row", paddingHorizontal: 18, gap: 10 },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 14, shadowColor: "#101225", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  statVal: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.ink[900], marginTop: 8 },
  statLbl: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.ink[500], marginTop: 2 },
  tabRow: { flexDirection: "row", paddingHorizontal: 18, gap: 8, marginTop: 16 },
  tabChip: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.white, alignItems: "center", borderWidth: 1, borderColor: Colors.ink[200] },
  tabActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  tabText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.ink[600] },
  tabTextActive: { color: Colors.white },
  section: { paddingHorizontal: 18, marginTop: 16 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.ink[900], marginBottom: 12 },
  processBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.brand.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  processBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: Colors.white },
  empRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 8 },
  empAvatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.brand.primary50, alignItems: "center", justifyContent: "center", marginRight: 12 },
  empInitial: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.brand.primary },
  empName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  empMeta: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500], marginTop: 2, textTransform: "capitalize" },
  empAmount: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.ink[900] },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  advCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10 },
  advBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  advBadgeText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.ink[700], textTransform: "capitalize" },
  advDetails: { flexDirection: "row", justifyContent: "space-between", backgroundColor: Colors.ink[50], borderRadius: 10, padding: 10 },
  advDetailItem: { alignItems: "center" },
  advLabel: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.ink[500] },
  advValue: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.ink[900], marginTop: 2 },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: Colors.ink[100], marginTop: 10 },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: Colors.accent.green },
  advActions: { flexDirection: "row", gap: 8, marginTop: 10 },
  advBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  advBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.white },
  uploadCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 24, alignItems: "center", borderWidth: 2, borderColor: Colors.ink[200], borderStyle: "dashed" },
  uploadIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: Colors.brand.primary50, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  uploadTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.ink[900] },
  uploadSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[500], textAlign: "center", marginTop: 6, lineHeight: 19 },
  formatGuide: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginTop: 14 },
  formatTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900], marginBottom: 10 },
  formatRow: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.ink[100] },
  formatHeader: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 12, color: Colors.ink[600] },
  formatCol: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.ink[800] },
  formatEx: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500] },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.ink[900], textAlign: "center", marginTop: 12 },
  modalSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[500], textAlign: "center", marginTop: 6 },
});
