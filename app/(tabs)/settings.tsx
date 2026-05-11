import { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { ListRow } from "@/components/ListRow";
import { Switch } from "@/components/Switch";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

export default function Settings() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user, biometricEnabled, faceIdEnabled, hideBalance, setBiometric, setFaceId, toggleHideBalance, signOut } = useApp();
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <Screen bg={Colors.white}>
      <Header
        title={t("settings.title")}
        showBack={false}
        right={<Pressable><Ionicons name="refresh" size={20} color={Colors.brand.primary} /></Pressable>}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>
        <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12, paddingHorizontal: 24, marginBottom: 14 }}>
          {t("settings.subtitle")}
        </Text>

        <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 400 }}>
          <Pressable
            onPress={() => router.push("/profile/edit")}
            style={({ pressed }) => ({
              marginHorizontal: 18, backgroundColor: Colors.white, borderRadius: 18, padding: 18,
              alignItems: "center", borderWidth: 1, borderColor: Colors.ink[100], opacity: pressed ? 0.92 : 1,
              shadowColor: "#101225", shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
            })}
          >
            <View style={{ position: "relative" }}>
              <Avatar name={user.fullName} size={72} />
              <View style={{
                position: "absolute", right: -2, bottom: -2, width: 26, height: 26, borderRadius: 13,
                backgroundColor: Colors.brand.primary, alignItems: "center", justifyContent: "center",
                borderWidth: 2, borderColor: "#FFFFFF",
              }}>
                <Ionicons name="create-outline" size={13} color="#FFFFFF" />
              </View>
            </View>
            <Text style={{ marginTop: 10, color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 17 }}>
              {user.fullName}
            </Text>
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
              {user.email}
            </Text>
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12 }}>{user.phone}</Text>
          </Pressable>
        </MotiView>

        <View style={{
          marginTop: 18, marginHorizontal: 18, backgroundColor: Colors.white, borderRadius: 18,
          borderWidth: 1, borderColor: Colors.ink[100], overflow: "hidden",
        }}>
          <ListRow
            icon={<Ionicons name="finger-print" size={18} color={Colors.brand.primary} />}
            title={t("settings.biometric")}
            right={<Switch value={biometricEnabled} onChange={setBiometric} />}
          />
          <ListRow
            icon={<Ionicons name="happy-outline" size={18} color={Colors.brand.primary} />}
            title={t("settings.faceId")}
            right={<Switch value={faceIdEnabled} onChange={setFaceId} />}
          />
          <ListRow
            icon={<Ionicons name="eye-off-outline" size={18} color={Colors.brand.primary} />}
            title={t("settings.hideBalance")}
            right={<Switch value={hideBalance} onChange={toggleHideBalance} />}
            divider={false}
          />
        </View>

        <View style={{
          marginTop: 18, marginHorizontal: 18, backgroundColor: Colors.white, borderRadius: 18,
          borderWidth: 1, borderColor: Colors.ink[100], overflow: "hidden",
        }}>
          <ListRow icon={<Ionicons name="card-outline" size={18} color={Colors.brand.primary} />} title={t("settings.accountDetails")} onPress={() => router.push("/profile/account-details")} />
          <ListRow icon={<Ionicons name="shield-checkmark-outline" size={18} color={Colors.brand.primary} />} title={t("settings.security")} onPress={() => router.push("/settings/security")} />
          <ListRow icon={<Ionicons name="card" size={18} color={Colors.brand.primary} />} title={t("settings.savedCards")} onPress={() => router.push("/settings/cards")} />
          <ListRow icon={<Ionicons name="document-text-outline" size={18} color={Colors.brand.primary} />} title={t("settings.documents")} onPress={() => router.push("/settings/documents")} />
          <ListRow icon={<Ionicons name="information-circle-outline" size={18} color={Colors.brand.primary} />} title={t("settings.about")} onPress={() => router.push("/settings/about")} />
          <ListRow icon={<Ionicons name="help-circle-outline" size={18} color={Colors.brand.primary} />} title={t("settings.help")} onPress={() => router.push("/settings/help")} divider={false} />
        </View>

        <View style={{
          marginTop: 18, marginHorizontal: 18, backgroundColor: Colors.white, borderRadius: 18,
          borderWidth: 1, borderColor: Colors.ink[100], overflow: "hidden",
        }}>
          <ListRow icon={<Ionicons name="close-circle-outline" size={18} color={Colors.accent.red} />} title={t("settings.closeAccount")} onPress={() => setConfirmClose(true)} />
          <ListRow icon={<Ionicons name="log-out-outline" size={18} color={Colors.accent.red} />} title={t("settings.logout")} divider={false} onPress={() => setConfirmLogout(true)} />
        </View>
      </ScrollView>

      <Modal visible={confirmClose} animationType="fade" transparent onRequestClose={() => setConfirmClose(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", paddingHorizontal: 30 }}>
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, width: "100%", alignItems: "center" }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#FBE3E5", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Ionicons name="warning" size={28} color={Colors.accent.red} />
            </View>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.ink[900], marginBottom: 6, textAlign: "center" }}>
              Close your account?
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[500], textAlign: "center", marginBottom: 18, lineHeight: 18 }}>
              This action is permanent. All your data and balances will be lost.
            </Text>
            <Button title="Keep account" onPress={() => setConfirmClose(false)} />
            <Pressable onPress={() => setConfirmClose(false)} style={{ marginTop: 12 }}>
              <Text style={{ color: Colors.accent.red, fontFamily: "Inter_500Medium", fontSize: 14 }}>Close my account</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={confirmLogout} animationType="fade" transparent onRequestClose={() => setConfirmLogout(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", paddingHorizontal: 30 }}>
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, width: "100%", alignItems: "center" }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.brand.primary50, alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Ionicons name="log-out-outline" size={28} color={Colors.brand.primary} />
            </View>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.ink[900], marginBottom: 6, textAlign: "center" }}>
              Log out of ZADPAY?
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[500], textAlign: "center", marginBottom: 18, lineHeight: 18 }}>
              You will need to sign in again to access your account.
            </Text>
            <Button title="Stay signed in" onPress={() => setConfirmLogout(false)} />
            <Pressable
              onPress={() => { setConfirmLogout(false); signOut(); router.replace("/(auth)/welcome"); }}
              style={{ marginTop: 12 }}
            >
              <Text style={{ color: Colors.accent.red, fontFamily: "Inter_500Medium", fontSize: 14 }}>Log out</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
