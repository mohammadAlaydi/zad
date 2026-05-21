import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useRevokeSession, useSessions } from "@/features/auth";
import { useHaptic } from "@/hooks/useHaptic";
import { Colors } from "@/theme/colors";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase()
  );
}

export default function Devices() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const sessions = useSessions();
  const revoke = useRevokeSession();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const list = sessions.data?.sessions ?? [];
  const loading = sessions.isLoading;
  const empty = !loading && list.length === 0;

  const onRevoke = async (id: string) => {
    setConfirmId(null);
    haptic.medium();
    await revoke.mutateAsync(id).catch(() => {
      // error surfaces via revoke.error
    });
  };

  return (
    <Screen bg={Colors.surface.background}>
      <Header title={t("security.devices")} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: insets.bottom + 24,
        }}
        refreshControl={
          <RefreshControl
            refreshing={sessions.isFetching && !sessions.isLoading}
            onRefresh={() => void sessions.refetch()}
            tintColor={Colors.brand.primary}
          />
        }
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
            {t("security.devices")}
          </Text>
          <Text
            style={{
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            Devices signed in to your ZADPAY account. Revoking one signs that device out
            immediately.
          </Text>

          {loading && (
            <View style={{ alignItems: "center", paddingVertical: 36 }}>
              <ActivityIndicator color={Colors.brand.primary} />
            </View>
          )}

          {empty && (
            <View style={{ alignItems: "center", paddingVertical: 36 }}>
              <Ionicons name="phone-portrait-outline" size={32} color={Colors.ink[400]} />
              <Text
                style={{
                  marginTop: 12,
                  color: Colors.ink[500],
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                No active sessions.
              </Text>
            </View>
          )}

          {!loading && list.length > 0 && (
            <View
              style={{
                backgroundColor: Colors.white,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: Colors.ink[100],
                overflow: "hidden",
              }}
            >
              {list.map((s, i) => (
                <View
                  key={s.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 14,
                    borderBottomWidth: i < list.length - 1 ? 1 : 0,
                    borderBottomColor: Colors.ink[100],
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: Colors.brand.primary50,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={18}
                      color={Colors.brand.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: Colors.ink[900],
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                      }}
                    >
                      Session · {s.id.slice(0, 6)}
                    </Text>
                    <Text
                      style={{
                        color: Colors.ink[500],
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      Started {formatDate(s.createdAt)}
                    </Text>
                  </View>
                  <Pressable
                    disabled={revoke.isPending}
                    onPress={() => setConfirmId(s.id)}
                    style={({ pressed }) => ({
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 999,
                      backgroundColor: Colors.accent.redSoft,
                      opacity: pressed || revoke.isPending ? 0.6 : 1,
                    })}
                  >
                    <Text
                      style={{
                        color: Colors.accent.red,
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 12,
                      }}
                    >
                      Revoke
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {sessions.error !== null && (
            <Text
              style={{
                marginTop: 12,
                color: Colors.accent.red,
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Couldn&apos;t load your active sessions.
            </Text>
          )}
        </MotiView>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={confirmId !== null}
        onRequestClose={() => setConfirmId(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(15,15,30,0.55)",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <View style={{ backgroundColor: Colors.white, borderRadius: 20, padding: 22 }}>
            <Text
              style={{
                color: Colors.ink[900],
                fontFamily: "Sora_700Bold",
                fontSize: 17,
                marginBottom: 6,
              }}
            >
              Revoke this session?
            </Text>
            <Text
              style={{
                color: Colors.ink[500],
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                marginBottom: 18,
              }}
            >
              The device using this session will be signed out immediately. If it&apos;s your
              current device you&apos;ll need to log in again.
            </Text>
            <Button
              title="Revoke"
              onPress={() => {
                if (confirmId !== null) void onRevoke(confirmId);
              }}
              loading={revoke.isPending}
            />
            <View style={{ height: 8 }} />
            <Button title="Cancel" variant="secondary" onPress={() => setConfirmId(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
