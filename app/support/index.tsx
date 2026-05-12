import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";
import {
  useSupportStore,
  getBotReply,
  type ChatMessage,
  type SupportTicket,
} from "@/store/supportStore";
import { useApp } from "@/store/appStore";

export default function SupportChat() {
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const {
    tickets,
    activeTicketId,
    faqCategories,
    addTicket,
    addMessage,
    setActiveTicket,
  } = useSupportStore();

  const [input, setInput] = useState("");
  const [showFAQ, setShowFAQ] = useState(true);
  const flatRef = useRef<FlatList>(null);

  const activeTicket = tickets.find((t) => t.id === activeTicketId);

  /* Start a new ticket when user picks a FAQ category */
  const startTicket = (category: string) => {
    const id = `ticket-${Date.now()}`;
    const greeting: ChatMessage = {
      id: `m-${Date.now()}`,
      text: `Hi ${user.fullName.split(" ")[0]}! Welcome to ZADPay support.`,
      sender: "bot",
      timestamp: new Date().toISOString(),
    };
    const reply: ChatMessage = {
      id: `m-${Date.now() + 1}`,
      text: getBotReply(category),
      sender: "bot",
      timestamp: new Date().toISOString(),
    };
    const ticket: SupportTicket = {
      id,
      subject: category,
      status: "open",
      messages: [greeting, reply],
      createdAt: new Date().toISOString(),
      category,
    };
    addTicket(ticket);
    setActiveTicket(id);
    setShowFAQ(false);
  };

  /* Send a user message */
  const send = () => {
    if (!input.trim() || !activeTicketId) return;
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      text: input.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    addMessage(activeTicketId, msg);
    setInput("");

    /* Simulate bot reply */
    setTimeout(() => {
      const auto: ChatMessage = {
        id: `m-${Date.now()}`,
        text: "Thank you for the information. Let me look into this for you. If you'd like to speak with a live agent, tap the escalate button above.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      addMessage(activeTicketId, auto);
    }, 1200);
  };

  useEffect(() => {
    if (activeTicket?.messages.length) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 200);
    }
  }, [activeTicket?.messages.length]);

  /* ─── FAQ selection view ─── */
  if (showFAQ && !activeTicket) {
    return (
      <Screen bg={Colors.surface.background}>
        <StatusBar barStyle="dark-content" />
        <Header title="Support" />
        <View style={styles.faqContainer}>
          <View style={styles.faqGreeting}>
            <Ionicons name="chatbubbles" size={48} color={Colors.brand.primary} />
            <Text style={styles.faqTitle}>
              Hi {user.fullName.split(" ")[0]},{"\n"}how can we help you?
            </Text>
            <Text style={styles.faqSub}>Choose a topic to get started</Text>
          </View>
          {/* FAQ grid — 3 per row */}
          {[0, 3].map((rowStart) => (
            <View key={rowStart} style={styles.faqRow}>
              {faqCategories.slice(rowStart, rowStart + 3).map((cat) => (
                <Pressable
                  key={cat.key}
                  onPress={() => startTicket(cat.key)}
                  style={({ pressed }) => [
                    styles.faqTile,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={styles.faqIcon}>
                    <Ionicons
                      name={cat.icon as any}
                      size={22}
                      color={Colors.brand.primary}
                    />
                  </View>
                  <Text style={styles.faqLabel}>{cat.label}</Text>
                </Pressable>
              ))}
            </View>
          ))}

          {/* Previous tickets */}
          {tickets.length > 0 && (
            <View style={styles.prevSection}>
              <Text style={styles.prevTitle}>Previous Conversations</Text>
              {tickets.slice(0, 3).map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => {
                    setActiveTicket(t.id);
                    setShowFAQ(false);
                  }}
                  style={styles.prevRow}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.prevSubject}>
                      {t.category.charAt(0).toUpperCase() + t.category.slice(1)}
                    </Text>
                    <Text style={styles.prevDate}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      t.status === "resolved"
                        ? styles.badgeResolved
                        : t.status === "escalated"
                        ? styles.badgeEscalated
                        : styles.badgeOpen,
                    ]}
                  >
                    <Text style={styles.statusText}>{t.status}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Screen>
    );
  }

  /* ─── Chat view ─── */
  const messages = activeTicket?.messages ?? [];
  const isEscalated = activeTicket?.status === "escalated";

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="dark-content" />
      <Header
        title={isEscalated ? "Live Agent" : "Support Chat"}
        onBack={() => {
          setActiveTicket(null);
          setShowFAQ(true);
        }}
        right={
          !isEscalated ? (
            <Pressable
              onPress={() => {
                if (activeTicketId) {
                  useSupportStore.getState().escalateTicket(activeTicketId);
                  const agentMsg: ChatMessage = {
                    id: `m-${Date.now()}`,
                    text: "You've been connected to a live agent. Please hold while we connect you — an agent will respond shortly.",
                    sender: "agent",
                    timestamp: new Date().toISOString(),
                  };
                  addMessage(activeTicketId, agentMsg);
                }
              }}
              style={styles.escalateBtn}
            >
              <Ionicons name="person" size={14} color={Colors.white} />
              <Text style={styles.escalateTxt}>Agent</Text>
            </Pressable>
          ) : undefined
        }
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={10}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          renderItem={({ item }) => {
            const isUser = item.sender === "user";
            const isAgent = item.sender === "agent";
            return (
              <View
                style={[
                  styles.bubble,
                  isUser
                    ? styles.bubbleUser
                    : isAgent
                    ? styles.bubbleAgent
                    : styles.bubbleBot,
                ]}
              >
                {isAgent && (
                  <Text style={styles.agentLabel}>Live Agent</Text>
                )}
                <Text
                  style={[
                    styles.bubbleText,
                    isUser && { color: Colors.white },
                  ]}
                >
                  {item.text}
                </Text>
                <Text
                  style={[
                    styles.timeText,
                    isUser && { color: "rgba(255,255,255,0.6)" },
                  ]}
                >
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            );
          }}
        />
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor={Colors.ink[400]}
            style={styles.textInput}
            multiline
          />
          <Pressable
            onPress={send}
            style={[
              styles.sendBtn,
              !input.trim() && { opacity: 0.4 },
            ]}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={18} color={Colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  /* FAQ */
  faqContainer: { flex: 1, paddingHorizontal: 18 },
  faqGreeting: { alignItems: "center", marginTop: 20, marginBottom: 28 },
  faqTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.ink[900],
    textAlign: "center",
    marginTop: 14,
    lineHeight: 28,
  },
  faqSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.ink[500],
    marginTop: 6,
  },
  faqGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  faqTile: {
    width: "31%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: 100,
    shadowColor: "#101225",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  faqIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  faqLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.ink[800],
    textAlign: "center",
    lineHeight: 15,
  },
  /* Previous tickets */
  prevSection: { marginTop: 20 },
  prevTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[900],
    marginBottom: 10,
  },
  prevRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  prevSubject: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.ink[800],
  },
  prevDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.ink[400],
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeOpen: { backgroundColor: Colors.accent.greenSoft },
  badgeEscalated: { backgroundColor: "#FFF3E0" },
  badgeResolved: { backgroundColor: Colors.ink[100] },
  statusText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: Colors.ink[700],
    textTransform: "capitalize",
  },
  /* Chat */
  bubble: {
    maxWidth: "80%",
    borderRadius: 18,
    padding: 12,
    marginBottom: 8,
  },
  bubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: Colors.brand.primary,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    alignSelf: "flex-start",
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
  },
  bubbleAgent: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9",
    borderBottomLeftRadius: 4,
  },
  agentLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: Colors.accent.green,
    marginBottom: 4,
  },
  bubbleText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.ink[800],
    lineHeight: 20,
  },
  timeText: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: Colors.ink[400],
    marginTop: 4,
    textAlign: "right",
  },
  /* Input */
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.ink[100],
    backgroundColor: Colors.white,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.ink[50],
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.ink[900],
    maxHeight: 100,
    marginRight: 10,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  escalateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accent.green,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  escalateTxt: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.white,
  },
});
