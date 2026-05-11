import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { ScanIdIllustration } from "@/illustrations/ScanIdIllustration";
import { Colors } from "@/theme/colors";

export default function IdScan() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Screen>
      <Header />
      <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 28 }}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 500 }}
          style={{ marginTop: 40 }}
        >
          <ScanIdIllustration size={220} />
        </MotiView>
        <Text style={{ marginTop: 36, textAlign: "center", color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 18, maxWidth: 280 }}>
          {t("auth.scanIdTitle")}
        </Text>
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
        <Button title={t("auth.scan")} onPress={() => router.push({ pathname: "/(auth)/id-capture", params: { side: "front" } })} />
      </View>
    </Screen>
  );
}
