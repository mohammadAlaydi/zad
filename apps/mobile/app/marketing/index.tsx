import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";

type Campaign = {
  id: string;
  name: string;
  type: "push" | "email" | "sms";
  status: "active" | "paused" | "completed" | "draft";
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  startDate: string;
};

type Segment = {
  id: string;
  name: string;
  criteria: string;
  userCount: number;
  color: string;
};

const sampleCampaigns: Campaign[] = [
  {
    id: "c1",
    name: "Welcome Bonus",
    type: "push",
    status: "active",
    sent: 12500,
    opened: 8750,
    clicked: 3200,
    converted: 890,
    startDate: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: "c2",
    name: "Referral Boost",
    type: "email",
    status: "active",
    sent: 8200,
    opened: 4100,
    clicked: 1640,
    converted: 520,
    startDate: new Date(Date.now() - 1209600000).toISOString(),
  },
  {
    id: "c3",
    name: "Top-Up Reminder",
    type: "push",
    status: "completed",
    sent: 25000,
    opened: 18750,
    clicked: 6250,
    converted: 2100,
    startDate: new Date(Date.now() - 2592000000).toISOString(),
  },
  {
    id: "c4",
    name: "Holiday Promo",
    type: "sms",
    status: "draft",
    sent: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    startDate: new Date().toISOString(),
  },
  {
    id: "c5",
    name: "Re-engagement",
    type: "email",
    status: "paused",
    sent: 5600,
    opened: 1680,
    clicked: 504,
    converted: 168,
    startDate: new Date(Date.now() - 1814400000).toISOString(),
  },
];

const sampleSegments: Segment[] = [
  {
    id: "s1",
    name: "High Spenders",
    criteria: "Monthly spend > $500",
    userCount: 3420,
    color: Colors.brand.primary,
  },
  {
    id: "s2",
    name: "New Users (30d)",
    criteria: "Registered < 30 days ago",
    userCount: 8950,
    color: Colors.accent.green,
  },
  {
    id: "s3",
    name: "Inactive Users",
    criteria: "No activity in 60 days",
    userCount: 2180,
    color: Colors.accent.red,
  },
  {
    id: "s4",
    name: "Merchants",
    criteria: "Account type: merchant",
    userCount: 1250,
    color: Colors.accent.amber,
  },
  { id: "s5", name: "Young Adults", criteria: "Age 18-25", userCount: 15600, color: "#E040FB" },
];

const abTests = [
  {
    id: "ab1",
    name: "CTA Color Test",
    variant: "Green vs Purple",
    winner: "Green (+12%)",
    status: "completed",
  },
  {
    id: "ab2",
    name: "Subject Line A/B",
    variant: "Emoji vs No Emoji",
    winner: "Emoji (+8%)",
    status: "completed",
  },
  {
    id: "ab3",
    name: "Send Time Test",
    variant: "Morning vs Evening",
    winner: "In progress",
    status: "running",
  },
];

export default function MarketingDashboard() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"overview" | "campaigns" | "segments" | "ab">("overview");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const totalSent = sampleCampaigns.reduce((s, c) => s + c.sent, 0);
  const totalConverted = sampleCampaigns.reduce((s, c) => s + c.converted, 0);
  const avgOpenRate =
    sampleCampaigns.filter((c) => c.sent > 0).reduce((s, c) => s + (c.opened / c.sent) * 100, 0) /
    sampleCampaigns.filter((c) => c.sent > 0).length;

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="dark-content" />
      <Header title="Marketing" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Stats */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          {[
            {
              label: "Messages Sent",
              value: `${(totalSent / 1000).toFixed(1)}K`,
              icon: "mail",
              color: Colors.brand.primary,
            },
            {
              label: "Conversions",
              value: `${(totalConverted / 1000).toFixed(1)}K`,
              icon: "trending-up",
              color: Colors.accent.green,
            },
            {
              label: "Avg Open Rate",
              value: `${avgOpenRate.toFixed(0)}%`,
              icon: "eye",
              color: Colors.accent.amber,
            },
            {
              label: "Active Campaigns",
              value: sampleCampaigns.filter((c) => c.status === "active").length,
              icon: "megaphone",
              color: "#E040FB",
            },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {(["overview", "campaigns", "segments", "ab"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tabChip, tab === t && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === "ab" ? "A/B Tests" : t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Overview */}
        {tab === "overview" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Campaigns</Text>
            {sampleCampaigns.slice(0, 3).map((c) => (
              <Pressable
                key={c.id}
                onPress={() => {
                  setSelectedCampaign(c);
                }}
                style={styles.campaignRow}
              >
                <View
                  style={[
                    styles.typeIcon,
                    {
                      backgroundColor:
                        c.type === "push" ? "#E8F0FE" : c.type === "email" ? "#FFF3E0" : "#E8F5E9",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      c.type === "push" ? "notifications" : c.type === "email" ? "mail" : "chatbox"
                    }
                    size={18}
                    color={
                      c.type === "push"
                        ? Colors.brand.primary
                        : c.type === "email"
                          ? Colors.accent.amber
                          : Colors.accent.green
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.campaignName}>{c.name}</Text>
                  <Text style={styles.campaignMeta}>
                    {c.type} · {c.sent.toLocaleString()} sent
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        c.status === "active"
                          ? Colors.accent.greenSoft
                          : c.status === "completed"
                            ? Colors.ink[100]
                            : "#FFF3E0",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          c.status === "active"
                            ? Colors.accent.green
                            : c.status === "completed"
                              ? Colors.ink[600]
                              : Colors.accent.amber,
                      },
                    ]}
                  >
                    {c.status}
                  </Text>
                </View>
              </Pressable>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Top Segments</Text>
            {sampleSegments.slice(0, 3).map((s) => (
              <View key={s.id} style={styles.segRow}>
                <View style={[styles.segDot, { backgroundColor: s.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.segName}>{s.name}</Text>
                  <Text style={styles.segCriteria}>{s.criteria}</Text>
                </View>
                <Text style={styles.segCount}>{s.userCount.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Campaigns */}
        {tab === "campaigns" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Campaigns</Text>
            {sampleCampaigns.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setSelectedCampaign(c)}
                style={styles.campaignCard}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <View
                    style={[
                      styles.typeIcon,
                      {
                        backgroundColor:
                          c.type === "push"
                            ? "#E8F0FE"
                            : c.type === "email"
                              ? "#FFF3E0"
                              : "#E8F5E9",
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        c.type === "push"
                          ? "notifications"
                          : c.type === "email"
                            ? "mail"
                            : "chatbox"
                      }
                      size={18}
                      color={
                        c.type === "push"
                          ? Colors.brand.primary
                          : c.type === "email"
                            ? Colors.accent.amber
                            : Colors.accent.green
                      }
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.campaignName}>{c.name}</Text>
                    <Text style={styles.campaignMeta}>
                      {c.type} · Started {new Date(c.startDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          c.status === "active"
                            ? Colors.accent.greenSoft
                            : c.status === "completed"
                              ? Colors.ink[100]
                              : c.status === "draft"
                                ? "#E8F0FE"
                                : "#FFF3E0",
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>{c.status}</Text>
                  </View>
                </View>
                {c.sent > 0 && (
                  <View style={styles.metricsRow}>
                    <View style={styles.metric}>
                      <Text style={styles.metricVal}>{c.sent.toLocaleString()}</Text>
                      <Text style={styles.metricLbl}>Sent</Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={styles.metricVal}>
                        {((c.opened / c.sent) * 100).toFixed(0)}%
                      </Text>
                      <Text style={styles.metricLbl}>Opened</Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={styles.metricVal}>
                        {((c.clicked / c.sent) * 100).toFixed(0)}%
                      </Text>
                      <Text style={styles.metricLbl}>Clicked</Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={styles.metricVal}>{c.converted.toLocaleString()}</Text>
                      <Text style={styles.metricLbl}>Converted</Text>
                    </View>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Segments */}
        {tab === "segments" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Segments</Text>
            {sampleSegments.map((s) => (
              <View key={s.id} style={styles.segCard}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <View style={[styles.segColorBar, { backgroundColor: s.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.segName}>{s.name}</Text>
                    <Text style={styles.segCriteria}>{s.criteria}</Text>
                  </View>
                  <Text style={styles.segBigCount}>{s.userCount.toLocaleString()}</Text>
                </View>
                <View style={styles.segBar}>
                  <View
                    style={[
                      styles.segBarFill,
                      { width: `${(s.userCount / 20000) * 100}%`, backgroundColor: s.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* A/B Tests */}
        {tab === "ab" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>A/B Test Reports</Text>
            {abTests.map((test) => (
              <View key={test.id} style={styles.abCard}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Ionicons name="flask" size={20} color={Colors.brand.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.abName}>{test.name}</Text>
                    <Text style={styles.abVariant}>{test.variant}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          test.status === "running" ? Colors.accent.greenSoft : Colors.ink[100],
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>{test.status}</Text>
                  </View>
                </View>
                <View style={styles.abResult}>
                  <Ionicons
                    name={test.status === "completed" ? "trophy" : "timer"}
                    size={14}
                    color={test.status === "completed" ? Colors.accent.amber : Colors.ink[500]}
                  />
                  <Text style={styles.abWinner}>{test.winner}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: { paddingHorizontal: 18, gap: 10, paddingBottom: 4 },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    width: 120,
    shadowColor: "#101225",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statVal: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.ink[900], marginTop: 8 },
  statLbl: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.ink[500], marginTop: 2 },
  tabRow: { paddingHorizontal: 18, gap: 8, marginTop: 16, paddingBottom: 4 },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.ink[200],
  },
  tabActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  tabText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.ink[600] },
  tabTextActive: { color: Colors.white },
  section: { paddingHorizontal: 18, marginTop: 16 },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
    marginBottom: 12,
  },
  campaignRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  campaignCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10 },
  typeIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  campaignName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  campaignMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.ink[500],
    marginTop: 2,
    textTransform: "capitalize",
  },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: Colors.ink[600],
    textTransform: "capitalize",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.ink[50],
    borderRadius: 10,
    padding: 10,
  },
  metric: { alignItems: "center" },
  metricVal: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.ink[900] },
  metricLbl: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.ink[500], marginTop: 2 },
  segRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  segDot: { width: 10, height: 10, borderRadius: 5 },
  segName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  segCriteria: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.ink[500],
    marginTop: 2,
  },
  segCount: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.ink[900] },
  segCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10 },
  segColorBar: { width: 4, height: 32, borderRadius: 2, marginRight: 12 },
  segBigCount: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.ink[900] },
  segBar: { height: 6, borderRadius: 3, backgroundColor: Colors.ink[100], marginTop: 4 },
  segBarFill: { height: 6, borderRadius: 3 },
  abCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10 },
  abName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  abVariant: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], marginTop: 2 },
  abResult: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: Colors.ink[50],
    borderRadius: 8,
    padding: 8,
  },
  abWinner: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.ink[700] },
});
