import { View, Text, Pressable, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { ListRow } from "@/components/ListRow";
import { Colors } from "@/theme/colors";
import { useHaptic } from "@/hooks/useHaptic";

export default function Security() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();

  return (
    <Screen bg={Colors.surface.background}>
      {/* Purple header */}
      <View
        style={{
          backgroundColor: Colors.brand.primary,
          paddingTop: insets.top + 8,
          paddingBottom: 28,
          paddingHorizontal: 18,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          overflow: "hidden",
        }}
      >
        {/* subtle pattern */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 130,
            height: 130,
            borderRadius: 65,
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable
            hitSlop={10}
            onPress={() => {
              haptic.light();
              router.canGoBack() ? router.back() : router.replace("/(tabs)/settings");
            }}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.white} />
          </Pressable>
          <View style={{ width: 40 }} />
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 380 }}
          style={{ marginTop: 18, alignItems: "center" }}
        >
          <Text
            style={{
              fontFamily: "Sora_700Bold",
              fontSize: 30,
              color: Colors.white,
              letterSpacing: 0.5,
            }}
          >
            ZADPAY
            <Text style={{ color: Colors.accent.green }}> Security</Text>
          </Text>
        </MotiView>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 28,
            marginTop: 22,
          }}
        >
          {[
            { icon: "bug-outline" as const, label: t("security.reportFraud") },
            {
              icon: "phone-portrait-outline" as const,
              label: t("security.lostDevice"),
            },
          ].map((it, i) => (
            <Pressable
              key={it.label}
              onPress={() => haptic.selection()}
              style={({ pressed }) => ({
                alignItems: "center",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Ionicons name={it.icon} size={22} color={Colors.white} />
              </View>
              <Text
                style={{
                  color: Colors.white,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                }}
              >
                {it.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 80, duration: 320 }}
        >
          <Text
            style={{
              color: Colors.ink[500],
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              marginBottom: 8,
              marginLeft: 4,
            }}
          >
            {t("security.paymentSecurity")}
          </Text>
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: Colors.ink[100],
              overflow: "hidden",
              marginBottom: 18,
            }}
          >
            <ListRow
              icon={
                <Ionicons
                  name="card-outline"
                  size={18}
                  color={Colors.brand.primary}
                />
              }
              title={t("security.cardSecurity")}
              onPress={() => {}}
            />
            <ListRow
              icon={
                <Ionicons
                  name="link-outline"
                  size={18}
                  color={Colors.brand.primary}
                />
              }
              title={t("security.cardConnections")}
              onPress={() => {}}
            />
            <ListRow
              icon={
                <Ionicons
                  name="cash-outline"
                  size={18}
                  color={Colors.brand.primary}
                />
              }
              title={t("security.payments")}
              divider={false}
              onPress={() => {}}
            />
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 160, duration: 320 }}
        >
          <Text
            style={{
              color: Colors.ink[500],
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              marginBottom: 8,
              marginLeft: 4,
            }}
          >
            {t("security.loginSecurity")}
          </Text>
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: Colors.ink[100],
              overflow: "hidden",
              marginBottom: 18,
            }}
          >
            <ListRow
              icon={
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={Colors.brand.primary}
                />
              }
              title={t("security.signin")}
              onPress={() => {}}
            />
            <ListRow
              icon={
                <Ionicons
                  name="phone-portrait-outline"
                  size={18}
                  color={Colors.brand.primary}
                />
              }
              title={t("security.devices")}
              onPress={() => {}}
            />
            <ListRow
              icon={
                <Ionicons
                  name="apps-outline"
                  size={18}
                  color={Colors.brand.primary}
                />
              }
              title={t("security.connectedApps")}
              divider={false}
              onPress={() => {}}
            />
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 240, duration: 320 }}
        >
          <Pressable
            onPress={() => haptic.selection()}
            style={({ pressed }) => ({
              backgroundColor: Colors.white,
              borderRadius: 18,
              padding: 14,
              borderWidth: 1,
              borderColor: Colors.ink[100],
              flexDirection: "row",
              alignItems: "center",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: Colors.brand.primary50,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={Colors.brand.primary}
              />
            </View>
            <Text
              style={{
                flex: 1,
                color: Colors.ink[900],
                fontFamily: "Inter_500Medium",
                fontSize: 14,
              }}
            >
              {t("security.learnMore")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.ink[400]}
            />
          </Pressable>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
