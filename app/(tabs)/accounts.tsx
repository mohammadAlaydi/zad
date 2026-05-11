import { useState } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl, Modal } from "react-native";
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
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 160 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
      >
        <Text style={{ color: Colors.brand.primary, fontFamily: "Sora_700Bold", fontSize: 20, marginTop: 4, marginBottom: 6 }}>
          Accounts Details
        </Text>
        <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12, marginBottom: 16 }}>
          {t("accounts.addCurrency")}
        </Text>

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
                style={({ pressed }) => ({
                  flexDirection: "row", alignItems: "center", backgroundColor: Colors.white,
                  borderRadius: 16, padding: 14, marginBottom: 12,
                  borderWidth: 1, borderColor: active ? Colors.brand.primary : Colors.ink[100],
                  opacity: pressed ? 0.85 : 1,
                  shadowColor: "#101225", shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
                })}
              >
                <Text style={{ fontSize: 28, marginRight: 12 }}>{FLAGS[r.code]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 15 }}>{r.name}</Text>
                  <Text style={{ color: Colors.accent.green, fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 2 }}>
                    Available {balances[r.code].toLocaleString()} {r.currencySymbol}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.ink[400]} />
              </Pressable>
            </MotiView>
          );
        })}

        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 200 }}>
          <View style={{
            flexDirection: "row", alignItems: "center", backgroundColor: Colors.brand.primary50,
            borderRadius: 16, padding: 14, marginBottom: 22,
          }}>
            <View style={{
              width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.brand.primary,
              alignItems: "center", justifyContent: "center", marginRight: 12,
            }}>
              <Ionicons name="cash" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 15 }}>
                {t("accounts.allAccounts")}
              </Text>
              <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12 }}>2 accounts</Text>
            </View>
            <Text style={{ color: Colors.accent.green, fontFamily: "Inter_600SemiBold", fontSize: 15 }}>
              {total.toLocaleString()} $
            </Text>
          </View>
        </MotiView>

        <Text style={{ color: Colors.ink[700], fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 12 }}>
          Add new currency
        </Text>
        {addableRows.map((r, i) => (
          <View
            key={`${r.code}-${i}`}
            style={{
              flexDirection: "row", alignItems: "center", backgroundColor: Colors.white,
              borderRadius: 14, padding: 12, marginBottom: 10,
              borderWidth: 1, borderColor: Colors.ink[100],
            }}
          >
            <Text style={{ fontSize: 24, marginRight: 12 }}>{FLAGS[r.code]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.ink[900], fontFamily: "Inter_500Medium", fontSize: 14 }}>{r.name}</Text>
              <Text style={{ color: Colors.ink[400], fontFamily: "Inter_400Regular", fontSize: 11 }}>{r.code}</Text>
            </View>
            <Pressable
              onPress={() => setShowAdd(true)}
              style={({ pressed }) => ({
                paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999,
                backgroundColor: Colors.brand.primary50, opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: Colors.brand.primary, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>Add</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <View style={{ position: "absolute", left: 24, right: 24, bottom: insets.bottom + 90 }}>
        <Button title="+ Add New" onPress={() => setShowAdd(true)} />
      </View>

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} onPress={() => setShowAdd(false)} />
        <View style={{
          position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 14, paddingHorizontal: 22, paddingBottom: insets.bottom + 22,
        }}>
          <View style={{ width: 44, height: 4, backgroundColor: Colors.ink[200], borderRadius: 2, alignSelf: "center", marginBottom: 14 }} />
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.ink[900], marginBottom: 4 }}>Coming soon</Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[500], marginBottom: 20 }}>
            Adding new currencies will be available in the next release.
          </Text>
          <Button title="Got it" onPress={() => setShowAdd(false)} />
        </View>
      </Modal>
    </Screen>
  );
}
