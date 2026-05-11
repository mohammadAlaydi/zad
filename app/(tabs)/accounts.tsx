import { useState } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl, Modal, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { useApp, Currency } from "@/store/appStore";
import { Colors } from "@/theme/colors";

const FLAGS: Record<Currency, string> = { USD: "🇺🇸", AED: "🇦🇪", CAD: "🇨🇦", AUD: "🇦🇺" };

export default function Accounts() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { balances, activeCurrency, setActiveCurrency } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const myRows = [
    { code: "USD" as Currency, name: "US Dollar", currencySymbol: "$" },
    { code: "AED" as Currency, name: t("accounts.aed"), currencySymbol: "AED" },
  ];

  const addableRows = [
    { code: "AUD" as Currency, name: t("accounts.aud") },
    { code: "CAD" as Currency, name: t("accounts.cad") },
    { code: "AUD" as Currency, name: t("accounts.aud") },
    { code: "CAD" as Currency, name: t("accounts.cad") },
  ];

  const total = (balances.USD ?? 0) + (balances.AED ?? 0);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <Screen bg={Colors.white}>
      <Header
        title={t("accounts.title")}
        showBack={false}
        right={
          <Pressable onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color={Colors.brand.primary} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 160 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Accounts Details</Text>
        <Text style={styles.subtext}>{t("accounts.addCurrency")}</Text>

        {myRows.map((r, i) => {
          const active = r.code === activeCurrency;
          return (
            <MotiView
              key={r.code}
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 80, duration: 350 }}
            >
              <Pressable
                onPress={() => setActiveCurrency(r.code)}
                style={[
                  styles.accountRow,
                  { borderColor: active ? Colors.brand.primary : Colors.ink[100] },
                ]}
              >
                <Text style={styles.flagLarge}>{FLAGS[r.code]}</Text>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{r.name}</Text>
                  <Text style={styles.accountBalance}>
                    Available {balances[r.code].toLocaleString()} {r.currencySymbol}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.ink[400]} />
              </Pressable>
            </MotiView>
          );
        })}

        {/* All accounts summary */}
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 200 }}>
          <View style={styles.totalCard}>
            <View style={styles.totalIcon}>
              <Ionicons name="cash" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.totalInfo}>
              <Text style={styles.totalLabel}>{t("accounts.allAccounts")}</Text>
              <Text style={styles.totalSub}>2 accounts</Text>
            </View>
            <Text style={styles.totalAmount}>{total.toLocaleString()} $</Text>
          </View>
        </MotiView>

        <Text style={styles.addTitle}>Add new currency</Text>
        {addableRows.map((r, i) => (
          <View key={`${r.code}-${i}`} style={styles.addRow}>
            <Text style={styles.flagSmall}>{FLAGS[r.code]}</Text>
            <View style={styles.addInfo}>
              <Text style={styles.addName}>{r.name}</Text>
              <Text style={styles.addCode}>{r.code}</Text>
            </View>
            <Pressable onPress={() => setShowAdd(true)} style={styles.addBtn}>
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.bottomBar, { bottom: insets.bottom + 90 }]}>
        <Button title="+ Add New" onPress={() => setShowAdd(true)} />
      </View>

      {/* Modal */}
      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowAdd(false)} />
        <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 22 }]}>
          <View style={styles.handle} />
          <Text style={styles.modalTitle}>Coming soon</Text>
          <Text style={styles.modalText}>
            Adding new currencies will be available in the next release.
          </Text>
          <Button title="Got it" onPress={() => setShowAdd(false)} />
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 18 },
  heading: {
    color: Colors.brand.primary,
    fontFamily: "Sora_700Bold",
    fontSize: 20,
    marginTop: 4,
    marginBottom: 6,
  },
  subtext: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginBottom: 16,
  },
  // Account rows
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  flagLarge: {
    fontSize: 28,
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  accountBalance: {
    color: Colors.accent.green,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  // Total card
  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.brand.primary50,
    borderRadius: 16,
    padding: 14,
    marginBottom: 22,
  },
  totalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  totalInfo: {
    flex: 1,
  },
  totalLabel: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  totalSub: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  totalAmount: {
    color: Colors.accent.green,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  // Addable rows
  addTitle: {
    color: Colors.ink[700],
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 12,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.ink[100],
  },
  flagSmall: {
    fontSize: 24,
    marginRight: 12,
  },
  addInfo: {
    flex: 1,
  },
  addName: {
    color: Colors.ink[900],
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  addCode: {
    color: Colors.ink[400],
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: Colors.brand.primary50,
  },
  addBtnText: {
    color: Colors.brand.primary,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  // Bottom / Modal
  bottomBar: {
    position: "absolute",
    left: 24,
    right: 24,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 14,
    paddingHorizontal: 22,
  },
  handle: {
    width: 44,
    height: 4,
    backgroundColor: Colors.ink[200],
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.ink[900],
    marginBottom: 4,
  },
  modalText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.ink[500],
    marginBottom: 20,
  },
});
