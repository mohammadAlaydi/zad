import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MotiView } from "moti";
import { useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import PagerView from "react-native-pager-view";
import { Easing } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { FlagSelect } from "@/components/FlagSelect";
import { OnboardingReceive } from "@/illustrations/OnboardingReceive";
import { OnboardingSpend } from "@/illustrations/OnboardingSpend";
import { OnboardingTrust } from "@/illustrations/OnboardingTrust";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

const { width } = Dimensions.get("window");
const ILLUSTRATION_SIZE = width * 0.55;

export default function Onboarding() {
  const { t } = useTranslation();
  const { setOnboarded } = useApp();
  const pager = useRef<PagerView>(null);
  const [page, setPage] = useState(0);

  const slides = [
    {
      Illu: OnboardingTrust,
      title: t("onboarding.slide1Title"),
      cta: t("common.next"),
    },
    {
      Illu: OnboardingSpend,
      title: t("onboarding.slide2Title"),
      cta: t("common.next"),
    },
    {
      Illu: OnboardingReceive,
      title: t("onboarding.slide3Title"),
      cta: t("onboarding.start"),
    },
  ];

  const finish = useCallback(() => {
    setOnboarded(true);
    router.replace("/(auth)/welcome");
  }, []);

  const next = useCallback(() => {
    if (page < 2) pager.current?.setPage(page + 1);
    else finish();
  }, [page, finish]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top bar: Skip + Language dropdown */}
      <View style={styles.topBar}>
        <Text onPress={finish} style={styles.skipText}>
          {t("common.skip")}
        </Text>
        <FlagSelect />
      </View>

      {/* Pager — wrapped in a flex:1 View so PagerView fills it properly on Android */}
      <View style={styles.pagerWrap}>
        <PagerView
          ref={pager}
          style={styles.pager}
          initialPage={0}
          onPageSelected={(e) => setPage(e.nativeEvent.position)}
        >
          {slides.map((s, i) => (
            <View key={i} style={styles.slide}>
              {/* Illustration */}
              <MotiView
                from={{ opacity: 0, translateY: 24 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: "timing",
                  duration: 600,
                  easing: Easing.out(Easing.cubic),
                }}
                style={styles.illuWrap}
              >
                <s.Illu size={ILLUSTRATION_SIZE} />
              </MotiView>

              {/* Progress dots */}
              <View style={styles.dotsRow}>
                {[0, 1, 2].map((dotIdx) => {
                  const isActive = dotIdx === i;
                  return (
                    <View
                      key={dotIdx}
                      style={[styles.dot, isActive ? styles.dotActive : styles.dotInactive]}
                    />
                  );
                })}
              </View>

              {/* Title text */}
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  delay: 150,
                  duration: 500,
                  easing: Easing.out(Easing.cubic),
                }}
                style={styles.titleWrap}
              >
                <Text style={styles.titleText}>{s.title}</Text>
              </MotiView>
            </View>
          ))}
        </PagerView>
      </View>

      {/* Bottom CTA — sits naturally at the bottom of the screen */}
      <View style={styles.bottomBar}>
        <Button onPress={next} title={slides[page].cta} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipText: {
    color: Colors.brand.primary,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    letterSpacing: 0.1,
  },
  pagerWrap: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  illuWrap: {
    marginBottom: 32,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.brand.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.ink[200],
  },
  titleWrap: {
    maxWidth: width * 0.78,
  },
  titleText: {
    textAlign: "center",
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    lineHeight: 30,
    letterSpacing: 0.1,
  },
  bottomBar: {
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: Colors.white,
  },
});
