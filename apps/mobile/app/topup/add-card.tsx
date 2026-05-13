// PCI exposure stub. The original demo screen captured raw PAN / expiry /
// CVV into RN state and persisted last4 to AsyncStorage — audit finding
// S0-1 in docs/audit.md. Any production payment app must instead embed
// the processor's certified SDK (Stripe Elements, Adyen Drop-in, Checkout.
// com Frames) so the app never touches card data.
//
// PR-future wires a real processor adapter; for now this screen exists to
// (a) keep the navigation intact, (b) explain to a reader why card entry
// isn't here, (c) link to the audit + ADR for context.

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";

export default function AddCard() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Screen bg={Colors.white}>
      <Header title={t("topup.addNewCardTitle")} />
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: "center" }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: Colors.ink[50],
            padding: 24,
            borderRadius: 16,
          }}
        >
          <Ionicons name="shield-checkmark-outline" size={48} color={Colors.brand.primary} />
          <Text
            style={{
              marginTop: 16,
              color: Colors.ink[900],
              fontFamily: "Sora_700Bold",
              fontSize: 18,
              textAlign: "center",
            }}
          >
            Card entry happens here
          </Text>
          <Text
            style={{
              marginTop: 8,
              color: Colors.ink[600],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              textAlign: "center",
              lineHeight: 19,
            }}
          >
            For production we embed a PCI-compliant processor SDK (Stripe Elements / Adyen Drop-in).
            The mobile app never sees the PAN, CVV, or expiry — only a network token.
          </Text>
          <Text
            style={{
              marginTop: 12,
              color: Colors.ink[400],
              fontFamily: "Inter_400Regular",
              fontSize: 11,
              textAlign: "center",
            }}
          >
            See docs/audit.md S0-1 and ADR-0007.
          </Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
        <Button title="Back" variant="secondary" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
