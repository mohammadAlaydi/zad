import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { FlagSelect } from "@/components/FlagSelect";
import { Header } from "@/components/Header";
import { OTPInput } from "@/components/OTPInput";
import { Screen } from "@/components/Screen";
import { useLoginByPhone, useRegister } from "@/features/auth";
import { autoSubmitKyc } from "@/features/kyc";
import { Colors } from "@/theme/colors";

export default function VerifyPhone() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { mode, phone, country, password, fullName } = useLocalSearchParams<{
    mode: string;
    phone: string;
    country: string;
    password: string;
    fullName?: string;
  }>();
  const [code, setCode] = useState("");
  const [secs, setSecs] = useState(28);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const login = useLoginByPhone();
  const register = useRegister();

  useEffect(() => {
    const i = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, []);

  const valid = code.length === 6;

  async function onSubmit() {
    // Any 6-digit code is accepted — the phone OTP is a UI stub in dev.
    // Phone arrives here already in E.164 form (validated against `country`
    // on the previous screen). We re-check before submit as a defensive
    // guard, and the backend validates again.
    if (!valid || submitting) return;
    if (typeof phone !== "string" || typeof password !== "string" || typeof country !== "string") {
      setError("Missing phone, country, or password. Please go back and re-enter.");
      return;
    }
    const phoneStr = phone.trim();
    if (phoneStr.length === 0) {
      setError("Phone number is required.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const name = typeof fullName === "string" ? fullName.trim() : "";
        if (name.length < 2) {
          setError("Missing full name. Please go back and re-enter.");
          return;
        }
        const result = await register.mutate({
          phone: phoneStr,
          country,
          password,
          fullName: name,
        });
        if (!result.ok) {
          setError(result.error.message);
          return;
        }
        // Fire-and-forget: submits placeholder KYC docs so the dev provider
        // auto-approves shortly after the user lands on home.
        void autoSubmitKyc();
        router.replace("/(tabs)/home");
      } else {
        const result = await login.mutate({ phone: phoneStr, country, password });
        if (!result.ok) {
          setError(result.error.message);
          return;
        }
        router.replace("/(tabs)/home");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || login.isPending || register.isPending;
  const buttonTitle = busy
    ? mode === "login"
      ? "Signing in…"
      : "Creating account…"
    : mode === "login"
      ? t("auth.logIn")
      : t("auth.signUp");

  return (
    <Screen keyboard>
      <Header showBack title="" right={<FlagSelect />} />
      <View style={{ paddingHorizontal: 24, flex: 1 }}>
        <Text style={{ color: Colors.brand.primary, fontFamily: "Sora_700Bold", fontSize: 22 }}>
          {t("auth.confirmPhone")}
        </Text>
        <Text
          style={{
            marginTop: 6,
            marginBottom: 30,
            color: Colors.ink[500],
            fontFamily: "Inter_400Regular",
            fontSize: 13,
          }}
        >
          {t("auth.confirmPhoneHint")} {phone ?? ""}
        </Text>
        <OTPInput value={code} onChange={setCode} />
        {error !== null && (
          <Text
            style={{
              marginTop: 16,
              color: Colors.accent.red,
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            {error}
          </Text>
        )}
        <View style={{ alignItems: "center", marginTop: 24 }}>
          {secs > 0 ? (
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 }}>
              {t("auth.resendIn", { seconds: secs })}
            </Text>
          ) : (
            <Pressable onPress={() => setSecs(28)}>
              <Text
                style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 }}
              >
                {t("auth.didntGet")}{" "}
                <Text style={{ color: Colors.accent.green, fontFamily: "Inter_600SemiBold" }}>
                  {t("auth.resend")}
                </Text>
              </Text>
            </Pressable>
          )}
        </View>
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
        <Button title={buttonTitle} disabled={!valid || busy} onPress={onSubmit} />
      </View>
    </Screen>
  );
}
