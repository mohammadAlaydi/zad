import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

type Mode = "cashin" | "cashout";

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= full ? "star" : hasHalf && i === full + 1 ? "star-half" : "star-outline"}
          size={12}
          color="#F2B441"
        />
      ))}
      <Text style={starStyles.label}>{rating.toFixed(1)}</Text>
    </View>
  );
}

const starStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 2 },
  label: { color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 11, marginLeft: 3 },
});

export default function AgentScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { agents } = useApp();
  const [mode, setMode] = useState<Mode>("cashin");

  const handleSelectAgent = (agentId: string, agentName: string, floatLimit: number) => {
    router.push({
      pathname: "/agent/confirm",
      params: { agentId, agentName, mode, floatLimit: floatLimit.toString() },
    });
  };

  return (
    <Screen bg={Colors.white}>
      <Header title="Agent Cash Services" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Mode toggle */}
        <View style={styles.modeRow}>
          {(["cashin", "cashout"] as Mode[]).map((m) => {
            const active = m === mode;
            const label = m === "cashin" ? "Cash In" : "Cash Out";
            const icon: React.ComponentProps<typeof Ionicons>["name"] =
              m === "cashin" ? "arrow-down-circle" : "arrow-up-circle";
            return (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={[styles.modeBtn, active ? styles.modeBtnActive : null]}
              >
                <Ionicons
                  name={icon}
                  size={22}
                  color={active ? Colors.white : Colors.brand.primary}
                />
                <Text style={[styles.modeBtnText, active ? styles.modeBtnTextActive : null]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {mode === "cashin"
            ? "Deposit cash at a nearby agent"
            : "Withdraw cash from a nearby agent"}
        </Text>

        {/* Agent list */}
        {agents.map((agent, idx) => (
          <MotiView
            key={agent.id}
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: idx * 60, type: "timing", duration: 350 }}
          >
            <Pressable
              style={styles.agentCard}
              onPress={() => handleSelectAgent(agent.id, agent.name, agent.floatLimit)}
            >
              {/* Avatar */}
              <View style={styles.agentAvatar}>
                <Text style={styles.agentAvatarText}>{agent.name.charAt(0)}</Text>
              </View>

              <View style={styles.agentInfo}>
                <View style={styles.agentNameRow}>
                  <Text style={styles.agentName} numberOfLines={1}>{agent.name}</Text>
                  <View style={[styles.badge, agent.openNow ? styles.badgeOpen : styles.badgeClosed]}>
                    <Text style={[styles.badgeText, agent.openNow ? styles.badgeTextOpen : styles.badgeTextClosed]}>
                      {agent.openNow ? "Open" : "Closed"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.agentAddress} numberOfLines={1}>{agent.address}</Text>

                <View style={styles.agentMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={12} color={Colors.ink[400]} />
                    <Text style={styles.metaText}>{agent.distance}</Text>
                  </View>
                  <StarRating rating={agent.rating} />
                  <View style={styles.metaItem}>
                    <Ionicons name="wallet-outline" size={12} color={Colors.ink[400]} />
                    <Text style={styles.metaText}>
                      Up to ${agent.floatLimit.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={18} color={Colors.ink[300]} />
            </Pressable>
          </MotiView>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 18, paddingTop: 4 },
  modeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.white,
  },
  modeBtnActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  modeBtnText: {
    color: Colors.brand.primary,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  modeBtnTextActive: { color: Colors.white },
  subtitle: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginBottom: 18,
    textAlign: "center",
  },
  agentCard: {
    backgroundColor: Colors.surface.background,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  agentAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  agentAvatarText: {
    color: Colors.brand.primary,
    fontFamily: "Sora_700Bold",
    fontSize: 18,
  },
  agentInfo: { flex: 1, marginRight: 6 },
  agentNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  agentName: { color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14, flex: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeOpen: { backgroundColor: Colors.accent.greenSoft },
  badgeClosed: { backgroundColor: Colors.accent.redSoft },
  badgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  badgeTextOpen: { color: Colors.accent.green },
  badgeTextClosed: { color: Colors.accent.red },
  agentAddress: { color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12, marginBottom: 6 },
  agentMeta: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { color: Colors.ink[400], fontFamily: "Inter_400Regular", fontSize: 11 },
});
