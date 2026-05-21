import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MotiView } from "moti";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { useSubmitFraudReport } from "@/features/notifications";
import { useHaptic } from "@/hooks/useHaptic";
import { Colors } from "@/theme/colors";

type Category = "unauthorized" | "scam" | "phishing" | "other";

const CATEGORIES: Array<{ key: Category; label: string; icon: string }> = [
  { key: "unauthorized", label: "Unauthorised transaction", icon: "card-outline" },
  { key: "scam", label: "Scam / fraud attempt", icon: "warning-outline" },
  { key: "phishing", label: "Phishing message or call", icon: "mail-outline" },
  { key: "other", label: "Something else", icon: "ellipsis-horizontal" },
];

export default function ReportFraud() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const submit = useSubmitFraudReport();

  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = category !== null && description.trim().length >= 10 && !submit.isPending;

  const onSubmit = async () => {
    if (category === null) return;
    const result = await submit
      .mutateAsync({
        category,
        description: description.trim(),
      })
      .catch(() => null);
    if (result !== null) {
      haptic.success();
      setSubmitted(true);
    } else {
      haptic.medium();
    }
  };

  if (submitted) {
    return (
      <Screen bg={Colors.white}>
        <Header title={t("security.reportFraud")} />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
          }}
        >
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: "#D7F7EE",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="checkmark" size={48} color={Colors.accent.green} />
          </View>
          <Text
            style={{
              color: Colors.ink[900],
              fontFamily: "Sora_700Bold",
              fontSize: 22,
              marginTop: 18,
              textAlign: "center",
            }}
          >
            Report submitted
          </Text>
          <Text
            style={{
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              marginTop: 8,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Our risk team will review your report and contact you within 24 hours.
          </Text>
        </View>
        <View style={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 16 }}>
          <Button title={t("common.done")} onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen bg={Colors.surface.background} keyboard>
      <Header title={t("security.reportFraud")} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: insets.bottom + 96,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 320 }}
        >
          <View style={{ alignItems: "center", marginBottom: 22, marginTop: 8 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: Colors.accent.redSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="shield-outline" size={30} color={Colors.accent.red} />
            </View>
            <Text
              style={{
                color: Colors.ink[900],
                fontFamily: "Sora_700Bold",
                fontSize: 20,
                marginTop: 14,
                textAlign: "center",
              }}
            >
              Tell us what happened
            </Text>
            <Text
              style={{
                color: Colors.ink[500],
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                marginTop: 6,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              The more detail you give, the faster we can investigate.
            </Text>
          </View>

          <Text
            style={{
              color: Colors.ink[700],
              fontFamily: "Inter_600SemiBold",
              fontSize: 13,
              marginBottom: 10,
            }}
          >
            Category
          </Text>
          <View style={{ gap: 8, marginBottom: 20 }}>
            {CATEGORIES.map((c) => {
              const selected = category === c.key;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderRadius: 14,
                    backgroundColor: Colors.white,
                    borderWidth: 1,
                    borderColor: selected ? Colors.brand.primary : Colors.ink[100],
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Ionicons
                    name={c.icon as any}
                    size={20}
                    color={selected ? Colors.brand.primary : Colors.ink[500]}
                  />
                  <Text
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      color: Colors.ink[900],
                      fontFamily: selected ? "Inter_600SemiBold" : "Inter_400Regular",
                      fontSize: 14,
                    }}
                  >
                    {c.label}
                  </Text>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: selected ? Colors.brand.primary : Colors.ink[300],
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selected && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: Colors.brand.primary,
                        }}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Input
            label="What happened?"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the incident — when, how, and any transaction details."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={{ minHeight: 120, paddingTop: 12 }}
            error={
              description.length > 0 && description.trim().length < 10
                ? "Please provide at least 10 characters."
                : undefined
            }
          />

          {submit.error !== null && (
            <Text
              style={{
                color: Colors.accent.red,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Couldn&apos;t submit the report. Please try again.
            </Text>
          )}
        </MotiView>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 18,
          paddingTop: 10,
          paddingBottom: insets.bottom + 16,
          backgroundColor: Colors.surface.background,
        }}
      >
        <Button
          title={submit.isPending ? "Submitting…" : "Submit report"}
          onPress={onSubmit}
          disabled={!canSubmit}
          loading={submit.isPending}
        />
      </View>
    </Screen>
  );
}
