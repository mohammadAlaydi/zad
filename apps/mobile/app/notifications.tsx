import { Ionicons } from "@expo/vector-icons";
import type { InboxNotification } from "@zadpay/validation";
import { MotiView } from "moti";
import { View, Text, ScrollView, ActivityIndicator, Pressable, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useInbox, useMarkAllRead, useMarkNotificationRead } from "@/features/notifications";
import { Colors } from "@/theme/colors";

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

function iconForType(type: string): { name: string; color: string } {
  switch (type) {
    case "transfer.received":
      return { name: "arrow-down-circle", color: Colors.accent.green };
    case "transfer.sent":
      return { name: "paper-plane", color: Colors.brand.primary };
    case "topup":
      return { name: "add-circle", color: Colors.accent.green };
    case "withdrawal":
      return { name: "arrow-up-circle", color: Colors.accent.red };
    case "security.signin":
      return { name: "shield-checkmark", color: Colors.brand.primary };
    case "fraud.alert":
      return { name: "warning", color: Colors.accent.red };
    default:
      return { name: "notifications", color: Colors.ink[400] };
  }
}

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const inbox = useInbox();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  const items: readonly InboxNotification[] = inbox.data?.items ?? [];
  const unreadCount = inbox.data?.unreadCount ?? 0;
  const isLoading = inbox.isLoading;

  const handleTap = (n: InboxNotification) => {
    if (n.readAt === null) void markRead.mutate(n.id);
    // Deep-link handling could route based on n.data.kind here.
  };

  return (
    <Screen bg={Colors.white}>
      <Header
        title="Notifications"
        right={
          unreadCount > 0 ? (
            <Pressable
              onPress={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              style={({ pressed }) => ({
                paddingHorizontal: 10,
                paddingVertical: 6,
                opacity: pressed || markAllRead.isPending ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  color: Colors.brand.primary,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 12,
                }}
              >
                Mark all read
              </Text>
            </Pressable>
          ) : undefined
        }
      />
      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={Colors.brand.primary} />
        </View>
      ) : items.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
          }}
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
          refreshControl={
            <RefreshControl
              refreshing={inbox.isFetching && !inbox.isLoading}
              onRefresh={() => void inbox.refetch()}
              tintColor={Colors.brand.primary}
            />
          }
        >
          {items.map((n, i) => {
            const icon = iconForType(n.type);
            const unread = n.readAt === null;
            return (
              <MotiView
                key={n.id}
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: i * 30, duration: 280 }}
              >
                <Pressable
                  onPress={() => handleTap(n)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "flex-start",
                    padding: 14,
                    marginBottom: 10,
                    borderRadius: 14,
                    backgroundColor: unread ? Colors.brand.primary50 : Colors.white,
                    borderWidth: 1,
                    borderColor: unread ? Colors.brand.primary : Colors.ink[100],
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: icon.color + "20",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name={icon.name as any} size={20} color={icon.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text
                        style={{
                          color: Colors.ink[900],
                          fontFamily: unread ? "Inter_700Bold" : "Inter_600SemiBold",
                          fontSize: 14,
                          flex: 1,
                        }}
                      >
                        {n.title}
                      </Text>
                      {unread && (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: Colors.brand.primary,
                          }}
                        />
                      )}
                    </View>
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
                    style={{
                      color: Colors.ink[400],
                      fontFamily: "Inter_400Regular",
                      fontSize: 11,
                      marginLeft: 8,
                    }}
                  >
                    {formatWhen(n.createdAt)}
                  </Text>
                </Pressable>
              </MotiView>
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}
