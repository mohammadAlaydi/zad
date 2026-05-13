import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useTranslation } from "react-i18next";
import { Text, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { ListRow } from "@/components/ListRow";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";

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
            backgroundColor: Colors.white,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: Colors.ink[100],
            overflow: "hidden",
          }}
        >
          <ListRow
            icon={<Ionicons name="document-text-outline" size={18} color={Colors.brand.primary} />}
            title={t("documents.consolidated")}
            subtitle="To help fill out your taxes"
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Consolidated statements will be available in a future update.",
              )
            }
          />
          <ListRow
            icon={<Ionicons name="person-outline" size={18} color={Colors.brand.primary} />}
            title={t("documents.personal")}
            onPress={() =>
              Alert.alert("Coming Soon", "Personal documents will be available in a future update.")
            }
          />
          <ListRow
            icon={<Ionicons name="file-tray-full-outline" size={18} color={Colors.brand.primary} />}
            title={t("documents.general")}
            divider={false}
            onPress={() =>
              Alert.alert("Coming Soon", "General documents will be available in a future update.")
            }
          />
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
