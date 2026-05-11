import { View, Text } from "react-native";
import { Avatar } from "./Avatar";
import { Colors } from "@/theme/colors";
import type { Transaction } from "@/store/appStore";

function timeLabel(date: string) {
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function TransactionRow({ tx }: { tx: Transaction }) {
  const isIncoming = tx.amount > 0;
  const sign = isIncoming ? "+" : "-";
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
          {sign} ${Math.abs(tx.amount).toFixed(2)}
        </Text>
        <Text style={{ color: Colors.ink[400], fontFamily: "Inter_400Regular", fontSize: 11 }}>{timeLabel(tx.date)}</Text>
      </View>
    </View>
  );
}
