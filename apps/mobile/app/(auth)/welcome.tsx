import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { FlagSelect } from "@/components/FlagSelect";
import { Header } from "@/components/Header";
import { WelcomeIllustration } from "@/illustrations/WelcomeIllustration";
import { Colors } from "@/theme/colors";

export default function Welcome() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Screen scroll>
      <Header showBack={false} right={<FlagSelect />} />

      {/* Illustration */}
      <View style={s.illustrationWrap}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={s.illustrationInner}
        >
          <WelcomeIllustration size={220} />
        </MotiView>

        {/* Title + subtitle */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 120, duration: 500 }}
          style={s.titleWrap}
        >
          <Text style={s.title}>{t("auth.createTitle")}</Text>
          <Text style={s.subtitle}>{t("auth.createSubtitle")}</Text>
        </MotiView>
      </View>

      {/* Buttons section */}
      <View style={[s.bottomSection, { paddingBottom: insets.bottom + 18 }]}>
        {/* Sign Up */}
        <Button
          title={t("auth.signUp")}
          onPress={() => router.push("/(auth)/signup")}
        />

        {/* Log In */}
        <Button
          title={t("auth.logIn")}
          variant="secondary"
          onPress={() => router.push("/(auth)/login")}
        />

        {/* Divider */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>{t("auth.continueWith")}</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Social buttons */}
        <View style={s.socialRow}>
          <Pressable
            onPress={() => router.replace("/(tabs)/home")}
            style={s.socialBtn}
          >
            <Ionicons name="logo-google" size={18} color="#DB4437" />
            <Text style={s.socialText}>{t("auth.google")}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace("/(tabs)/home")}
            style={s.socialBtn}
          >
            <Ionicons name="logo-apple" size={20} color={Colors.ink[900]} />
            <Text style={s.socialText}>{t("auth.apple")}</Text>
          </Pressable>
        </View>

        {/* Terms */}
        <Text style={s.termsText}>
          {t("auth.termsHint")}{" "}
          <Text style={s.termsLink}>{t("auth.terms")}</Text>{" "}
          {t("auth.and")}{" "}
          <Text style={s.termsLink}>{t("auth.privacy")}</Text>
        </Text>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  illustrationWrap: {
    alignItems: "center",
    paddingHorizontal: 28,
  },
  illustrationInner: {
    marginTop: 18,
  },
  titleWrap: {
    alignItems: "center",
    marginTop: 26,
  },
  title: {
    color: Colors.ink[900],
    fontFamily: "Sora_700Bold",
    fontSize: 22,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 12,
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 320,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
    gap: 12,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.ink[200],
  },
  dividerText: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  socialRow: {
    flexDirection: "row",
    gap: 10,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.ink[200],
    backgroundColor: Colors.white,
  },
  socialText: {
    color: Colors.ink[800],
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  termsText: {
    textAlign: "center",
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 8,
  },
  termsLink: {
    color: Colors.brand.primary,
    fontFamily: "Inter_500Medium",
  },
});
