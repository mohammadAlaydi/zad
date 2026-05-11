import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { FlagSelect } from "@/components/FlagSelect";
import { Button } from "@/components/Button";
import { OTPInput } from "@/components/OTPInput";
import { Colors } from "@/theme/colors";

export default function VerifyPhone() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams<{ mode: string; phone: string }>();
  const [code, setCode] = useState("");
  const [secs, setSecs] = useState(28);

  useEffect(() => {
    const i = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, []);

  const valid = code.length === 6;

  return (
    <Screen keyboard>
      <Header showBack title="" right={<FlagSelect />} />
      <View style={{ paddingHorizontal: 24, flex: 1 }}>
        <Text style={{ color: Colors.brand.primary, fontFamily: "Sora_700Bold", fontSize: 22 }}>{t("auth.confirmPhone")}</Text>
        <Text style={{ marginTop: 6, marginBottom: 30, color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 }}>
          {t("auth.confirmPhoneHint")} +964 5515 4525 4
        </Text>
        <OTPInput value={code} onChange={setCode} />
        <View style={{ alignItems: "center", marginTop: 24 }}>
          {secs > 0 ? (
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 }}>
              {t("auth.resendIn", { seconds: secs })}
            </Text>
          ) : (
            <Pressable onPress={() => setSecs(28)}>
              <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 }}>
                {t("auth.didntGet")} <Text style={{ color: Colors.accent.green, fontFamily: "Inter_600SemiBold" }}>{t("auth.resend")}</Text>
              </Text>
            </Pressable>
          )}
        </View>
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
        <Button
          title={mode === "login" ? t("auth.logIn") : t("auth.signUp")}
          disabled={!valid}
          onPress={() => {
            if (mode === "login") router.replace("/(auth)/passcode");
            else router.push("/(auth)/add-email");
          }}
        />
      </View>
    </Screen>
  );
}
