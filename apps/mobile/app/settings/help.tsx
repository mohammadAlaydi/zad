import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { ListRow } from "@/components/ListRow";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

export default function Help() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const [q, setQ] = useState("");
  const firstName = (user.fullName ?? "").split(" ")[0];

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
            {`Hi ${firstName || "there"} ,\nhow can we help ?`}
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
            rightIcon={
              <Ionicons name="search" size={18} color={Colors.ink[400]} />
            }
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 160, duration: 320 }}
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
          <ListRow
            icon={
              <Ionicons
                name="card-outline"
                size={18}
                color={Colors.brand.primary}
              />
            }
            title="Dispute transactions"
            onPress={() => Alert.alert("Dispute Transaction", "To dispute a transaction, select it from your history and tap 'Report an issue'.")}
          />
          <ListRow
            icon={<Ionicons name="close-circle-outline" size={18} color={Colors.brand.primary} />}
            title={t("help.cancel")}
            onPress={() => Alert.alert("Cancel Transfer", "To cancel a transfer, go to your transaction history and select the pending transfer.")}
          />
          <ListRow
            icon={<Ionicons name="swap-horizontal-outline" size={18} color={Colors.brand.primary} />}
            title="Refund request"
            onPress={() => Alert.alert("Refund Request", "Refund requests are processed within 3-5 business days.")}
          />
          <ListRow
            icon={<Ionicons name="help-circle-outline" size={18} color={Colors.brand.primary} />}
            title="Account issues"
            divider={false}
            onPress={() => Alert.alert("Account Issues", "For account issues, please contact our support team.")}
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 240, duration: 320 }}
          style={{
            backgroundColor: Colors.white,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: Colors.ink[100],
            overflow: "hidden",
          }}
        >
          <ListRow
            icon={
              <Ionicons
                name="headset-outline"
                size={18}
                color={Colors.brand.primary}
              />
            }
            title={t("help.support")}
            divider={false}
            onPress={() => Alert.alert("Support", "Contact us at support@zadpay.com or call +1-800-ZADPAY")}
          />
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
