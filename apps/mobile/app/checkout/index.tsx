import { Ionicons } from "@expo/vector-icons";
import { isCurrency } from "@zadpay/types";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { usePayCheckout } from "@/features/checkout";
import { useUserItems } from "@/features/userdata";
import { useAccountBalance, useMyAccounts } from "@/features/wallet";
import { newIdempotencyKey } from "@/lib/api/idempotency";
import { useApp } from "@/store/appStore";
import {
  useCheckoutStore,
  type CartItem,
  type MerchantInfo,
  type PaymentMethod,
} from "@/store/checkoutStore";
import { Colors } from "@/theme/colors";

interface CardPayload {
  last4?: string;
  brand?: string;
}

// Merchants build a deep link of the form
//   zadpay://checkout?merchantPhone=...&merchantName=...&total=...&items=<base64-json>
// We read those params on mount and hydrate the store. If they're missing,
// the screen shows a "no checkout in progress" empty state — never a seeded
// demo cart.
function parseItemsParam(raw: string | undefined): CartItem[] {
  if (raw === undefined || raw === "") return [];
  try {
    const decoded = decodeURIComponent(raw);
    const parsed: unknown = JSON.parse(decoded);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (it): it is CartItem =>
          it !== null &&
          typeof it === "object" &&
          "id" in it &&
          "name" in it &&
          "price" in it &&
          "quantity" in it,
      )
      .map((it) => ({
        id: String(it.id),
        name: String(it.name),
        price: Number(it.price),
        quantity: Number(it.quantity),
      }));
  } catch {
    return [];
  }
}

export default function Checkout() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    merchantPhone?: string;
    merchantName?: string;
    merchantId?: string;
    merchantVerified?: string;
    items?: string;
  }>();
  const {
    merchant,
    cart,
    paymentMethod,
    status,
    errorMessage,
    setIntent,
    setPaymentMethod,
    setStatus,
    setError,
    reset,
  } = useCheckoutStore();
  const { activeCurrency } = useApp();
  const pay = usePayCheckout();
  const accounts = useMyAccounts();
  const account = accounts.data?.accounts.find((a) => a.currency === activeCurrency);
  const balanceQuery = useAccountBalance(account?.id);
  const walletBalance =
    balanceQuery.data === undefined ? 0 : Number(BigInt(balanceQuery.data.balance.amount)) / 100;
  const cardsQuery = useUserItems<CardPayload>("cards");
  const firstCard = cardsQuery.data?.items[0];

  // Hydrate the store from URL params on first mount. We do this in an
  // effect (rather than during render) so the store update doesn't trigger
  // a re-render loop. If params are missing we leave the store empty.
  useEffect(() => {
    if (params.merchantPhone === undefined || params.merchantPhone === "") return;
    const merchantInfo: MerchantInfo = {
      id: params.merchantId ?? params.merchantPhone,
      name: params.merchantName ?? "Merchant",
      phone: params.merchantPhone,
      verified: params.merchantVerified === "true",
    };
    setIntent(merchantInfo, parseItemsParam(params.items));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.merchantPhone,
    params.merchantId,
    params.merchantName,
    params.merchantVerified,
    params.items,
  ]);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal;

  // One idempotency key per mounted checkout screen. Reused across
  // retries of the same payment intent so multiple taps don't double-
  // charge. Re-mounting the screen generates a new one.
  const idempotencyKeyRef = useRef(newIdempotencyKey());

  const currency = useMemo(
    () => (isCurrency(activeCurrency) ? activeCurrency : null),
    [activeCurrency],
  );

  const handlePay = async () => {
    if (merchant === null) {
      setError("No merchant selected.");
      setStatus("failed");
      return;
    }
    if (currency === null) {
      setError("Unsupported currency.");
      setStatus("failed");
      return;
    }
    if (cart.length === 0) {
      setError("Cart is empty.");
      setStatus("failed");
      return;
    }
    setError(null);
    setStatus("processing");
    const result = await pay
      .mutateAsync({
        request: {
          merchantPhone: merchant.phone,
          items: cart.map((c) => ({
            id: c.id,
            name: c.name,
            priceMinor: String(Math.round(c.price * 100)),
            quantity: c.quantity,
          })),
          totalMinor: String(Math.round(total * 100)),
          currency,
        },
        idempotencyKey: idempotencyKeyRef.current,
      })
      .catch((e: unknown) => {
        const message =
          e !== null && typeof e === "object" && "message" in e
            ? String((e as { message: unknown }).message)
            : "Checkout failed";
        setError(message);
        setStatus("failed");
        return null;
      });
    if (result !== null) {
      setStatus("success");
    }
  };

  /* Empty state — no merchant context */
  if (merchant === null || cart.length === 0) {
    return (
      <Screen bg={Colors.surface.background}>
        <StatusBar barStyle="dark-content" />
        <Header title="Checkout" />
        <View style={styles.successContainer}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: Colors.ink[100],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="storefront-outline" size={40} color={Colors.ink[400]} />
          </View>
          <Text style={styles.successTitle}>No checkout in progress</Text>
          <Text style={styles.successSub}>
            Open a merchant&apos;s checkout link or scan their QR to start a payment.
          </Text>
          <Button
            title="Back to Home"
            onPress={() => router.replace("/(tabs)/home")}
            style={{ marginTop: 30, paddingHorizontal: 18 }}
          />
        </View>
      </Screen>
    );
  }

  /* Success view */
  if (status === "success") {
    return (
      <Screen bg={Colors.surface.background}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.successContainer}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={48} color={Colors.white} />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSub}>Your order with {merchant.name} has been confirmed.</Text>
          <Text style={styles.successAmount}>${total.toFixed(2)}</Text>
          <Button
            title="Back to Home"
            onPress={() => {
              reset();
              router.replace("/(tabs)/home");
            }}
            style={{ marginTop: 30, paddingHorizontal: 18 }}
          />
        </View>
      </Screen>
    );
  }

  /* Processing view */
  if (status === "processing") {
    return (
      <Screen bg={Colors.surface.background}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.successContainer}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
          <Text style={[styles.successTitle, { marginTop: 20 }]}>Processing Payment...</Text>
          <Text style={styles.successSub}>Charging your wallet and notifying the merchant.</Text>
        </View>
      </Screen>
    );
  }

  /* Failure view — surfaces backend errors (insufficient balance,
     merchant not found, currency mismatch, etc.) so the user can act. */
  if (status === "failed") {
    return (
      <Screen bg={Colors.surface.background}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.successContainer}>
          <View style={[styles.successCircle, { backgroundColor: Colors.accent.red }]}>
            <Ionicons name="close" size={48} color={Colors.white} />
          </View>
          <Text style={styles.successTitle}>Payment Failed</Text>
          <Text style={styles.successSub}>
            {errorMessage ?? "We couldn't complete this payment. Please try again."}
          </Text>
          <Button
            title="Try again"
            onPress={() => {
              setError(null);
              setStatus("idle");
              idempotencyKeyRef.current = newIdempotencyKey();
            }}
            style={{ marginTop: 30, paddingHorizontal: 18 }}
          />
        </View>
      </Screen>
    );
  }

  // Payment method options. Card option is hidden when the user has no
  // saved card so we never show fake "Visa ending in 4242".
  type IconName = React.ComponentProps<typeof Ionicons>["name"];
  const methods: { key: PaymentMethod; label: string; icon: IconName; desc: string }[] = [
    {
      key: "wallet",
      label: "ZADPay Wallet",
      icon: "wallet",
      desc: `Balance: ${activeCurrency} ${walletBalance.toLocaleString()}`,
    },
  ];
  if (firstCard !== undefined) {
    const last4 = firstCard.payload.last4 ?? "0000";
    const brand = firstCard.payload.brand ?? "Card";
    methods.push({
      key: "card",
      label: "Saved Card",
      icon: "card",
      desc: `${brand} ending in ${last4}`,
    });
  }

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="dark-content" />
      <Header title="Checkout" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Merchant Info */}
        <View style={styles.merchantRow}>
          <View style={styles.merchantIcon}>
            <Ionicons name="storefront" size={22} color={Colors.brand.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.merchantName}>{merchant.name}</Text>
              {merchant.verified && (
                <Ionicons name="shield-checkmark" size={14} color={Colors.accent.green} />
              )}
            </View>
            <Text style={styles.merchantSub}>
              {merchant.verified ? "Verified Merchant" : merchant.phone}
            </Text>
          </View>
        </View>

        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cart.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.cartThumb}>
                <Ionicons name="cube" size={20} color={Colors.ink[400]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cartName}>{item.name}</Text>
                <Text style={styles.cartQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.cartPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {methods.map((m) => (
            <Pressable
              key={m.key}
              onPress={() => setPaymentMethod(m.key)}
              style={[styles.methodRow, paymentMethod === m.key && styles.methodActive]}
            >
              <View
                style={[
                  styles.methodIcon,
                  paymentMethod === m.key && { backgroundColor: Colors.brand.primary + "18" },
                ]}
              >
                <Ionicons
                  name={m.icon}
                  size={20}
                  color={paymentMethod === m.key ? Colors.brand.primary : Colors.ink[500]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodLabel}>{m.label}</Text>
                <Text style={styles.methodDesc}>{m.desc}</Text>
              </View>
              <View style={[styles.radio, paymentMethod === m.key && styles.radioActive]}>
                {paymentMethod === m.key && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Transaction Fee</Text>
            <Text style={[styles.totalValue, { color: Colors.accent.green }]}>FREE</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pay button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          title={`Pay $${total.toFixed(2)}`}
          onPress={handlePay}
          loading={pay.isPending}
          disabled={pay.isPending || cart.length === 0}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  merchantRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#101225",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  merchantIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  merchantName: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.ink[900] },
  merchantSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.ink[500],
    marginTop: 2,
  },
  section: { paddingHorizontal: 18, marginTop: 16 },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
    marginBottom: 10,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  cartThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.ink[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cartName: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.ink[900] },
  cartQty: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], marginTop: 2 },
  cartPrice: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.ink[900] },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  methodActive: { borderColor: Colors.brand.primary, backgroundColor: Colors.brand.primary + "06" },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.ink[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  methodLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  methodDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.ink[500],
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.ink[300],
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: Colors.brand.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.brand.primary },
  totalsCard: {
    marginHorizontal: 18,
    marginTop: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  totalLabel: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[600] },
  totalValue: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.ink[900] },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.ink[100],
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  grandLabel: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.ink[900] },
  grandValue: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.brand.primary },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.ink[100],
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent.green,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.ink[900],
    marginTop: 24,
    textAlign: "center",
  },
  successSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.ink[500],
    textAlign: "center",
    marginTop: 8,
  },
  successAmount: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.brand.primary,
    marginTop: 12,
  },
});
