import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { ListRow } from "@/components/ListRow";
import { Screen } from "@/components/Screen";
import { useDeleteUserItem, useUserItems } from "@/features/userdata";
import { Colors } from "@/theme/colors";

// Connected apps are persisted as OAuth grants under feature="oauth_grants".
// The grant is created server-side when the user authorises a third-party
// app. There's no OAuth server yet, so the list will be empty until that
// lands — but the wiring is real.
interface OAuthGrantPayload {
  appName: string;
  scopes?: string[];
  grantedAt?: string;
}

export default function ConnectedApps() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const grantsQuery = useUserItems<OAuthGrantPayload>("oauth_grants");
  const removeGrant = useDeleteUserItem("oauth_grants");
  const grants = grantsQuery.data?.items ?? [];

  const handleRevoke = (id: string, name: string) => {
    Alert.alert("Revoke access", `Revoke access for ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Revoke",
        style: "destructive",
        onPress: () => removeGrant.mutate(id),
      },
    ]);
  };

  return (
    <Screen bg={Colors.surface.background}>
      <Header title={t("security.connectedApps")} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 320 }}
        >
          <Text
            style={{
              color: Colors.brand.primary,
              fontFamily: "Sora_700Bold",
              fontSize: 22,
              marginBottom: 6,
            }}
          >
            {t("security.connectedApps")}
          </Text>
          <Text
            style={{
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            Apps that have access to your ZADPAY account.
          </Text>

          {grantsQuery.isLoading ? (
            <Text
              style={{
                color: Colors.ink[500],
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                textAlign: "center",
                paddingVertical: 28,
              }}
            >
              Loading…
            </Text>
          ) : grants.length === 0 ? (
            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: Colors.ink[100],
                paddingVertical: 36,
                paddingHorizontal: 24,
                alignItems: "center",
              }}
            >
              <Ionicons name="apps-outline" size={36} color={Colors.ink[300]} />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 15,
                  color: Colors.ink[800],
                  marginTop: 12,
                  marginBottom: 4,
                }}
              >
                No connected apps
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: Colors.ink[500],
                  textAlign: "center",
                }}
              >
                Third-party apps you authorise will appear here.
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: Colors.ink[100],
                overflow: "hidden",
              }}
            >
              {grants.map((g, i) => (
                <ListRow
                  key={g.id}
                  icon={<Ionicons name="apps-outline" size={18} color={Colors.brand.primary} />}
                  title={g.payload.appName}
                  subtitle={
                    g.payload.scopes !== undefined && g.payload.scopes.length > 0
                      ? g.payload.scopes.join(", ")
                      : "Connected"
                  }
                  divider={i < grants.length - 1}
                  right={
                    <Pressable onPress={() => handleRevoke(g.id, g.payload.appName)} hitSlop={8}>
                      <Text
                        style={{
                          color: Colors.accent.red,
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 13,
                        }}
                      >
                        Revoke
                      </Text>
                    </Pressable>
                  }
                />
              ))}
            </View>
          )}
        </MotiView>
      </ScrollView>
    </Screen>
  );
}
