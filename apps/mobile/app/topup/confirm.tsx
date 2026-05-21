import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useMyAccounts, useTopup } from "@/features/wallet";
import { newIdempotencyKey } from "@/lib/api/idempotency";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

export default function TopUpConfirm() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { amount, cardId, cardLast4 } = useLocalSearchParams<{
    amount: string;
    cardId: string;
    cardLast4: string;
  }>();
  const { activeCurrency } = useApp();
  const amt = Number(amount || 0);
  const accounts = useMyAccounts();
  const topup = useTopup();
  const [error, setError] = useState<string | null>(null);

  // One idempotency key per mounted confirm screen — retries of the same
  // logical top-up are safe; navigating away + back generates a new one.
  const idempotencyKey = useMemo(() => newIdempotencyKey(), []);

  const missingCard =
    cardId === undefined || cardId === "" || cardLast4 === undefined || cardLast4 === "";

  // Topup requires a card. If we arrived here without one (deep-link or
  // refresh), bounce back to the card picker instead of showing a fake
  // "**** 4242" entry. The redirect happens in an effect so hooks above
  // still run in a stable order on every render.
  useEffect(() => {
    if (missingCard) {
      router.replace({ pathname: "/topup/payment", params: { amount: amount ?? "0" } });
    }
  }, [missingCard, amount]);

  if (missingCard) return null;
  const card = { id: cardId, last4: cardLast4 };

  const account = accounts.data?.accounts.find((a) => a.currency === activeCurrency);

  async function handleTopUp() {
    if (account === undefined) {
      setError(`No ${activeCurrency} wallet found.`);
      return;
    }
    setError(null);
    try {
      const result = await topup.mutateAsync({
        request: {
          accountId: account.id,
          // Minor units (cents). UI deals in major units.
          amount: { amount: String(Math.round(amt * 100)), currency: account.currency },
          // The card id from userdata acts as the funding source. The
          // InMemoryPaymentProcessor in dev accepts any non-empty value;
          // a real PSP would use this to look up tokenised PAN.
          source: `card_${card.id}`,
        },
        idempotencyKey,
      });
      router.replace({
        pathname: "/topup/success",
        params: {
          amount: String(amt),
          currency: account.currency,
          cardLast4: card.last4,
          transactionId: result.transaction.id,
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Top up failed");
    }
  }

  const busy = topup.isPending || accounts.isLoading;

  return (
    <Screen bg={Colors.white}>
      <Header title={t("common.confirm")} />
      <View style={{ flex: 1, paddingHorizontal: 18, alignItems: "center", paddingTop: 30 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: Colors.brand.primary,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          <Text style={{ color: Colors.white, fontFamily: "Sora_700Bold", fontSize: 22 }}>ZP</Text>
        </View>
        <Text style={{ color: Colors.accent.green, fontFamily: "Inter_500Medium", fontSize: 13 }}>
          {t("topup.topUpYour")}
        </Text>
        <Text
          style={{ color: Colors.ink[900], fontFamily: "Sora_700Bold", fontSize: 20, marginTop: 4 }}
        >
          {t("topup.zadpayWallet")}
        </Text>

        {/* From card */}
        <View
          style={{
            width: "100%",
            backgroundColor: Colors.surface.background,
            borderRadius: 16,
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            marginTop: 28,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#EB001B",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: "#F79E1B",
                position: "absolute",
                right: 6,
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
              {t("topup.masterCard")}
            </Text>
            <Text style={{ color: Colors.ink[400], fontFamily: "Inter_400Regular", fontSize: 12 }}>
              **** **** **** {card.last4}
            </Text>
          </View>
        </View>

        {/* Transfer details */}
        <View
          style={{
            width: "100%",
            backgroundColor: Colors.surface.background,
            borderRadius: 16,
            padding: 16,
            marginTop: 12,
          }}
        >
          <Text
            style={{
              color: Colors.ink[900],
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
              marginBottom: 12,
            }}
          >
            {t("send.transferDetails")}
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 }}>
              {t("send.transferAmount")}
            </Text>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
              {amt}$
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 }}>
              {t("send.transferFee")}
            </Text>
            <Text
              style={{ color: Colors.accent.green, fontFamily: "Inter_600SemiBold", fontSize: 13 }}
            >
              {t("send.free")}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: Colors.ink[200],
            }}
          >
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
              {t("common.total")}
            </Text>
            <Text
              style={{ color: Colors.brand.primary, fontFamily: "Inter_700Bold", fontSize: 16 }}
            >
              {amt}$
            </Text>
          </View>
        </View>

        {error !== null && (
          <Text
            style={{
              marginTop: 14,
              color: Colors.accent.red,
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            {error}
          </Text>
        )}
      </View>

      <View style={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 16 }}>
        <Button
          title={busy ? "Topping up…" : t("topup.title")}
          disabled={busy}
          onPress={handleTopUp}
        />
      </View>
    </Screen>
  );
}
