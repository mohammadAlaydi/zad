import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { useAuthSession } from "@/features/auth";
import { Colors } from "@/theme/colors";

interface FaqEntry {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  body: string;
}

// FAQ content is static help text — not user data. Lives in code rather
// than the backend because it doesn't vary per user and the support team
// owns the wording. To update copy, edit this array and ship.
const FAQS: FaqEntry[] = [
  {
    id: "dispute",
    icon: "card-outline",
    title: "Dispute a transaction",
    body: "Open the transaction from your history and tap 'Report an issue'. Our team reviews disputes within 3-5 business days and emails you the outcome.",
  },
  {
    id: "cancel",
    icon: "close-circle-outline",
    title: "Cancel a pending transfer",
    body: "Transfers settle instantly once the recipient is on ZADPay, so they can't be cancelled. For scheduled or pending payments, open the item and tap 'Cancel'.",
  },
  {
    id: "refund",
    icon: "swap-horizontal-outline",
    title: "Request a refund",
    body: "If the recipient agrees, they can send the money back from their side. If you paid a merchant, contact the merchant first. We can only escalate disputes when both parties refuse to resolve.",
  },
  {
    id: "account",
    icon: "help-circle-outline",
    title: "Account access issues",
    body: "If you can't sign in: try resetting your password from the login screen. If your account is locked, contact support with your registered email so we can verify and unlock.",
  },
];

const SUPPORT_EMAIL = "support@zadpay.com";

export default function Help() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { session } = useAuthSession();
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const firstName = (session?.user.fullName ?? "").split(" ")[0] ?? "";

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query === "") return FAQS;
    return FAQS.filter(
      (f) => f.title.toLowerCase().includes(query) || f.body.toLowerCase().includes(query),
    );
  }, [q]);

  return (
    <Screen bg={Colors.white} keyboard>
      <Header title={t("help.title")} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <MotiView
          from={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 320 }}
        >
          <Text
            style={{
              color: Colors.ink[900],
              fontFamily: "Sora_700Bold",
              fontSize: 22,
              lineHeight: 30,
              marginTop: 4,
              marginBottom: 16,
            }}
          >
            {`Hi ${firstName || "there"},\nhow can we help?`}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 80, duration: 320 }}
        >
          <Input
            placeholder={t("help.askPlaceholder")}
            value={q}
            onChangeText={setQ}
            rightIcon={<Ionicons name="search" size={18} color={Colors.ink[400]} />}
          />
        </MotiView>

        <View
          style={{
            backgroundColor: Colors.white,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: Colors.ink[100],
            overflow: "hidden",
            marginTop: 4,
            marginBottom: 16,
          }}
        >
          {filtered.length === 0 ? (
            <Text
              style={{
                color: Colors.ink[500],
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                textAlign: "center",
                paddingVertical: 32,
              }}
            >
              No answers match "{q}". Try a different search or contact support below.
            </Text>
          ) : (
            filtered.map((faq, i) => {
              const isOpen = openId === faq.id;
              return (
                <Pressable
                  key={faq.id}
                  onPress={() => setOpenId(isOpen ? null : faq.id)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: i < filtered.length - 1 ? 1 : 0,
                    borderBottomColor: Colors.ink[100],
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        backgroundColor: Colors.brand.primary50,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name={faq.icon} size={18} color={Colors.brand.primary} />
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        color: Colors.ink[900],
                        fontFamily: "Inter_500Medium",
                        fontSize: 14,
                      }}
                    >
                      {faq.title}
                    </Text>
                    <Ionicons
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={Colors.ink[400]}
                    />
                  </View>
                  {isOpen && (
                    <MotiView
                      from={{ opacity: 0, translateY: -4 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ duration: 200 }}
                      style={{ marginTop: 10, marginLeft: 44, marginRight: 4 }}
                    >
                      <Text
                        style={{
                          color: Colors.ink[600],
                          fontFamily: "Inter_400Regular",
                          fontSize: 13,
                          lineHeight: 20,
                        }}
                      >
                        {faq.body}
                      </Text>
                    </MotiView>
                  )}
                </Pressable>
              );
            })
          )}
        </View>

        <View
          style={{
            backgroundColor: Colors.white,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: Colors.ink[100],
            overflow: "hidden",
          }}
        >
          <Pressable
            onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                backgroundColor: Colors.brand.primary50,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons name="mail-outline" size={18} color={Colors.brand.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: Colors.ink[900],
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                }}
              >
                Email support
              </Text>
              <Text
                style={{
                  color: Colors.ink[500],
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {SUPPORT_EMAIL}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.ink[300]} />
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
