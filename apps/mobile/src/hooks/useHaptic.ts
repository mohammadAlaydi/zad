import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export function useHaptic() {
  const light = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };
  const medium = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };
  const heavy = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  };
  const success = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };
  const selection = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
  };
  return { light, medium, heavy, success, selection };
}
