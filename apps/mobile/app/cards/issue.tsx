import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MotiView } from "moti";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { useAuthSession } from "@/features/auth";
import { useCreateUserItem } from "@/features/userdata";
import { Colors } from "@/theme/colors";

type CardType = "virtual" | "physical";

export default function IssueCard() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const createCard = useCreateUserItem("cards");
  const { session } = useAuthSession();
  const [selected, setSelected] = useState<CardType>("virtual");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async () => {
    setError(null);
    if (session?.user.fullName === undefined) {
      setError("Sign in to request a card.");
      return;
    }
    // Virtual cards generate a placeholder last4 locally — real issuance
    // would call a card-issuer API and persist its response. The
    // expiry is set 4y out; the issuer would override this in production.
    const last4 = String(Math.floor(1000 + Math.random() * 9000));
    const expYear = String((new Date().getFullYear() + 4) % 100).padStart(2, "0");
    try {
      await createCard.mutateAsync({
        brand: "visa",
        last4,
        exp: `12/${expYear}`,
        name: session.user.fullName,
        isVirtual: selected === "virtual",
        isPhysical: selected === "physical",
        isActive: true,
        atmEnabled: selected === "physical",
        deliveryAddress: selected === "physical" ? `${address}, ${city}` : undefined,
      });
      router.push({ pathname: "/cards/success", params: { type: selected } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not issue card");
    }
  };

  return (
    <Screen bg={Colors.white}>
      <Header title="Request a Card" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 320 }}
        >
          <Text
            style={{
              fontFamily: "Sora_700Bold",
              fontSize: 22,
              color: Colors.brand.primary,
              marginTop: 4,
              marginBottom: 6,
            }}
          >
            Choose Card Type
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: Colors.ink[500],
              marginBottom: 24,
            }}
          >
            Select how you want to use your new card
          </Text>
        </MotiView>

        {/* Virtual Card Option */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 60, duration: 320 }}
        >
          <Pressable
            onPress={() => setSelected("virtual")}
            style={{
              borderRadius: 18,
              borderWidth: 2,
              borderColor: selected === "virtual" ? Colors.brand.primary : Colors.ink[200],
              backgroundColor: selected === "virtual" ? Colors.brand.primary50 : Colors.white,
              padding: 18,
              marginBottom: 14,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: selected === "virtual" ? Colors.brand.primary : Colors.ink[100],
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={22}
                  color={selected === "virtual" ? Colors.white : Colors.ink[500]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.ink[900] }}
                >
                  Virtual Card
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 13,
                    color: Colors.ink[500],
                    marginTop: 2,
                  }}
                >
                  Instant • Free
                </Text>
              </View>
              {selected === "virtual" && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.brand.primary} />
              )}
            </View>
            <View style={{ gap: 6 }}>
              {[
                "Available instantly in your wallet",
                "Use for online & in-app payments",
                "No physical delivery needed",
              ].map((feat) => (
                <View key={feat} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="checkmark" size={14} color={Colors.accent.green} />
                  <Text
                    style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[600] }}
                  >
                    {feat}
                  </Text>
                </View>
              ))}
            </View>
          </Pressable>
        </MotiView>

        {/* Physical Card Option */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 120, duration: 320 }}
        >
          <Pressable
            onPress={() => setSelected("physical")}
            style={{
              borderRadius: 18,
              borderWidth: 2,
              borderColor: selected === "physical" ? Colors.brand.primary : Colors.ink[200],
              backgroundColor: selected === "physical" ? Colors.brand.primary50 : Colors.white,
              padding: 18,
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: selected === "physical" ? Colors.brand.primary : Colors.ink[100],
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Ionicons
                  name="card-outline"
                  size={22}
                  color={selected === "physical" ? Colors.white : Colors.ink[500]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.ink[900] }}
                >
                  Physical Card
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 13,
                    color: Colors.ink[500],
                    marginTop: 2,
                  }}
                >
                  3–5 business days • $5 fee
                </Text>
              </View>
              {selected === "physical" && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.brand.primary} />
              )}
            </View>
            <View style={{ gap: 6 }}>
              {["Use at ATMs worldwide", "Tap to pay in stores", "Accepted anywhere Visa is"].map(
                (feat) => (
                  <View key={feat} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name="checkmark" size={14} color={Colors.accent.green} />
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 13,
                        color: Colors.ink[600],
                      }}
                    >
                      {feat}
                    </Text>
                  </View>
                ),
              )}
            </View>
          </Pressable>
        </MotiView>

        {/* Delivery address — physical only */}
        {selected === "physical" && (
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 280 }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 15,
                color: Colors.ink[900],
                marginBottom: 14,
              }}
            >
              Delivery Address
            </Text>
            <Input
              label="Address Line"
              placeholder="e.g. 12 Al Rashid Street, Apt 4"
              value={address}
              onChangeText={setAddress}
            />
            <Input label="City" placeholder="e.g. Dubai" value={city} onChangeText={setCity} />
          </MotiView>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 16 }}>
        {error !== null && (
          <Text
            style={{
              color: Colors.accent.red,
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {error}
          </Text>
        )}
        <Button
          title={createCard.isPending ? "Requesting…" : "Request Card"}
          onPress={() => void handleRequest()}
          disabled={
            createCard.isPending || (selected === "physical" && (!address.trim() || !city.trim()))
          }
        />
      </View>
    </Screen>
  );
}
