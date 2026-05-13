import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Switch } from "@/components/Switch";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

function formatCardNumber(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + "/" + digits.slice(2);
}

export default function AddCard() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { addCard } = useApp();
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [save, setSave] = useState(true);

  const rawNumber = number.replace(/\s/g, "");
  const canAdd = rawNumber.length >= 15 && expiry.length === 5 && cvv.length >= 3 && name.length > 2;

  const handleAdd = () => {
    if (save) {
      addCard({ id: "c-" + Date.now(), brand: "mastercard", last4: rawNumber.slice(-4), exp: expiry, name });
    }
    router.back();
  };

  return (
    <Screen bg={Colors.white} keyboard>
      <Header title={t("topup.addNewCardTitle")} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 110 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, marginBottom: 18 }}>
            {t("topup.addNewCardHint")}
          </Text>

          <Input
            label={t("topup.cardNumber")}
            placeholder="0000 0000 0000 0000"
            value={number}
            onChangeText={(v) => setNumber(formatCardNumber(v))}
            keyboardType="number-pad"
            rightIcon={<Ionicons name="card" size={20} color={Colors.ink[400]} />}
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Input
              label={t("topup.expiryDate")}
              placeholder="MM/YY"
              value={expiry}
              onChangeText={(v) => setExpiry(formatExpiry(v))}
              keyboardType="number-pad"
              containerStyle={{ flex: 1 }}
              rightIcon={<Ionicons name="calendar-outline" size={18} color={Colors.ink[400]} />}
              maxLength={5}
            />
            <Input
              label={t("topup.cvv")}
              placeholder="***"
              value={cvv}
              onChangeText={(v) => setCvv(v.replace(/\D/g, "").slice(0, 4))}
              keyboardType="number-pad"
              containerStyle={{ flex: 1 }}
              rightIcon={<Ionicons name="lock-closed-outline" size={18} color={Colors.ink[400]} />}
              secureTextEntry
              maxLength={4}
            />
          </View>

          <Input
            label={t("topup.cardName")}
            placeholder="Enter cardholder full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            keyboardType="default"
          />

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
            <Switch value={save} onChange={setSave} />
            <Text style={{ marginLeft: 10, color: Colors.ink[700], fontFamily: "Inter_500Medium", fontSize: 14 }}>
              {t("topup.saveCard")}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{ position: "absolute", left: 18, right: 18, bottom: insets.bottom + 12, flexDirection: "row", gap: 10 }}>
        <Button
          title={t("topup.scanCard")}
          variant="secondary"
          onPress={() => {}}
          style={{ flex: 1 }}
          icon={<Ionicons name="scan-outline" size={18} color={Colors.brand.primary} />}
        />
        <Button title={t("topup.addCard")} disabled={!canAdd} onPress={handleAdd} style={{ flex: 1 }} />
      </View>
    </Screen>
  );
}
