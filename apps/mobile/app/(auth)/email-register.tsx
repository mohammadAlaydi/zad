// Minimal email + password registration. The full KYC wizard lands in
// PR-7. For now: register → home; KYC stays optional until enforced.

import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { useRegister } from "@/features/auth";
import { Colors } from "@/theme/colors";

export default function EmailRegister() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { mutate, isPending, error } = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = email.includes("@") && password.length >= 10 && !isPending;

  async function onSubmit() {
    const result = await mutate({ email, password });
    // New accounts start with kycStatus "not_started" — route through the
    // KYC screen to upload + submit before the user can enter the app.
    if (result.ok) router.replace("/(auth)/kyc-status");
  }

  return (
    <Screen scroll keyboard>
      <Header showBack title="" />
      <View style={{ paddingHorizontal: 24, flex: 1 }}>
        <Text
          style={{
            color: Colors.ink[900],
            fontFamily: "Sora_700Bold",
            fontSize: 22,
          }}
        >
          Create account
        </Text>
        <Text
          style={{
            marginTop: 6,
            marginBottom: 28,
            color: Colors.ink[500],
            fontFamily: "Inter_400Regular",
            fontSize: 13,
          }}
        >
          Minimum 10 characters. KYC verification follows next.
        </Text>
        <Input
          label={t("auth.email")}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <View style={{ height: 16 }} />
        <Input
          label={t("auth.password")}
          placeholder="••••••••••"
          isPassword
          value={password}
          onChangeText={setPassword}
        />
        {error !== null && (
          <Text
            style={{
              marginTop: 12,
              color: Colors.accent.red,
              fontFamily: "Inter_400Regular",
              fontSize: 12,
            }}
          >
            {error.message}
          </Text>
        )}
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
        <Button
          title={isPending ? "Creating account…" : t("auth.signUp")}
          onPress={onSubmit}
          disabled={!canSubmit}
        />
      </View>
    </Screen>
  );
}
