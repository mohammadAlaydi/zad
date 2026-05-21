import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useTranslation } from "react-i18next";
import { Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";

// Documents (statements / tax forms) require backend infrastructure that
// isn't in place yet: object storage for the generated PDFs, plus a
// statement-generation job. Until that lands the screen shows an honest
// empty state instead of mock entries that won't open.
export default function Documents() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Screen bg={Colors.white}>
      <Header title={t("documents.title")} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 24,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 320 }}
        >
          <Text
            style={{
              color: Colors.brand.primary,
              fontFamily: "Sora_700Bold",
              fontSize: 22,
              lineHeight: 28,
              marginTop: 4,
              marginBottom: 18,
            }}
          >
            Documents &{"\n"}Statements
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100, duration: 320 }}
          style={{
            backgroundColor: Colors.surface.background,
            borderRadius: 18,
            paddingVertical: 36,
            paddingHorizontal: 24,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <Ionicons name="document-text-outline" size={44} color={Colors.ink[300]} />
          <Text
            style={{
              color: Colors.ink[900],
              fontFamily: "Inter_600SemiBold",
              fontSize: 15,
              marginTop: 14,
              marginBottom: 6,
              textAlign: "center",
            }}
          >
            No documents available yet
          </Text>
          <Text
            style={{
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              textAlign: "center",
              lineHeight: 19,
            }}
          >
            Monthly statements and tax documents will appear here once your account has activity to
            report.
          </Text>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
