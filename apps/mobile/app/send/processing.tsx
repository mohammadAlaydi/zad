import { router, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text } from "react-native";
import Svg, { Path, Circle, G } from "react-native-svg";
import { Screen } from "@/components/Screen";
import { useMyAccounts, useWithdraw } from "@/features/wallet";
import { newIdempotencyKey } from "@/lib/api/idempotency";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

function RocketIllustration() {
  return (
    <Svg width={180} height={180} viewBox="0 0 200 200">
      <Circle cx="40" cy="140" r="14" fill="#E7DCF5" opacity={0.6} />
      <Circle cx="60" cy="160" r="10" fill="#E7DCF5" opacity={0.5} />
      <Circle cx="160" cy="150" r="12" fill="#E7DCF5" opacity={0.6} />
      <Circle cx="140" cy="170" r="8" fill="#E7DCF5" opacity={0.5} />
      <Circle cx="30" cy="40" r="2" fill="#5B2C9C" />
      <Circle cx="170" cy="60" r="2.5" fill="#1FCFA5" />
      <Circle cx="160" cy="25" r="2" fill="#5B2C9C" />
      <Circle cx="45" cy="80" r="1.5" fill="#1FCFA5" />
      <G>
        <Path
          d="M100 30 Q120 50 120 110 L 120 130 L 80 130 L 80 110 Q80 50 100 30 Z"
          fill="#5B2C9C"
        />
        <Circle cx="100" cy="80" r="12" fill="#FFFFFF" />
        <Circle cx="100" cy="80" r="6" fill="#1FCFA5" />
        <Path d="M80 110 L 60 140 L 80 135 Z" fill="#3A1670" />
        <Path d="M120 110 L 140 140 L 120 135 Z" fill="#3A1670" />
        <Path d="M88 130 Q100 165 112 130 Z" fill="#F2B441" />
        <Path d="M93 130 Q100 150 107 130 Z" fill="#E25563" />
      </G>
    </Svg>
  );
}

export default function SendProcessing() {
  const { t } = useTranslation();
  const { amount, mobile, contactName, message } = useLocalSearchParams<{
    amount: string;
    mobile: string;
    contactName: string;
    message: string;
  }>();
  const { activeCurrency } = useApp();
  const accounts = useMyAccounts();
  const withdraw = useWithdraw();
  const [error, setError] = useState<string | null>(null);
  const idempotencyKey = useMemo(() => newIdempotencyKey(), []);
  const ran = useRef(false);

  useEffect(() => {
    // Once-per-mount guard — accounts.data flipping from undefined to
    // populated would otherwise fire the mutation twice.
    if (ran.current) return;
    if (accounts.data === undefined) return;
    ran.current = true;

    const account = accounts.data.accounts.find((a) => a.currency === activeCurrency);
    if (account === undefined) {
      setError(`No ${activeCurrency} wallet found.`);
      return;
    }

    const amt = Number(amount || 0);
    const destination = (contactName || mobile || "recipient").toString();

    withdraw
      .mutateAsync({
        request: {
          accountId: account.id,
          amount: { amount: String(Math.round(amt * 100)), currency: account.currency },
          destination,
        },
        idempotencyKey,
      })
      .then(() => {
        router.replace({
          pathname: "/send/success",
          params: { amount: String(amount), mobile, contactName, message },
        });
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Send failed");
      });
  }, [
    accounts.data,
    activeCurrency,
    amount,
    contactName,
    mobile,
    message,
    idempotencyKey,
    withdraw,
  ]);

  return (
    <Screen
      bg={Colors.white}
      contentStyle={{ alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}
    >
      <MotiView
        from={{ translateY: 12 }}
        animate={{ translateY: [-10, 4, -10] }}
        transition={{ loop: true, duration: 1800, type: "timing" }}
        style={{ marginBottom: 24 }}
      >
        <RocketIllustration />
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 200 }}
      >
        <Text
          style={{
            color: Colors.brand.primary,
            fontFamily: "Sora_700Bold",
            fontSize: 22,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          {t("send.processing")}
        </Text>
      </MotiView>

      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 400 }}>
        <Text
          style={{
            color: Colors.ink[500],
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            textAlign: "center",
            lineHeight: 22,
            maxWidth: 260,
          }}
        >
          {t("send.processingHint")}
        </Text>
      </MotiView>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 30 }}>
        {[0, 1, 2].map((i) => (
          <MotiView
            key={i}
            from={{ opacity: 0.3, scale: 1 }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
            transition={{ loop: true, duration: 1200, delay: i * 200, type: "timing" }}
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.brand.primary }}
          />
        ))}
      </View>

      {error !== null && (
        <Text
          style={{
            marginTop: 20,
            color: Colors.accent.red,
            fontFamily: "Inter_400Regular",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
      )}
    </Screen>
  );
}
