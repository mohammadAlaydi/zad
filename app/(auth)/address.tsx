import { useState } from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Colors } from "@/theme/colors";

export default function Address() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [country, setCountry] = useState("Iraq");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const valid = city.length > 0 && address.length > 0;

  return (
    <Screen scroll keyboard>
      <Header />
      <View style={{ paddingHorizontal: 24, flex: 1 }}>
        <Text style={{ color: Colors.brand.primary, fontFamily: "Sora_700Bold", fontSize: 22 }}>{t("auth.homeAddress")}</Text>
        <Text style={{ marginTop: 6, marginBottom: 22, color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 }}>
          {t("auth.homeAddressHint")}
        </Text>
        <Input label={t("auth.country")} value={country} onChangeText={setCountry} />
        <Input label={t("auth.city")} value={city} onChangeText={setCity} />
        <Input label={t("auth.addressLine")} value={address} onChangeText={setAddress} />
        <Input label={t("auth.zip")} value={zip} keyboardType="number-pad" onChangeText={setZip} />
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
        <Button title={t("common.continue")} onPress={() => router.push("/(auth)/id-scan")} />
      </View>
    </Screen>
  );
}
