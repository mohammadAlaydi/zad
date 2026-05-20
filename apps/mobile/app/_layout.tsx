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
import { useEffect, useState } from "react";
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
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Sora_700Bold,
    // Preload the @expo/vector-icons font families we actually use.
    // Without this, Ionicons / MaterialCommunityIcons / FontAwesome5
    // render as blank glyphs on the home screen and elsewhere because
    // their .ttf assets aren't registered with native Font before first
    // render in a prebuilt (non-Expo-Go) Android/iOS app.
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    ...FontAwesome5.font,
  });

  // Safety valve: never block the UI on fonts for more than 3s — if
  // anything goes sideways with the asset bundle the app still boots.
  const [fontTimeout, setFontTimeout] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFontTimeout(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const ready = loaded || error !== null || fontTimeout;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

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
