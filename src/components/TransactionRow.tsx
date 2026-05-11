import { View, Text } from "react-native";
import { Avatar } from "./Avatar";
import { Colors } from "@/theme/colors";
import type { Transaction } from "@/store/appStore";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dateTimeLabel(date: string) {
  const d = new Date(date);
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day},${month} · ${hours}:${minutes} ${ampm}`;
}

function formatAmount(amount: number): string {
  const abs = Math.abs(amount);
  const whole = Math.floor(abs);
  const decimal = Math.round((abs - whole) * 100).toString().padStart(2, "0");
  return `${whole.toLocaleString("en-US")},${decimal}`;
}

export function TransactionRow({ tx }: { tx: Transaction }) {
  const isIncoming = tx.amount > 0;
  const sign = isIncoming ? "+" : "−";
  const color = isIncoming ? Colors.accent.green : Colors.accent.red;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: Colors.white,
        borderRadius: 16,
        marginBottom: 10,
        shadowColor: "#101225",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,
      }}
    >
      <Avatar name={tx.name} size={42} />
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 }} numberOfLines={1}>
          {tx.name}
        </Text>
        <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12 }} numberOfLines={1}>
          {tx.category}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ color, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
          {sign}$ {formatAmount(tx.amount)}
        </Text>
        <Text style={{ color: Colors.ink[400], fontFamily: "Inter_400Regular", fontSize: 11 }}>
          {dateTimeLabel(tx.date)}
        </Text>
      </View>
    </View>
  );
}
