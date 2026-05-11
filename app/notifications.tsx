import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Colors } from "@/theme/colors";

const items = [
  {
    id: "n1",
    title: "Payment received",
    body: "Ali Mohamed sent you $6.00",
    icon: "arrow-down",
    color: Colors.accent.green,
    when: "10:30 AM",
  },
  {
    id: "n2",
    title: "Bill paid",
    body: "Internet bill of $1.00 was processed",
    icon: "receipt",
    color: Colors.brand.primary,
    when: "Yesterday",
  },
  {
    id: "n3",
    title: "Security check",
    body: "New device signed in from Erbil, IQ",
    icon: "shield-checkmark",
    color: "#F2B441",
    when: "2 days ago",
  },
  {
    id: "n4",
    title: "Welcome bonus",
    body: "You earned a $5 sign-up bonus 🎉",
    icon: "gift",
    color: Colors.accent.green,
    when: "Last week",
  },
];

export default function Notifications() {
  const insets = useSafeAreaInsets();

  return (
    <Screen bg={Colors.white}>
      <Header
        title="Notifications"
        right={
          <Pressable hitSlop={6}>
            <Ionicons name="checkmark-done" size={20} color={Colors.brand.primary} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 24 }}>
        {items.map((n, i) => (
          <MotiView
            key={n.id}
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: i * 70, duration: 320 }}
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
                <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 }}>{n.title}</Text>
                <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2, lineHeight: 18 }}>
                  {n.body}
                </Text>
              </View>
              <Text style={{ color: Colors.ink[400], fontFamily: "Inter_400Regular", fontSize: 11 }}>{n.when}</Text>
            </View>
          </MotiView>
        ))}
      </ScrollView>
    </Screen>
  );
}
