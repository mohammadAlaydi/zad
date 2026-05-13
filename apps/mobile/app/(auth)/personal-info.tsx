import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";

const GENDERS = ["Male", "Female"];

/**
 * Auto-format a raw digit string into DD / MM / YYYY.
 * Accepts only digits; slashes are inserted automatically.
 */
function formatDob(raw: string): string {
  // Strip everything except digits
  const digits = raw.replace(/\D/g, "").slice(0, 8); // max 8 digits (DDMMYYYY)
  let result = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) result += " / ";
    result += digits[i];
  }
  return result;
}

/** Reverse: strip formatted string back to pure digits */
function stripDob(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

export default function PersonalInfo() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("Mahmoud rafat fauda");
  const [user, setUser] = useState("");
  const [dob, setDob] = useState(""); // stored as digits only
  const [gender, setGender] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const valid = name.length > 2 && dob.length >= 6; // at least DD MM YY

  const handleDobChange = useCallback((text: string) => {
    // Extract digits from whatever the user typed
    const digits = text.replace(/\D/g, "").slice(0, 8);
    setDob(digits);
  }, []);

  const displayDob = formatDob(dob);

  return (
    <Screen scroll keyboard>
      <Header />
      <View style={styles.content}>
        <Text style={styles.heading}>{t("auth.personalInfo")}</Text>
        <Text style={styles.subheading}>{t("auth.personalInfoHint")}</Text>

        <Input label={t("auth.fullName")} value={name} onChangeText={setName} />

        <Input
          label={t("auth.username")}
          placeholder="@user-name"
          autoCapitalize="none"
          value={user}
          onChangeText={setUser}
          leftIcon={<Ionicons name="at" size={16} color={Colors.ink[400]} />}
        />

        <Input
          label={t("auth.dob")}
          placeholder="dd / mm / yyyy"
          value={displayDob}
          onChangeText={handleDobChange}
          keyboardType="number-pad"
          maxLength={14} // "DD / MM / YYYY" = 14 chars
          leftIcon={<Ionicons name="calendar-outline" size={16} color={Colors.ink[400]} />}
          rightIcon={<Ionicons name="chevron-down" size={18} color={Colors.ink[400]} />}
        />

        {/* Gender selector — styled to match the input fields */}
        <Text style={styles.fieldLabel}>{t("auth.gender")}</Text>
        <Pressable onPress={() => setOpen(true)} style={styles.selectField}>
          <Text style={[styles.selectText, !gender ? styles.selectPlaceholder : null]}>
            {gender ?? t("auth.chooseGender")}
          </Text>
          <Ionicons name="chevron-down" size={18} color={Colors.ink[400]} />
        </Pressable>
      </View>
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
        <Button
          title={t("common.continue")}
          disabled={!valid}
          onPress={() => router.push("/(auth)/address")}
        />
      </View>

      {/* Gender dropdown modal */}
      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)} />
        <View style={styles.dropdown}>
          <Text style={styles.dropdownTitle}>{t("auth.chooseGender")}</Text>
          {GENDERS.map((g) => {
            const isActive = g === gender;
            return (
              <Pressable
                key={g}
                onPress={() => {
                  setGender(g);
                  setOpen(false);
                }}
                style={[styles.dropdownOption, isActive ? styles.dropdownOptionActive : null]}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    isActive ? styles.dropdownOptionTextActive : null,
                  ]}
                >
                  {g}
                </Text>
                {isActive ? (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.brand.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    flex: 1,
  },
  heading: {
    color: Colors.brand.primary,
    fontFamily: "Sora_700Bold",
    fontSize: 22,
  },
  subheading: {
    marginTop: 6,
    marginBottom: 22,
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  fieldLabel: {
    color: Colors.ink[700],
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginBottom: 6,
  },
  selectField: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.ink[200],
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    marginBottom: 14,
  },
  selectText: {
    color: Colors.ink[900],
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  selectPlaceholder: {
    color: Colors.ink[400],
  },
  bottom: {
    paddingHorizontal: 24,
  },
  // Modal styles
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  dropdown: {
    position: "absolute",
    left: 24,
    right: 24,
    top: "38%",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  dropdownTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.ink[900],
    textAlign: "center",
    marginBottom: 12,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  dropdownOptionActive: {
    backgroundColor: Colors.brand.primary50,
  },
  dropdownOptionText: {
    color: Colors.ink[900],
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  dropdownOptionTextActive: {
    color: Colors.brand.primary,
    fontFamily: "Inter_600SemiBold",
  },
});
