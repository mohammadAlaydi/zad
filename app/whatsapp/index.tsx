import { useState } from "react";
import {
  View, Text, Pressable, ScrollView, StyleSheet, StatusBar, Switch,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Colors } from "@/theme/colors";
import { useApp } from "@/store/appStore";

const COMMANDS = [
  { cmd: "balance", desc: "Check your wallet balance in any currency", example: "\"What's my balance?\"" },
  { cmd: "send", desc: "Send money to another ZADPay user", example: "\"Send $50 to @ahmed\"" },
  { cmd: "receive", desc: "Generate a payment request link", example: "\"Request $100 from @sara\"" },
  { cmd: "history", desc: "View your recent transactions", example: "\"Show last 5 transactions\"" },
  { cmd: "rates", desc: "Check live exchange rates", example: "\"USD to AED rate\"" },
  { cmd: "help", desc: "Get help and see all commands", example: "\"Help\"" },
];

export default function WhatsAppBot() {
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const [isLinked, setIsLinked] = useState(false);
  const [balanceNotif, setBalanceNotif] = useState(true);
  const [txNotif, setTxNotif] = useState(true);
  const [securityNotif, setSecurityNotif] = useState(true);

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="dark-content" />
      <Header title="WhatsApp Bot" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.waIconBig}>
            <FontAwesome5 name="whatsapp" size={40} color="#25D366" />
          </View>
          <Text style={styles.heroTitle}>ZADPay on WhatsApp</Text>
          <Text style={styles.heroSub}>
            Manage your wallet, send money, and check balances — all through WhatsApp.
          </Text>
          {!isLinked ? (
            <Button
              title="Link WhatsApp Account"
              onPress={() => setIsLinked(true)}
              icon={<FontAwesome5 name="whatsapp" size={16} color={Colors.white} />}
              style={{ marginTop: 18 }}
            />
          ) : (
            <View style={styles.linkedBadge}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.accent.green} />
              <Text style={styles.linkedText}>Linked to {user.phone}</Text>
            </View>
          )}
        </View>

        {/* Status */}
        {isLinked && (
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusLabel}>Bot Active</Text>
            </View>
            <Text style={styles.statusPhone}>Connected to: {user.phone}</Text>
            <Text style={styles.statusInfo}>
              Identity verified via secure OTP binding. Messages are end-to-end encrypted.
            </Text>
            <Pressable onPress={() => setIsLinked(false)} style={styles.unlinkBtn}>
              <Ionicons name="unlink" size={14} color={Colors.accent.red} />
              <Text style={styles.unlinkText}>Unlink Account</Text>
            </Pressable>
          </View>
        )}

        {/* Commands Reference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Commands</Text>
          <Text style={styles.sectionSub}>Chat naturally or use these commands</Text>
          {COMMANDS.map((c) => (
            <View key={c.cmd} style={styles.cmdCard}>
              <View style={styles.cmdIcon}>
                <Text style={styles.cmdSlash}>/</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cmdName}>{c.cmd}</Text>
                <Text style={styles.cmdDesc}>{c.desc}</Text>
                <View style={styles.exampleWrap}>
                  <Text style={styles.exampleText}>{c.example}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Notification Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <View style={styles.prefCard}>
            {[
              { label: "Balance Updates", desc: "Get notified of balance changes", value: balanceNotif, toggle: setBalanceNotif },
              { label: "Transaction Alerts", desc: "Real-time send/receive notifications", value: txNotif, toggle: setTxNotif },
              { label: "Security Alerts", desc: "Suspicious activity warnings", value: securityNotif, toggle: setSecurityNotif },
            ].map((pref, i) => (
              <View key={pref.label} style={[styles.prefRow, i < 2 && styles.prefBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prefLabel}>{pref.label}</Text>
                  <Text style={styles.prefDesc}>{pref.desc}</Text>
                </View>
                <Switch
                  value={pref.value}
                  onValueChange={pref.toggle}
                  trackColor={{ false: Colors.ink[200], true: Colors.accent.green }}
                  thumbColor={Colors.white}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.accent.green} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.secTitle}>Secure Identity Binding</Text>
            <Text style={styles.secDesc}>
              Your WhatsApp number is verified and bound to your ZADPay account via OTP. All commands require identity confirmation for transactions above $100.
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: { marginHorizontal: 18, backgroundColor: Colors.white, borderRadius: 20, padding: 24, alignItems: "center", shadowColor: "#101225", shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  waIconBig: { width: 72, height: 72, borderRadius: 20, backgroundColor: "#E8F8EE", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  heroTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.ink[900] },
  heroSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[500], textAlign: "center", marginTop: 6, lineHeight: 19 },
  linkedBadge: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 18, backgroundColor: Colors.accent.greenSoft, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  linkedText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.accent.green },
  statusCard: { marginHorizontal: 18, marginTop: 12, backgroundColor: Colors.white, borderRadius: 16, padding: 16 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent.green },
  statusLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.accent.green },
  statusPhone: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[600], marginBottom: 4 },
  statusInfo: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], lineHeight: 17 },
  unlinkBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 12, backgroundColor: Colors.accent.redSoft, borderRadius: 12 },
  unlinkText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.accent.red },
  section: { paddingHorizontal: 18, marginTop: 20 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.ink[900] },
  sectionSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], marginTop: 2, marginBottom: 12 },
  cmdCard: { flexDirection: "row", backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 8 },
  cmdIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#E8F8EE", alignItems: "center", justifyContent: "center", marginRight: 12 },
  cmdSlash: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#25D366" },
  cmdName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  cmdDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[600], marginTop: 2 },
  exampleWrap: { backgroundColor: Colors.ink[50], borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start", marginTop: 6 },
  exampleText: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500], fontStyle: "italic" },
  prefCard: { backgroundColor: Colors.white, borderRadius: 16, marginTop: 8 },
  prefRow: { flexDirection: "row", alignItems: "center", padding: 16 },
  prefBorder: { borderBottomWidth: 1, borderBottomColor: Colors.ink[100] },
  prefLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  prefDesc: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500], marginTop: 2 },
  securityNote: { flexDirection: "row", marginHorizontal: 18, marginTop: 20, backgroundColor: Colors.accent.greenSoft, borderRadius: 14, padding: 16 },
  secTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.ink[900] },
  secDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[600], marginTop: 4, lineHeight: 17 },
});
