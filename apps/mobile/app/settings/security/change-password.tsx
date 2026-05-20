import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { authService } from "@/features/auth/services/authService";
import { Colors } from "@/theme/colors";

function copyForError(code: string | undefined): string {
  switch (code) {
    case "IDENTITY.INVALID_PASSWORD":
      return "Your current password is incorrect.";
    case "COMMON.VALIDATION":
      return "Please check your input — the new password must be at least 8 characters.";
    default:
      return "Couldn't change your password. Please try again.";
  }
}

export default function ChangePassword() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const newMatches = next.length >= 8 && next === confirm;
  const canSubmit = current.length > 0 && newMatches && next !== current && !submitting;

  async function onSubmit() {
    setErrorCode(null);
    setSubmitting(true);
    try {
      const result = await authService.changePassword({
        currentPassword: current,
        newPassword: next,
      });
      if (!result.ok) {
        setErrorCode(result.error.code);
        return;
      }
      setSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen scroll keyboard bg={Colors.white}>
      <Header showBack title="Change password" />
      <View style={{ paddingHorizontal: 24, flex: 1 }}>
        <Text style={styles.subtitle}>
          For your security, use a new password that you don&apos;t use anywhere else. Minimum 8
          characters.
        </Text>

        <Input
          label="Current password"
          isPassword
          placeholder="••••••••"
          value={current}
          onChangeText={setCurrent}
        />
        <View style={{ height: 16 }} />
        <Input
          label="New password"
          isPassword
          placeholder="••••••••"
          value={next}
          onChangeText={setNext}
        />
        <View style={{ height: 16 }} />
        <Input
          label="Confirm new password"
          isPassword
          placeholder="••••••••"
          value={confirm}
          onChangeText={setConfirm}
        />

        {confirm.length > 0 && next !== confirm && (
          <Text style={styles.hint}>The two new passwords don&apos;t match.</Text>
        )}

        {errorCode !== null && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={Colors.accent.red} />
            <Text style={styles.errorText}>{copyForError(errorCode)}</Text>
          </View>
        )}

        {success && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.accent.green} />
            <Text style={styles.successText}>
              Password changed. Use your new password next time you sign in.
            </Text>
          </View>
        )}
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
        {success ? (
          <Button title="Done" onPress={() => router.back()} />
        ) : (
          <Button
            title={submitting ? "Saving…" : "Save new password"}
            disabled={!canSubmit}
            onPress={onSubmit}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 20,
  },
  hint: {
    color: Colors.accent.red,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 8,
  },
  errorBanner: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FBEAEC",
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: Colors.accent.red,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  successBanner: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#E6F8F1",
    borderRadius: 12,
    padding: 12,
  },
  successText: {
    color: Colors.accent.green,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});
