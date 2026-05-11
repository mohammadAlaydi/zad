import { View, Text, ScrollView, Linking, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { ListRow } from "@/components/ListRow";
import { Colors } from "@/theme/colors";

export default function About() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Screen bg={Colors.white}>
      <Header title={t("about.title")} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 8,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 320 }}
          style={{
            backgroundColor: Colors.white,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: Colors.ink[100],
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <ListRow
            icon={
              <Ionicons
                name="star-outline"
                size={18}
                color={Colors.brand.primary}
              />
            }
            title={t("about.rateUs")}
            divider={false}
            onPress={() => Linking.openURL("https://play.google.com/store").catch(() => Alert.alert("Error", "Could not open link"))}
          />
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
            marginBottom: 16,
          }}
        >
          <ListRow
            icon={
              <Ionicons
                name="newspaper-outline"
                size={18}
                color={Colors.brand.primary}
              />
            }
            title={t("about.blogs")}
            onPress={() => Linking.openURL("https://zadpay.com/blog").catch(() => Alert.alert("Error", "Could not open link"))}
          />
          <ListRow
            icon={
              <Ionicons
                name="logo-instagram"
                size={18}
                color={Colors.brand.primary}
              />
            }
            title={t("about.instagram")}
            onPress={() => Linking.openURL("https://instagram.com/zadpay").catch(() => Alert.alert("Error", "Could not open link"))}
          />
          <ListRow
            icon={
              <Ionicons
                name="logo-facebook"
                size={18}
                color={Colors.brand.primary}
              />
            }
            title={t("about.facebook")}
            divider={false}
            onPress={() => Linking.openURL("https://facebook.com/zadpay").catch(() => Alert.alert("Error", "Could not open link"))}
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200, duration: 320 }}
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
                name="code-slash-outline"
                size={18}
                color={Colors.brand.primary}
              />
            }
            title={t("about.openSource")}
            divider={false}
            onPress={() => Alert.alert("Open Source", "This app is built with open source software including React Native, Expo, and other libraries.")}
          />
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
