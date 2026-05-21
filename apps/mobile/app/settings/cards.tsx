import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MotiView } from "moti";
import { useTranslation } from "react-i18next";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useUserItems } from "@/features/userdata";
import { useHaptic } from "@/hooks/useHaptic";
import { Colors } from "@/theme/colors";

const PAN_PREFIX = "5454 8844 8844";

interface CardPayload {
  brand?: string;
  last4?: string;
  exp?: string;
  name?: string;
  isVirtual?: boolean;
  isPhysical?: boolean;
  isActive?: boolean;
  atmEnabled?: boolean;
}

function MasterCardLogo() {
  return (
    <View
      style={{
        width: 44,
        height: 30,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: "#EB001B",
          marginRight: -8,
        }}
      />
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: "#F79E1B",
          opacity: 0.92,
        }}
      />
    </View>
  );
}

export default function SavedCards() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const cardsQuery = useUserItems<CardPayload>("cards");
  const cards = cardsQuery.data?.items ?? [];
  const display = cards.map((c) => ({ id: c.id, last4: c.payload.last4 ?? "0000" }));

  return (
    <Screen bg={Colors.white}>
      <Header
        title={t("cards.title")}
        right={
          <Pressable
            hitSlop={10}
            onPress={() => haptic.selection()}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Ionicons name="create-outline" size={22} color={Colors.brand.primary} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 320 }}
        >
          <Text
            style={{
              color: Colors.brand.primary,
              fontFamily: "Sora_700Bold",
              fontSize: 22,
              marginTop: 4,
              marginBottom: 18,
            }}
          >
            {t("cards.myCards")}
          </Text>
        </MotiView>

        {cardsQuery.isLoading ? (
          <Text
            style={{
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              paddingVertical: 28,
              textAlign: "center",
            }}
          >
            Loading…
          </Text>
        ) : display.length === 0 ? (
          <View
            style={{
              backgroundColor: Colors.surface.background,
              borderRadius: 18,
              paddingVertical: 32,
              paddingHorizontal: 24,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Ionicons name="card-outline" size={36} color={Colors.ink[300]} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 15,
                color: Colors.ink[800],
                marginTop: 12,
                marginBottom: 4,
              }}
            >
              No saved cards yet
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: Colors.ink[500],
                textAlign: "center",
              }}
            >
              Add a card to fund top-ups or request a ZADPay card below.
            </Text>
          </View>
        ) : (
          display.map((card, i) => (
            <MotiView
              key={card.id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 90 + i * 90, duration: 320 }}
            >
              <Pressable
                onPress={() => haptic.selection()}
                style={({ pressed }) => ({
                  borderRadius: 18,
                  backgroundColor: Colors.white,
                  borderWidth: 1,
                  borderColor: Colors.ink[100],
                  marginBottom: 12,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View style={{ flexDirection: "row", alignItems: "center", padding: 14 }}>
                  <View style={{ marginRight: 14, paddingHorizontal: 4 }}>
                    <MasterCardLogo />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: Colors.ink[900],
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                      }}
                    >
                      {t("topup.masterCard")}
                    </Text>
                    <Text
                      style={{
                        color: Colors.ink[400],
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {PAN_PREFIX} {card.last4}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </MotiView>
          ))
        )}

        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 280, duration: 320 }}
        >
          <Pressable
            onPress={() => {
              haptic.light();
              router.push("/topup/add-card");
            }}
            style={({ pressed }) => ({
              height: 56,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: Colors.ink[200],
              marginTop: 8,
              opacity: pressed ? 0.7 : 1,
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ionicons name="card-outline" size={20} color={Colors.ink[700]} />
              <Text style={{ color: Colors.ink[700], fontFamily: "Inter_500Medium", fontSize: 14 }}>
                {t("cards.addCard")}
              </Text>
            </View>
          </Pressable>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
