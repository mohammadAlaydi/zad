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
import { useHaptic } from "@/hooks/useHaptic";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

export default function EditProfile() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const { user, updateUser } = useApp();
  const [fullName, setFullName] = useState(user.fullName);
  const [username, setUsername] = useState(user.username);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [dob, setDob] = useState(user.dob ?? "");
  const [gender, setGender] = useState(user.gender ?? "");

  const emailInvalid = !!email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSave = () => {
    haptic.success();
    // Gender is bound to a freeform text Input; cast covers the type gap.
    // Proper picker UI lands in PR-5 (auth feature migration per ADR-0003).
    const normalizedGender = gender === "Male" || gender === "Female" ? gender : undefined;
    updateUser({ fullName, username, phone, email, dob, gender: normalizedGender });
    router.back();
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
          <Input label={t("auth.fullName")} value={fullName} onChangeText={setFullName} />
          <Input
            label={t("auth.username")}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            leftIcon={
              <Text
                style={{
                  color: Colors.ink[400],
                  fontFamily: "Inter_500Medium",
                  fontSize: 15,
                }}
              >
                @
              </Text>
            }
          />
          <Input
            label="phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Input
            label={t("auth.email")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailInvalid ? t("profile.notifyEmail") : undefined}
          />
          <Input
            label={t("auth.dob")}
            value={dob}
            onChangeText={setDob}
            placeholder="dd / mm / yy"
            leftIcon={<Ionicons name="calendar-outline" size={18} color={Colors.ink[400]} />}
            rightIcon={<Ionicons name="chevron-down" size={18} color={Colors.ink[400]} />}
          />
          <Input
            label={t("auth.gender")}
            value={gender}
            onChangeText={setGender}
            placeholder={t("auth.chooseGender")}
            rightIcon={<Ionicons name="chevron-down" size={18} color={Colors.ink[400]} />}
          />
        </MotiView>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 16,
          paddingTop: 8,
          backgroundColor: Colors.white,
        }}
      >
        <Button title={t("common.save")} onPress={handleSave} />
      </View>
    </Screen>
  );
}
