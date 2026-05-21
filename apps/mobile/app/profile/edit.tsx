import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MotiView } from "moti";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { useAuthSession, useUpdateProfile } from "@/features/auth";
import { useHaptic } from "@/hooks/useHaptic";
import { Colors } from "@/theme/colors";

export default function EditProfile() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const { session } = useAuthSession();
  const user = session?.user;
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const phone = user?.phone ?? "";
  const email = user?.email ?? "";

  const nameInvalid = fullName.trim().length < 2;

  const handleSave = async () => {
    if (nameInvalid || updateProfile.isPending) return;
    const result = await updateProfile.mutate({ fullName: fullName.trim() });
    if (result.ok) {
      haptic.success();
      router.back();
    }
  };

  return (
    <Screen bg={Colors.white} keyboard>
      <Header title={t("profile.editProfile")} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 14 }}
          style={{ alignItems: "center", marginTop: 14, marginBottom: 22 }}
        >
          <Pressable
            onPress={() => haptic.light()}
            style={({ pressed }) => ({
              position: "relative",
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Avatar name={fullName} size={96} />
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: Colors.brand.primary,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: Colors.white,
              }}
            >
              <Ionicons name="camera" size={16} color={Colors.white} />
            </View>
          </Pressable>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100, duration: 360 }}
        >
          <Input
            label={t("auth.fullName")}
            value={fullName}
            onChangeText={setFullName}
            error={nameInvalid && fullName.length > 0 ? t("profile.nameTooShort") : undefined}
          />
          <Input label="phone number" value={phone} editable={false} keyboardType="phone-pad" />
          <Input
            label={t("auth.email")}
            value={email}
            editable={false}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </MotiView>

        {updateProfile.error !== null && (
          <Text
            style={{
              color: Colors.accent.red,
              fontFamily: "Inter_500Medium",
              fontSize: 13,
              marginTop: 12,
              textAlign: "center",
            }}
          >
            {t("profile.saveError")}
          </Text>
        )}
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 16,
          paddingTop: 8,
          backgroundColor: Colors.white,
        }}
      >
        <Button
          title={t("common.save")}
          onPress={handleSave}
          loading={updateProfile.isPending}
          disabled={nameInvalid || updateProfile.isPending}
        />
      </View>
    </Screen>
  );
}
