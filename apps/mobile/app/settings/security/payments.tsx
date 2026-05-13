import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { ListRow } from "@/components/ListRow";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";

export default function Payments() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <Screen bg={Colors.surface.background}>
      <Header title={t("security.payments")} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 320 }}
        >
          <Text
            style={{
              color: Colors.brand.primary,
              fontFamily: "Sora_700Bold",
              fontSize: 22,
              marginBottom: 6,
            }}
          >
            {t("security.payments")}
          </Text>
          <Text
            style={{
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            Manage payment authorisation and limits.
          </Text>
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: Colors.ink[100],
              overflow: "hidden",
            }}
          >
            <ListRow
              icon={<Ionicons name="cash-outline" size={18} color={Colors.brand.primary} />}
              title="Payment limits"
              onPress={() =>
                Alert.alert("Coming Soon", "This feature will be available in a future update.")
              }
            />
            <ListRow
              icon={<Ionicons name="globe-outline" size={18} color={Colors.brand.primary} />}
              title="International payments"
              onPress={() =>
                Alert.alert("Coming Soon", "This feature will be available in a future update.")
              }
            />
            <ListRow
              icon={
                <Ionicons name="notifications-outline" size={18} color={Colors.brand.primary} />
              }
              title="Payment notifications"
              divider={false}
              onPress={() =>
                Alert.alert("Coming Soon", "This feature will be available in a future update.")
              }
            />
          </View>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
