// Real email + password login wired to the api. The existing phone-based
// login.tsx is a UI demo and remains untouched; this is the path the user
// follows to actually enter the app while KYC migrates to the real API
// in PR-7.

import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { useLogin } from "@/features/auth";
import { Colors } from "@/theme/colors";

export default function EmailLogin() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { mutate, isPending, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = email.includes("@") && password.length >= 8 && !isPending;

  async function onSubmit() {
    const result = await mutate({ email, password });
    if (result.ok) router.replace("/(tabs)/home");
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
          Sign in
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
          Use your ZADPAY email and password.
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
          placeholder="••••••••"
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
          title={isPending ? "Signing in…" : t("auth.logIn")}
          onPress={onSubmit}
          disabled={!canSubmit}
        />
      </View>
    </Screen>
  );
}
