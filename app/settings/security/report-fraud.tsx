import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { Colors } from "@/theme/colors";

export default function ReportFraud() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <Screen bg={Colors.surface.background}>
      <Header title={t("security.reportFraud")} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: insets.bottom + 24 }}>
        <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 320 }}>
          {/* Icon banner */}
          <View style={{ alignItems: "center", marginBottom: 24, marginTop: 12 }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: Colors.accent.redSoft,
              alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="bug-outline" size={38} color={Colors.accent.red} />
            </View>
            <Text style={{ color: Colors.ink[900], fontFamily: "Sora_700Bold", fontSize: 22, marginTop: 16, textAlign: "center" }}>
              {t("security.reportFraud")}
            </Text>
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 8, textAlign: "center", lineHeight: 20 }}>
              If you notice any suspicious activity or{"\n"}unauthorised transactions, let us know immediately.
            </Text>
          </View>

          {/* Steps */}
          {[
            { step: "1", text: "Describe what happened in detail" },
            { step: "2", text: "We will freeze any suspicious activity" },
            { step: "3", text: "Our security team will investigate within 24h" },
          ].map((s) => (
            <View key={s.step} style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <View style={{
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: Colors.brand.primary50,
                alignItems: "center", justifyContent: "center",
              }}>
                <Text style={{ color: Colors.brand.primary, fontFamily: "Inter_700Bold", fontSize: 14 }}>{s.step}</Text>
              </View>
              <Text style={{ flex: 1, color: Colors.ink[700], fontFamily: "Inter_400Regular", fontSize: 13 }}>{s.text}</Text>
            </View>
          ))}

          <View style={{ marginTop: 24 }}>
            <Button title="Report Now" onPress={() => {}} />
          </View>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
