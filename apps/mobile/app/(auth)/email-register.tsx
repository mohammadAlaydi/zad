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
import { PhoneInput } from "@/components/PhoneInput";
import { Screen } from "@/components/Screen";
import { COUNTRIES } from "@/data/countries";
import { useRegister } from "@/features/auth";
import { validatePhone } from "@/lib/phone";
import { Colors } from "@/theme/colors";

export default function EmailRegister() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { mutate, isPending, error } = useRegister();
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState(COUNTRIES[3]); // IQ default
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const emailTrimmed = email.trim();
  // Email is optional — if the user types something, it has to look like
  // an email; if it's empty, we just don't send the field.
  const emailLooksValid = emailTrimmed.length === 0 || emailTrimmed.includes("@");
  const phoneCheck = validatePhone(phone, country.code);
  const canSubmit =
    fullName.trim().length >= 2 &&
    phoneCheck.ok &&
    emailLooksValid &&
    password.length >= 8 &&
    !isPending;

  async function onSubmit() {
    if (!phoneCheck.ok) return;
    const result = await mutate({
      ...(emailTrimmed.length > 0 ? { email: emailTrimmed } : {}),
      password,
      phone: phoneCheck.e164,
      country: country.code,
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
        <Text
          style={{
            color: Colors.ink[700],
            fontFamily: "Inter_500Medium",
            fontSize: 13,
            marginBottom: 6,
          }}
        >
          Phone number
        </Text>
        <PhoneInput
          country={country}
          onCountryChange={setCountry}
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
