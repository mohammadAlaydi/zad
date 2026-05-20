// Minimal full-name + phone + email + password registration. The phone
// number is how other ZADPAY users find this account when sending money.

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
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const phoneTrimmed = phone.trim();
  const emailTrimmed = email.trim();
  // Email is optional — if the user types something, it has to look like
  // an email; if it's empty, we just don't send the field.
  const emailLooksValid = emailTrimmed.length === 0 || emailTrimmed.includes("@");
  const canSubmit =
    fullName.trim().length >= 2 &&
    phoneTrimmed.length > 0 &&
    emailLooksValid &&
    password.length >= 10 &&
    !isPending;

  async function onSubmit() {
    if (phoneTrimmed.length === 0) return;
    const result = await mutate({
      ...(emailTrimmed.length > 0 ? { email: emailTrimmed } : {}),
      password,
      phone: phoneTrimmed,
      fullName: fullName.trim(),
    });
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
          Your phone number is how other users send money to you.
        </Text>
        <Input
          label="Full name"
          placeholder="Jane Doe"
          autoCapitalize="words"
          value={fullName}
          onChangeText={setFullName}
        />
        <View style={{ height: 16 }} />
        <Input
          label="Phone number"
          placeholder="Your mobile number"
          autoCapitalize="none"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <View style={{ height: 16 }} />
        <Input
          label={`${t("auth.email")} (optional)`}
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
