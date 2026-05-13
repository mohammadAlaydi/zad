import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Sender = "bot" | "user" | "agent";

type Message = {
  id: string;
  text: string;
  sender: Sender;
  agentName?: string;
};

// ─── Canned responses ──────────────────────────────────────────────────────────
function getBotReply(text: string, balance: number): string {
  const lower = text.toLowerCase();
  if (lower.includes("balance")) {
    return `Your current wallet balance is $${balance.toFixed(2)}. Is there anything else I can help you with?`;
  }
  if (lower.includes("transfer") || lower.includes("send")) {
    return "To send money, go to the Send Money screen from your home page. You can send to any ZADPay user by phone or email.";
  }
  if (lower.includes("agent") || lower.includes("human") || lower.includes("person")) {
    return "Connecting you to a live agent...";
  }
  if (lower.includes("issue") || lower.includes("problem") || lower.includes("report")) {
    return "I'm sorry to hear that. Could you describe the issue in more detail? I'll do my best to assist or escalate it to our team.";
  }
  return "Thank you for your message! I'm looking into that for you. If I can't help, I can connect you to a live agent.";
}

// ─── Seed messages ─────────────────────────────────────────────────────────────
const SEED_MESSAGES: Message[] = [
  { id: "seed-1", text: "Hello! I'm ZADPay Assistant 👋", sender: "bot" },
  { id: "seed-2", text: "How can I help you today?", sender: "bot" },
];

const QUICK_REPLIES = ["Check Balance", "Report Issue", "Transfer Help", "Talk to Agent"];

// ─── Bubble component ──────────────────────────────────────────────────────────
function Bubble({ msg, index }: { msg: Message; index: number }) {
  const isUser = msg.sender === "user";
  const isAgent = msg.sender === "agent";

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 280, delay: 0 }}
      style={[styles.bubbleRow, isUser ? styles.bubbleRowRight : styles.bubbleRowLeft]}
    >
      {!isUser && (
        <View style={[styles.avatar, isAgent ? styles.avatarAgent : styles.avatarBot]}>
          <Text style={styles.avatarText}>{isAgent ? "S" : "Z"}</Text>
        </View>
      )}
      <View style={styles.bubbleColumn}>
        {isAgent && <Text style={styles.agentName}>{msg.agentName ?? "Support Agent (Sara)"}</Text>}
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : isAgent ? styles.bubbleAgent : styles.bubbleBot,
          ]}
        >
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{msg.text}</Text>
        </View>
      </View>
    </MotiView>
  );
}

// ─── Quick reply chip ──────────────────────────────────────────────────────────
function QuickChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
    >
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const { balances, activeCurrency } = useApp();
  const balance = balances?.[activeCurrency] ?? 0;

  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [input, setInput] = useState("");
  const [showChips, setShowChips] = useState(true);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length]);

  function addMessage(msg: Message) {
    setMessages((prev) => [...prev, msg]);
  }

  function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content) return;
    setInput("");
    setShowChips(false);

    const userMsg: Message = { id: `u-${Date.now()}`, text: content, sender: "user" };
    addMessage(userMsg);

    const replyText = getBotReply(content, balance);
    const isAgentTrigger = replyText === "Connecting you to a live agent...";

    setTimeout(() => {
      addMessage({ id: `b-${Date.now()}`, text: replyText, sender: "bot" });

      if (isAgentTrigger) {
        setTimeout(() => {
          setIsAgentMode(true);
          addMessage({
            id: `ag-${Date.now()}`,
            text: "Hi there! This is Sara from ZADPay support. How can I assist you today?",
            sender: "agent",
            agentName: "Support Agent (Sara)",
          });
        }, 2000);
      }
    }, 1000);
  }

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Support"
        right={
          isAgentMode ? (
            <View style={styles.agentBadge}>
              <View style={styles.agentDot} />
              <Text style={styles.agentBadgeText}>Sara</Text>
            </View>
          ) : undefined
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.bottom + 8}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, i) => (
            <Bubble key={msg.id} msg={msg} index={i} />
          ))}

          {showChips && (
            <MotiView
              from={{ opacity: 0, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 300, delay: 300 }}
              style={styles.chipsRow}
            >
              {QUICK_REPLIES.map((label) => (
                <QuickChip key={label} label={label} onPress={() => handleSend(label)} />
              ))}
            </MotiView>
          )}
        </ScrollView>

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.ink[400]}
            style={styles.textInput}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
          />
          <Pressable
            onPress={() => handleSend()}
            disabled={!input.trim()}
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          >
            <Ionicons name="send" size={18} color={Colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 6,
  },
  /* Bubble rows */
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 4,
  },
  bubbleRowLeft: {
    alignSelf: "flex-start",
    maxWidth: "85%",
  },
  bubbleRowRight: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
    maxWidth: "75%",
  },
  bubbleColumn: {
    flexShrink: 1,
  },
  /* Avatars */
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarBot: {
    backgroundColor: Colors.brand.primary,
  },
  avatarAgent: {
    backgroundColor: Colors.accent.green,
  },
  avatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: Colors.white,
  },
  agentName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: Colors.accent.green,
    marginBottom: 3,
    marginLeft: 2,
  },
  /* Bubbles */
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: Colors.brand.primary,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: Colors.ink[900],
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  bubbleAgent: {
    backgroundColor: Colors.accent.greenSoft,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.ink[800],
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: Colors.white,
  },
  /* Quick reply chips */
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    marginLeft: 40,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.brand.primary,
  },
  chipPressed: {
    backgroundColor: Colors.brand.primary50,
  },
  chipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.brand.primary,
  },
  /* Input bar */
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    gap: 10,
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
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  /* Agent mode badge in header */
  agentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.accent.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  agentDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.accent.green,
  },
  agentBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.accent.green,
  },
});
