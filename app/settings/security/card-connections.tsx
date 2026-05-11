import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { ListRow } from "@/components/ListRow";
import { Colors } from "@/theme/colors";

export default function CardConnections() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const connections = [
    { id: "1", name: "Apple Pay", icon: "logo-apple" as const },
    { id: "2", name: "Google Pay", icon: "logo-google" as const },
    { id: "3", name: "Samsung Pay", icon: "phone-portrait-outline" as const },
  ];
  return (
    <Screen bg={Colors.surface.background}>
      <Header title={t("security.cardConnections")} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: insets.bottom + 24 }}>
        <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 320 }}>
          <Text style={{ color: Colors.brand.primary, fontFamily: "Sora_700Bold", fontSize: 22, marginBottom: 6 }}>
            {t("security.cardConnections")}
          </Text>
          <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 20 }}>
            Services connected to your ZADPAY card.
          </Text>
          <View style={{ backgroundColor: Colors.white, borderRadius: 18, borderWidth: 1, borderColor: Colors.ink[100], overflow: "hidden" }}>
            {connections.map((c, i) => (
              <ListRow
                key={c.id}
                icon={<Ionicons name={c.icon} size={18} color={Colors.brand.primary} />}
                title={c.name}
                divider={i < connections.length - 1}
                onPress={() => {}}
              />
            ))}
          </View>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
