import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { ListRow } from "@/components/ListRow";
import { Screen } from "@/components/Screen";
import { Switch } from "@/components/Switch";
import { useSettings } from "@/features/userdata";
import { Colors } from "@/theme/colors";

export default function CardSecurity() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { settings, isPending, updateSettings } = useSettings();

  return (
    <Screen bg={Colors.surface.background}>
      <Header title={t("security.cardSecurity")} />
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
            {t("security.cardSecurity")}
          </Text>
          <Text
            style={{
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            Manage security settings for your linked cards.
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
              icon={<Ionicons name="lock-closed-outline" size={18} color={Colors.brand.primary} />}
              title="Card PIN set"
              subtitle={settings.cardPinSet ? "PIN is set" : "Set a PIN to authorise card use"}
              right={
                <Switch
                  value={settings.cardPinSet}
                  disabled={isPending}
                  onChange={(v) => void updateSettings({ cardPinSet: v })}
                />
              }
            />
            <ListRow
              icon={<Ionicons name="eye-off-outline" size={18} color={Colors.brand.primary} />}
              title="Hide card number"
              right={
                <Switch
                  value={settings.cardNumberHidden}
                  disabled={isPending}
                  onChange={(v) => void updateSettings({ cardNumberHidden: v })}
                />
              }
            />
            <ListRow
              icon={<Ionicons name="ban-outline" size={18} color={Colors.brand.primary} />}
              title="Freeze card"
              subtitle={
                settings.cardFrozen ? "Card is frozen — payments blocked" : "Block card payments"
              }
              divider={false}
              right={
                <Switch
                  value={settings.cardFrozen}
                  disabled={isPending}
                  onChange={(v) => void updateSettings({ cardFrozen: v })}
                />
              }
            />
          </View>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
