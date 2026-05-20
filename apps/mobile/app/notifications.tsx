import { Ionicons } from "@expo/vector-icons";
import type { WalletTransactionResponse } from "@zadpay/validation";
import { MotiView } from "moti";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useMyAccounts, useMyTransactions } from "@/features/wallet";
import { Colors } from "@/theme/colors";

interface NotifItem {
  id: string;
  title: string;
  body: string;
  icon: string;
  color: string;
  when: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  AED: "د.إ",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "A$",
  EGP: "E£",
  SAR: "﷼",
};

function formatAmount(minorStr: string, currency: string): string {
  const major = Math.abs(Number(minorStr)) / 100;
  const sym = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  return `${sym}${major.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatWhen(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekAgo = new Date(todayStart.getTime() - 7 * 86400000);
  if (date >= todayStart) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  if (date >= yesterdayStart) return "Yesterday";
  if (date >= weekAgo) {
    const days = Math.floor((todayStart.getTime() - date.getTime()) / 86400000);
    return `${days} days ago`;
  }
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function toNotifItem(tx: WalletTransactionResponse, myAccountIds: Set<string>): NotifItem {
  const mine = tx.entries.find((e) => myAccountIds.has(e.accountId));
  const isCredit = mine?.direction === "credit";
  const amount = mine ? formatAmount(mine.amount, mine.currency) : "";

  let title: string;
  let icon: string;
  let color: string;
  let body: string;

  if (tx.type === "transfer") {
    if (isCredit) {
      title = "Money Received";
      icon = "arrow-down-circle";
      color = Colors.accent.green;
      body = `You received ${amount} in your wallet.`;
    } else {
      title = "Money Sent";
      icon = "paper-plane";
      color = Colors.brand.primary;
      body = `You sent ${amount} successfully.`;
    }
  } else if (tx.type === "topup") {
    title = "Top Up";
    icon = "add-circle";
    color = Colors.accent.green;
    body = `Your wallet was topped up with ${amount}.`;
  } else if (tx.type === "withdrawal") {
    title = "Withdrawal";
    icon = "arrow-up-circle";
    color = Colors.accent.red;
    body = `${amount} was withdrawn from your wallet.`;
  } else if (tx.type === "reversal") {
    title = "Transfer Reversed";
    icon = "refresh-circle";
    color = Colors.brand.primary;
    body = `A transaction was reversed. ${amount} returned to your wallet.`;
  } else {
    title = tx.type.replace(/^\w/, (c) => c.toUpperCase());
    icon = "ellipse";
    color = Colors.ink[400];
    body = amount ? `Amount: ${amount}` : "Transaction processed.";
  }

  return { id: tx.id, title, body, icon, color, when: formatWhen(tx.createdAt) };
}

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const accounts = useMyAccounts();
  const txQuery = useMyTransactions({ page: 0, pageSize: 50 });

  const myAccountIds = new Set((accounts.data?.accounts ?? []).map((a) => a.id));
  const items: NotifItem[] = (txQuery.data?.transactions ?? []).map((tx) =>
    toNotifItem(tx, myAccountIds),
  );

  const isLoading = txQuery.isLoading || accounts.isLoading;

  return (
    <Screen bg={Colors.white}>
      <Header title="Notifications" />
      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={Colors.brand.primary} />
        </View>
      ) : items.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}
        >
          <Ionicons name="notifications-off-outline" size={48} color={Colors.ink[300]} />
          <Text
            style={{
              color: Colors.ink[400],
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              marginTop: 12,
              textAlign: "center",
            }}
          >
            No notifications yet. Send or receive money to get started.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 24 }}
        >
          {items.map((n, i) => (
            <MotiView
              key={n.id}
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 50, duration: 280 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  padding: 14,
                  marginBottom: 10,
                  borderRadius: 14,
                  backgroundColor: Colors.white,
                  borderWidth: 1,
                  borderColor: Colors.ink[100],
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: n.color + "20",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name={n.icon as any} size={20} color={n.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: Colors.ink[900],
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                    }}
                  >
                    {n.title}
                  </Text>
                  <Text
                    style={{
                      color: Colors.ink[500],
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      marginTop: 2,
                      lineHeight: 18,
                    }}
                  >
                    {n.body}
                  </Text>
                </View>
                <Text
                  style={{ color: Colors.ink[400], fontFamily: "Inter_400Regular", fontSize: 11 }}
                >
                  {n.when}
                </Text>
              </View>
            </MotiView>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
