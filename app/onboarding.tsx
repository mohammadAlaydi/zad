import { useRef, useState } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import PagerView from "react-native-pager-view";
import { MotiView } from "moti";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { ProgressDots } from "@/components/ProgressDots";
import { FlagSelect } from "@/components/FlagSelect";
import { OnboardingTrust } from "@/illustrations/OnboardingTrust";
import { OnboardingSpend } from "@/illustrations/OnboardingSpend";
import { OnboardingReceive } from "@/illustrations/OnboardingReceive";
import { useApp } from "@/store/appStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/theme/colors";

const { width } = Dimensions.get("window");

export default function Onboarding() {
  const { t } = useTranslation();
  const { setOnboarded } = useApp();
  const pager = useRef<PagerView>(null);
  const [page, setPage] = useState(0);
  const insets = useSafeAreaInsets();

  const slides = [
    { Illu: OnboardingTrust, title: t("onboarding.slide1Title"), cta: t("common.next") },
    { Illu: OnboardingSpend, title: t("onboarding.slide2Title"), cta: t("common.next") },
    { Illu: OnboardingReceive, title: t("onboarding.slide3Title"), cta: t("onboarding.start") },
  ];

  const next = () => {
    if (page < 2) pager.current?.setPage(page + 1);
    else finish();
  };
  const finish = () => {
    setOnboarded(true);
    router.replace("/(auth)/welcome");
  };

  return (
    <Screen>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Pressable onPress={finish} hitSlop={10}>
          <Text style={{ color: Colors.ink[500], fontFamily: "Inter_500Medium", fontSize: 14 }}>{t("common.skip")}</Text>
        </Pressable>
        <FlagSelect />
      </View>
      <PagerView
        ref={pager}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {slides.map((s, i) => (
          <View key={i} style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 }}>
            <MotiView
              from={{ opacity: 0, translateY: 24 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 600 }}
              style={{ marginBottom: 60 }}
            >
              <s.Illu size={width * 0.6} />
            </MotiView>
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 120, duration: 500 }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: Colors.ink[900],
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 19,
                  lineHeight: 28,
                  maxWidth: width * 0.78,
                }}
              >
                {s.title}
              </Text>
            </MotiView>
          </View>
        ))}
      </PagerView>
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
        <View style={{ marginBottom: 24 }}>
          <ProgressDots count={3} index={page} />
        </View>
        <Button title={slides[page].cta} onPress={next} />
      </View>
    </Screen>
  );
}
