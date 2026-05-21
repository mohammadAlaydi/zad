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

export default function SignIn() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { settings, isPending, updateSettings } = useSettings();

  return (
    <Screen bg={Colors.surface.background}>
      <Header title={t("security.signin")} />
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
            {t("security.signin")}
          </Text>
          <Text
            style={{
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            Manage how you sign in to ZADPAY.
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
              icon={<Ionicons name="key-outline" size={18} color={Colors.brand.primary} />}
              title="App passcode"
              right={
                <Switch
                  value={settings.passcodeEnabled}
                  disabled={isPending}
                  onChange={(v) => void updateSettings({ passcodeEnabled: v })}
                />
              }
            />
            <ListRow
              icon={<Ionicons name="finger-print-outline" size={18} color={Colors.brand.primary} />}
              title="Biometric login"
              right={
                <Switch
                  value={settings.biometricEnabled}
                  disabled={isPending}
                  onChange={(v) => void updateSettings({ biometricEnabled: v })}
                />
              }
            />
            <ListRow
              icon={<Ionicons name="shield-outline" size={18} color={Colors.brand.primary} />}
              title="Two-factor authentication"
              divider={false}
              right={
                <Switch
                  value={settings.twoFactorEnabled}
                  disabled={isPending}
                  onChange={(v) => void updateSettings({ twoFactorEnabled: v })}
                />
              }
            />
          </View>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
