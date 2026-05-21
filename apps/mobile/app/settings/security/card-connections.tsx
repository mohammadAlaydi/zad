import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { ListRow } from "@/components/ListRow";
import { Screen } from "@/components/Screen";
import { Switch } from "@/components/Switch";
import { useSettings, type SettingsPayload } from "@/features/userdata";
import { Colors } from "@/theme/colors";

type ConnectionKey = "applePayLinked" | "googlePayLinked" | "samsungPayLinked";

const ROWS: {
  key: ConnectionKey;
  name: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  { key: "applePayLinked", name: "Apple Pay", icon: "logo-apple" },
  { key: "googlePayLinked", name: "Google Pay", icon: "logo-google" },
  { key: "samsungPayLinked", name: "Samsung Pay", icon: "phone-portrait-outline" },
];

export default function CardConnections() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { settings, isPending, updateSettings } = useSettings();

  return (
    <Screen bg={Colors.surface.background}>
      <Header title={t("security.cardConnections")} />
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
            {t("security.cardConnections")}
          </Text>
          <Text
            style={{
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            Services connected to your ZADPAY card. Toggle to mark a wallet as linked once you
            finish the setup in your phone's system wallet.
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
            {ROWS.map((row, i) => (
              <ListRow
                key={row.key}
                icon={<Ionicons name={row.icon} size={18} color={Colors.brand.primary} />}
                title={row.name}
                subtitle={settings[row.key] ? "Linked" : "Not connected"}
                divider={i < ROWS.length - 1}
                right={
                  <Switch
                    value={settings[row.key]}
                    disabled={isPending}
                    onChange={(v) =>
                      void updateSettings({ [row.key]: v } as Partial<SettingsPayload>)
                    }
                  />
                }
              />
            ))}
          </View>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
