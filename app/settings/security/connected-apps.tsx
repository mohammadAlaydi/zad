import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { ListRow } from "@/components/ListRow";
import { Colors } from "@/theme/colors";

export default function ConnectedApps() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const apps = [
    { id: "1", name: "ZADPAY Business", icon: "briefcase-outline" as const },
    { id: "2", name: "ZADPAY Partner", icon: "people-outline" as const },
  ];
  return (
    <Screen bg={Colors.surface.background}>
      <Header title={t("security.connectedApps")} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: insets.bottom + 24 }}>
        <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 320 }}>
          <Text style={{ color: Colors.brand.primary, fontFamily: "Sora_700Bold", fontSize: 22, marginBottom: 6 }}>
            {t("security.connectedApps")}
          </Text>
          <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 20 }}>
            Apps that have access to your ZADPAY account.
          </Text>
          <View style={{ backgroundColor: Colors.white, borderRadius: 18, borderWidth: 1, borderColor: Colors.ink[100], overflow: "hidden" }}>
            {apps.map((a, i) => (
              <ListRow
                key={a.id}
                icon={<Ionicons name={a.icon} size={18} color={Colors.brand.primary} />}
                title={a.name}
                divider={i < apps.length - 1}
                onPress={() => {}}
              />
            ))}
          </View>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
