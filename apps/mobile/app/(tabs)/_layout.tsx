import { Tabs } from "expo-router";
import { BottomTabBar } from "@/components/BottomTabBar";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(p) => <BottomTabBar {...p} />}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="accounts" />
      <Tabs.Screen name="expenses" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
