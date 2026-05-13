import "../global.css";
// Sentry must initialise before any feature module loads — keep this
// import at the top of the file.
import "@/lib/sentry/instrument";

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
import { queryClient } from "@/lib/api/queryClient";
import { ErrorBoundary } from "@/lib/error-boundary";
import "@/i18n";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Kick the auth bootstrap as early as possible — module-load time. The
// splash screen (index.tsx) waits for `authStore.bootstrapped` before
// routing, so we don't show /(auth)/welcome to a returning user just
// because the network is slow.
void bootstrapAuth();

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Sora_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
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
