import { useRef, useState, useCallback } from "react";
import { View, Text, Pressable, Dimensions, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import PagerView from "react-native-pager-view";
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { FlagSelect } from "@/components/FlagSelect";
import { OnboardingTrust } from "@/illustrations/OnboardingTrust";
import { OnboardingSpend } from "@/illustrations/OnboardingSpend";
import { OnboardingReceive } from "@/illustrations/OnboardingReceive";
import { useApp } from "@/store/appStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/theme/colors";

const { width } = Dimensions.get("window");
const ILLUSTRATION_SIZE = width * 0.55;

export default function Onboarding() {
  const { t } = useTranslation();
  const { setOnboarded } = useApp();
  const pager = useRef<PagerView>(null);
  const [page, setPage] = useState(0);
  const insets = useSafeAreaInsets();

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

  const BOTTOM_BAR_HEIGHT = 56 + 12 + (insets.bottom + 24); // button + paddingTop + paddingBottom

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Top bar: Skip + Language dropdown */}
      <View style={styles.topBar}>
        <Pressable onPress={finish} hitSlop={14} style={styles.skipBtn}>
          <Text style={styles.skipText}>{t("common.skip")}</Text>
        </Pressable>
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
            <View key={i} style={[styles.slide, { paddingBottom: BOTTOM_BAR_HEIGHT }]}>
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
                      style={[
                        styles.dot,
                        isActive ? styles.dotActive : styles.dotInactive,
                      ]}
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

      {/* Bottom CTA — absolutely positioned so Android PagerView can't push it off-screen */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          onPress={next}
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
        >
          <Text style={styles.ctaText}>{slides[page].cta}</Text>
        </Pressable>
      </View>
    </View>
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
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 2,
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingTop: 12,
    backgroundColor: Colors.white,
  },
  ctaButton: {
    height: 56,
    borderRadius: 999,
    backgroundColor: Colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  ctaText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
