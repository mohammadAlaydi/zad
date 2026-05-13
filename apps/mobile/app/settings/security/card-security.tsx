import { View, Text, ScrollView, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { ListRow } from "@/components/ListRow";
import { Colors } from "@/theme/colors";

export default function CardSecurity() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <Screen bg={Colors.surface.background}>
      <Header title={t("security.cardSecurity")} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: insets.bottom + 24 }}>
        <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 320 }}>
          <Text style={{ color: Colors.brand.primary, fontFamily: "Sora_700Bold", fontSize: 22, marginBottom: 6 }}>
            {t("security.cardSecurity")}
          </Text>
          <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 20 }}>
            Manage security settings for your linked cards.
          </Text>
          <View style={{ backgroundColor: Colors.white, borderRadius: 18, borderWidth: 1, borderColor: Colors.ink[100], overflow: "hidden" }}>
            <ListRow icon={<Ionicons name="lock-closed-outline" size={18} color={Colors.brand.primary} />} title="Change PIN" onPress={() => Alert.alert("Coming Soon", "This feature will be available in a future update.")} />
            <ListRow icon={<Ionicons name="eye-off-outline" size={18} color={Colors.brand.primary} />} title="Hide card number" onPress={() => Alert.alert("Coming Soon", "This feature will be available in a future update.")} />
            <ListRow icon={<Ionicons name="ban-outline" size={18} color={Colors.brand.primary} />} title="Freeze card" divider={false} onPress={() => Alert.alert("Coming Soon", "This feature will be available in a future update.")} />
          </View>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
