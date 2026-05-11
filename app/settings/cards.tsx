import { View, Text, Pressable, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";
import { useHaptic } from "@/hooks/useHaptic";

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
  const { cards } = useApp();

  // Ensure we display at least 2 cards as per PDF
  const display = cards.length
    ? cards
    : [
        { id: "1", last4: "5454" },
        { id: "2", last4: "5454" },
      ];

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
            <Ionicons
              name="create-outline"
              size={22}
              color={Colors.brand.primary}
            />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 24,
        }}
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

        {display.map((card, i) => (
          <MotiView
            key={card.id}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 90 + i * 90, duration: 320 }}
          >
            <Pressable
              onPress={() => haptic.selection()}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                borderRadius: 18,
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: Colors.ink[100],
                marginBottom: 12,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View
                style={{
                  marginRight: 14,
                  paddingHorizontal: 4,
                }}
              >
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
                  5454 8844 8844 {card.last4}
                </Text>
              </View>
            </Pressable>
          </MotiView>
        ))}

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
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              height: 56,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: Colors.ink[200],
              marginTop: 8,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons
              name="card-outline"
              size={20}
              color={Colors.ink[700]}
            />
            <Text
              style={{
                color: Colors.ink[700],
                fontFamily: "Inter_500Medium",
                fontSize: 14,
              }}
            >
              {t("cards.addCard")}
            </Text>
          </Pressable>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
