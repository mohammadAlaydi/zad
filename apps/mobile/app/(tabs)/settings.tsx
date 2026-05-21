import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { MotiView } from "moti";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { ListRow } from "@/components/ListRow";
import { Screen } from "@/components/Screen";
import { Switch } from "@/components/Switch";
import { useAuthSession, useLogout } from "@/features/auth";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

export default function Settings() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    biometricEnabled,
    faceIdEnabled,
    hideBalance,
    setBiometric,
    setFaceId,
    toggleHideBalance,
  } = useApp();
  const { session } = useAuthSession();
  const user = session?.user;
  const { logout } = useLogout();
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const initials = (user?.fullName ?? "M")
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Screen bg={Colors.surface.background}>
      {/* ─── Purple gradient header ─── */}
      <LinearGradient
        colors={[Colors.brand.gradientStart, Colors.brand.gradientEnd]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{
          paddingTop: Math.max(insets.top, 24) + 20,
          paddingBottom: 30,
          paddingHorizontal: 20,
        }}
      >
        {/* Decorative circles */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: -40,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        />

        {/* Title row + edit button */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <View>
            <Text style={{ color: Colors.white, fontFamily: "Sora_700Bold", fontSize: 22 }}>
              {t("settings.title")}
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.6)",
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {t("settings.subtitle")}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/profile/edit")}
            hitSlop={8}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="create-outline" size={18} color={Colors.white} />
          </Pressable>
        </View>

        {/* Avatar + user info */}
        <MotiView
          from={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 160 }}
          style={{ alignItems: "center" }}
        >
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: "rgba(255,255,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2.5,
              borderColor: "rgba(255,255,255,0.4)",
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontFamily: "Sora_700Bold",
                fontSize: 26,
                letterSpacing: 1,
              }}
            >
              {initials}
            </Text>
          </View>
          <Text
            style={{ color: Colors.white, fontFamily: "Sora_700Bold", fontSize: 19, marginTop: 12 }}
          >
            {user?.fullName ?? ""}
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.70)",
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              marginTop: 3,
            }}
          >
            {user?.email ?? ""}
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.70)",
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              marginTop: 1,
            }}
          >
            {user?.phone ?? ""}
          </Text>
        </MotiView>
      </LinearGradient>

      {/* ─── Settings list ─── */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 18,
          paddingBottom: insets.bottom + 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 60, duration: 340 }}
          style={{
            backgroundColor: Colors.white,
            borderRadius: 18,
            overflow: "hidden",
            shadowColor: "#101225",
            shadowOpacity: 0.05,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          {/* ── Toggles ── */}
          <ListRow
            icon={<Ionicons name="finger-print" size={16} color={Colors.brand.primary} />}
            title={t("settings.biometric")}
            right={<Switch value={biometricEnabled} onChange={setBiometric} />}
          />
          <ListRow
            icon={<Ionicons name="happy-outline" size={16} color={Colors.brand.primary} />}
            title={t("settings.faceId")}
            right={<Switch value={faceIdEnabled} onChange={setFaceId} />}
          />
          <ListRow
            icon={<Ionicons name="eye-off-outline" size={16} color={Colors.brand.primary} />}
            title={t("settings.hideBalance")}
            right={<Switch value={hideBalance} onChange={toggleHideBalance} />}
          />

          {/* ── Navigation ── */}
          <ListRow
            icon={<Ionicons name="card-outline" size={16} color={Colors.brand.primary} />}
            title={t("settings.accountDetails")}
            onPress={() => router.push("/profile/account-details")}
          />
          <ListRow
            icon={
              <Ionicons name="shield-checkmark-outline" size={16} color={Colors.brand.primary} />
            }
            title={t("settings.security")}
            onPress={() => router.push("/settings/security")}
          />
          <ListRow
            icon={<Ionicons name="card" size={16} color={Colors.brand.primary} />}
            title={t("settings.savedCards")}
            onPress={() => router.push("/settings/cards")}
          />
          <ListRow
            icon={<Ionicons name="document-text-outline" size={16} color={Colors.brand.primary} />}
            title={t("settings.documents")}
            onPress={() => router.push("/settings/documents")}
          />
          <ListRow
            icon={
              <Ionicons name="information-circle-outline" size={16} color={Colors.brand.primary} />
            }
            title={t("settings.about")}
            onPress={() => router.push("/settings/about")}
          />
          <ListRow
            icon={<Ionicons name="help-circle-outline" size={16} color={Colors.brand.primary} />}
            title={t("settings.help")}
            onPress={() => router.push("/settings/help")}
          />

          {/* ── Dev 2 Features ── */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: Colors.brand.primary50,
            }}
          >
            <Text
              style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: Colors.brand.primary }}
            >
              DEV 2 FEATURES
            </Text>
          </View>
          <ListRow
            icon={<Ionicons name="chatbubbles-outline" size={16} color={Colors.brand.primary} />}
            title="Support Chatbot (F9)"
            onPress={() => router.push("/support")}
          />
          <ListRow
            icon={<Ionicons name="grid-outline" size={16} color={Colors.brand.primary} />}
            title="Admin Dashboard (F10)"
            onPress={() => router.push("/admin")}
          />
          <ListRow
            icon={<Ionicons name="storefront-outline" size={16} color={Colors.brand.primary} />}
            title="Merchant Dashboard (F15)"
            onPress={() => router.push("/merchant")}
          />
          <ListRow
            icon={<Ionicons name="cart-outline" size={16} color={Colors.brand.primary} />}
            title="OAuth Checkout (F18)"
            onPress={() => router.push("/checkout")}
          />
          <ListRow
            icon={<Ionicons name="shield-outline" size={16} color={Colors.brand.primary} />}
            title="Fraud Detection (F31)"
            onPress={() => router.push("/fraud")}
          />
          <ListRow
            icon={<Ionicons name="logo-whatsapp" size={16} color="#25D366" />}
            title="WhatsApp Bot (F7)"
            onPress={() => router.push("/whatsapp")}
          />
          <ListRow
            icon={<Ionicons name="phone-portrait-outline" size={16} color={Colors.brand.primary} />}
            title="NFC Soft POS (F20)"
            onPress={() => router.push("/nfc-pos")}
          />
          <ListRow
            icon={<Ionicons name="megaphone-outline" size={16} color={Colors.brand.primary} />}
            title="Marketing Dashboard (F21)"
            onPress={() => router.push("/marketing")}
          />
          <ListRow
            icon={<Ionicons name="cash-outline" size={16} color={Colors.brand.primary} />}
            title="Payroll Module (F14)"
            onPress={() => router.push("/payroll")}
          />
          <ListRow
            icon={<Ionicons name="wallet-outline" size={16} color={Colors.brand.primary} />}
            title="Microloans (F25)"
            onPress={() => router.push("/microloans")}
          />
          <ListRow
            icon={<Ionicons name="umbrella-outline" size={16} color={Colors.brand.primary} />}
            title="Microinsurance (F27)"
            onPress={() => router.push("/insurance")}
          />
          <ListRow
            icon={<Ionicons name="school-outline" size={16} color={Colors.brand.primary} />}
            title="Financial Literacy (F30)"
            onPress={() => router.push("/learn")}
          />

          {/* ── Danger ── */}
          <ListRow
            icon={<Ionicons name="close-circle-outline" size={16} color={Colors.accent.red} />}
            title={t("settings.closeAccount")}
            onPress={() => setConfirmClose(true)}
          />
          <ListRow
            icon={<Ionicons name="log-out-outline" size={16} color={Colors.accent.red} />}
            title={t("settings.logout")}
            divider={false}
            onPress={() => setConfirmLogout(true)}
          />
        </MotiView>
      </ScrollView>

      {/* ─── Close account modal ─── */}
      <Modal
        visible={confirmClose}
        animationType="fade"
        transparent
        onRequestClose={() => setConfirmClose(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 30,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 24,
              width: "100%",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: Colors.accent.redSoft,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <Ionicons name="warning" size={28} color={Colors.accent.red} />
            </View>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: Colors.ink[900],
                marginBottom: 6,
                textAlign: "center",
              }}
            >
              Close your account?
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: Colors.ink[500],
                textAlign: "center",
                marginBottom: 18,
                lineHeight: 18,
              }}
            >
              This action is permanent. All your data and balances will be lost.
            </Text>
            <Button title="Keep account" onPress={() => setConfirmClose(false)} />
            <Pressable onPress={() => setConfirmClose(false)} style={{ marginTop: 12 }}>
              <Text
                style={{ color: Colors.accent.red, fontFamily: "Inter_500Medium", fontSize: 14 }}
              >
                Close my account
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ─── Log out modal ─── */}
      <Modal
        visible={confirmLogout}
        animationType="fade"
        transparent
        onRequestClose={() => setConfirmLogout(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 30,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 24,
              width: "100%",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: Colors.brand.primary50,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <Ionicons name="log-out-outline" size={28} color={Colors.brand.primary} />
            </View>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: Colors.ink[900],
                marginBottom: 6,
                textAlign: "center",
              }}
            >
              Log out of ZADPAY?
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: Colors.ink[500],
                textAlign: "center",
                marginBottom: 18,
                lineHeight: 18,
              }}
            >
              You will need to sign in again to access your account.
            </Text>
            <Button title="Stay signed in" onPress={() => setConfirmLogout(false)} />
            <Pressable
              onPress={() => {
                setConfirmLogout(false);
                void logout().then(() => router.replace("/(auth)/welcome"));
              }}
              style={{ marginTop: 12 }}
            >
              <Text
                style={{ color: Colors.accent.red, fontFamily: "Inter_500Medium", fontSize: 14 }}
              >
                Log out
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
