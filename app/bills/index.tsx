import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Colors } from "@/theme/colors";

const categories = [
  { key: "telecome", icon: "phone-portrait-outline", color: "#5B2C9C" },
  { key: "insurance", icon: "shield-checkmark-outline", color: "#1FCFA5" },
  { key: "tvInternet", icon: "tv-outline", color: "#E25563" },
  { key: "education", icon: "school-outline", color: "#F2B441" },
  { key: "electricity", icon: "flash-outline", color: "#5B2C9C" },
  { key: "water", icon: "water-outline", color: "#1FCFA5" },
  { key: "gas", icon: "flame-outline", color: "#E25563" },
  { key: "donation", icon: "heart-outline", color: "#F2B441" },
];

export default function Bills() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Screen bg={Colors.white}>
      <Header title="Pay with ZADPAY" />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t("bills.chooseCategory")}</Text>
        {categories.map((cat, i) => (
          <MotiView
            key={cat.key}
            from={{ opacity: 0, translateX: -10 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: i * 50, duration: 320 }}
          >
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/bills/operator",
                  params: { category: cat.key },
                })
              }
              style={styles.categoryRow}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: cat.color + "18" },
                ]}
              >
                <Ionicons name={cat.icon as any} size={20} color={cat.color} />
              </View>
              <Text style={styles.categoryName}>
                {t(`bills.${cat.key}` as any)}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.ink[400]}
              />
            </Pressable>
          </MotiView>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 18,
  },
  subtitle: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginBottom: 14,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.ink[100],
    marginBottom: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    color: Colors.ink[900],
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
});
