import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { ListRow } from "@/components/ListRow";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";

export default function Devices() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const devices = [
    {
      id: "1",
      name: "This device · Android",
      icon: "phone-portrait-outline" as const,
      sub: "Active now",
    },
    {
      id: "2",
      name: "Samsung Galaxy S22",
      icon: "phone-portrait-outline" as const,
      sub: "Last seen 2 days ago",
    },
  ];
  return (
    <Screen bg={Colors.surface.background}>
      <Header title={t("security.devices")} />
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
            {t("security.devices")}
          </Text>
          <Text
            style={{
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            Devices signed in to your ZADPAY account.
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
            {devices.map((d, i) => (
              <ListRow
                key={d.id}
                icon={<Ionicons name={d.icon} size={18} color={Colors.brand.primary} />}
                title={d.name}
                subtitle={d.sub}
                divider={i < devices.length - 1}
                onPress={() =>
                  Alert.alert("Coming Soon", "This feature will be available in a future update.")
                }
              />
            ))}
          </View>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
