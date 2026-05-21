import "../global.css";
// Sentry must initialise before any feature module loads — keep this
// import at the top of the file.
import "@/lib/sentry/instrument";

import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Sora_700Bold } from "@expo-google-fonts/sora";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { bootstrapAuth } from "@/features/auth";
import { configureNotificationHandler, usePushNotifications } from "@/features/notifications";
import { queryClient } from "@/lib/api/queryClient";
import { ErrorBoundary } from "@/lib/error-boundary";
import "@/i18n";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Kick the auth bootstrap as early as possible — module-load time. The
// splash screen (index.tsx) waits for `authStore.bootstrapped` before
// routing, so we don't show /(auth)/welcome to a returning user just
// because the network is slow.
void bootstrapAuth();

// Tell expo-notifications to show alerts even when the app is in the
// foreground (the InstaPay-style banner-while-using-the-app behaviour).
configureNotificationHandler();

function PushBootstrap() {
  // Lives inside QueryClientProvider so the hook can invalidate caches.
  usePushNotifications();
  return null;
}

export default function RootLayout() {
  // All fonts (Inter, Sora, Ionicons, MaterialCommunityIcons, FontAwesome5)
  // are bundled natively at android/app/src/main/assets/fonts/ via the
  // expo-font config plugin. In a prebuilt APK, ReactFontManager registers
  // them at startup and ExpoFontLoader.customNativeFonts contains every
  // family name we use here — so `useFonts` resolves synchronously on the
  // first render (no async, no race, no asset-registry lookup). In Expo Go
  // (which can't see our bundled fonts) it still does a Metro fetch as
  // before. We don't block render on it either way.
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Sora_700Bold,
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    ...FontAwesome5.font,
  });

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PushBootstrap />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "fade",
                contentStyle: { backgroundColor: "#FFFFFF" },
              }}
            />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
