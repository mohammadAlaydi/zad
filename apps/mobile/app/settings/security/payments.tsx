import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { ListRow } from "@/components/ListRow";
import { Screen } from "@/components/Screen";
import { Switch } from "@/components/Switch";
import { useSettings } from "@/features/userdata";
import { Colors } from "@/theme/colors";

export default function Payments() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { settings, isPending, updateSettings } = useSettings();

  const [perTx, setPerTx] = useState("");
  const [daily, setDaily] = useState("");
  const [weekly, setWeekly] = useState("");

  // Hydrate the inputs from the persisted settings once available so the
  // user sees what's currently saved.
  useEffect(() => {
    setPerTx(String(settings.perTransactionLimit));
    setDaily(String(settings.dailyLimit));
    setWeekly(String(settings.weeklyLimit));
  }, [settings.perTransactionLimit, settings.dailyLimit, settings.weeklyLimit]);

  async function saveLimits() {
    const a = Number(perTx);
    const b = Number(daily);
    const c = Number(weekly);
    if (
      !Number.isFinite(a) ||
      !Number.isFinite(b) ||
      !Number.isFinite(c) ||
      a <= 0 ||
      b <= 0 ||
      c <= 0
    ) {
      Alert.alert("Invalid limits", "Each limit must be a positive number.");
      return;
    }
    if (a > b || b > c) {
      Alert.alert("Invalid limits", "Per-transaction ≤ Daily ≤ Weekly.");
      return;
    }
    await updateSettings({ perTransactionLimit: a, dailyLimit: b, weeklyLimit: c });
    Alert.alert("Saved", "Your payment limits were updated.");
  }

  return (
    <Screen bg={Colors.surface.background}>
      <Header title={t("security.payments")} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 320 }}
        >
          <Text
            style={{
              color: Colors.brand.primary,
              fontFamily: "Sora_700Bold",
              fontSize: 22,
              marginBottom: 6,
            }}
          >
            {t("security.payments")}
          </Text>
          <Text
            style={{
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            Manage payment authorisation and limits.
          </Text>

          {/* Limits */}
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: Colors.ink[100],
              padding: 16,
              marginBottom: 18,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: Colors.ink[900],
                marginBottom: 12,
              }}
            >
              Payment limits (USD)
            </Text>
            {[
              { label: "Per transaction", value: perTx, setter: setPerTx },
              { label: "Daily", value: daily, setter: setDaily },
              { label: "Weekly", value: weekly, setter: setWeekly },
            ].map((row) => (
              <View
                key={row.label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                    color: Colors.ink[700],
                    flex: 1,
                  }}
                >
                  {row.label}
                </Text>
                <TextInput
                  value={row.value}
                  onChangeText={row.setter}
                  keyboardType="number-pad"
                  style={{
                    width: 120,
                    height: 36,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: Colors.ink[200],
                    paddingHorizontal: 10,
                    fontFamily: "Inter_500Medium",
                    color: Colors.ink[900],
                    textAlign: "right",
                  }}
                />
              </View>
            ))}
            <Pressable
              disabled={isPending}
              onPress={() => void saveLimits()}
              style={({ pressed }) => ({
                marginTop: 8,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: Colors.brand.primary,
                alignItems: "center",
                opacity: pressed || isPending ? 0.7 : 1,
              })}
            >
              <Text style={{ color: Colors.white, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                {isPending ? "Saving…" : "Save limits"}
              </Text>
            </Pressable>
          </View>

          {/* Toggles */}
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: Colors.ink[100],
              overflow: "hidden",
            }}
          >
            <ListRow
              icon={<Ionicons name="globe-outline" size={18} color={Colors.brand.primary} />}
              title="International payments"
              right={
                <Switch
                  value={settings.internationalPaymentsEnabled}
                  disabled={isPending}
                  onChange={(v) => void updateSettings({ internationalPaymentsEnabled: v })}
                />
              }
            />
            <ListRow
              icon={
                <Ionicons name="notifications-outline" size={18} color={Colors.brand.primary} />
              }
              title="Payment notifications"
              divider={false}
              right={
                <Switch
                  value={settings.paymentNotificationsEnabled}
                  disabled={isPending}
                  onChange={(v) => void updateSettings({ paymentNotificationsEnabled: v })}
                />
              }
            />
          </View>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
