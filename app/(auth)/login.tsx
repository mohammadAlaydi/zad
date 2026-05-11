import { useState } from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { FlagSelect } from "@/components/FlagSelect";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { PhoneInput } from "@/components/PhoneInput";
import { COUNTRIES } from "@/data/countries";
import { Colors } from "@/theme/colors";

export default function Login() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [country, setCountry] = useState(COUNTRIES[3]); // IQ +964 as in PDF
  const [phone, setPhone] = useState("");
  const [pwd, setPwd] = useState("");

  const valid = phone.length >= 6 && pwd.length >= 4;

  return (
    <Screen scroll keyboard>
      <Header showBack title="" right={<FlagSelect />} />
      <View style={{ paddingHorizontal: 24, flex: 1 }}>
        <Text style={{ color: Colors.ink[900], fontFamily: "Sora_700Bold", fontSize: 22 }}>{t("auth.loginTitle")}</Text>
        <Text style={{ marginTop: 6, marginBottom: 28, color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 }}>
          {t("auth.loginSubtitle")}
        </Text>
        <Text style={{ color: Colors.ink[700], fontFamily: "Inter_500Medium", fontSize: 13, marginBottom: 6 }}>{t("auth.phone")}</Text>
        <PhoneInput country={country} onCountryChange={setCountry} value={phone} onChangeText={setPhone} />
        <View style={{ height: 16 }} />
        <Input label={t("auth.password")} placeholder="••••••••" isPassword value={pwd} onChangeText={setPwd} />
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
        <Button
          title={t("auth.logIn")}
          onPress={() => router.push({ pathname: "/(auth)/verify-phone", params: { mode: "login", phone: `${country.dial}${phone}` } })}
        />
      </View>
    </Screen>
  );
}
