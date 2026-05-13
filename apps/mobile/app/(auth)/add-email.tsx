import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MotiView } from "moti";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { useHaptic } from "@/hooks/useHaptic";
import { Colors } from "@/theme/colors";

export default function AddEmail() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const [email, setEmail] = useState("");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleContinue = () => {
    haptic.light();
    router.push("/(auth)/personal-info");
  };

  return (
    <Screen scroll keyboard>
      <Header />
      <View style={{ paddingHorizontal: 24, flex: 1 }}>
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 360 }}
        >
          <Text
            style={{
              color: Colors.brand.primary,
              fontFamily: "Sora_700Bold",
              fontSize: 22,
            }}
          >
            {t("auth.addEmail")}
          </Text>
          <Text
            style={{
              marginTop: 6,
              marginBottom: 28,
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            {t("auth.addEmailHint")}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 120, type: "timing", duration: 380 }}
        >
          <Input
            label={t("auth.email")}
            placeholder="name@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.ink[400]} />}
            rightIcon={
              valid ? (
                <MotiView
                  from={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 14 }}
                >
                  <Ionicons name="checkmark-circle" size={20} color={Colors.accent.green} />
                </MotiView>
              ) : null
            }
          />
        </MotiView>
      </View>
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <Button title={t("common.continue")} onPress={handleContinue} />
      </View>
    </Screen>
  );
}
