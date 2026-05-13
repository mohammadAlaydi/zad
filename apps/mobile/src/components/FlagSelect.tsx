import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View, Text, Modal, StyleSheet } from "react-native";
import { setLocale } from "@/i18n";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇦🇪" },
];

export function FlagSelect() {
  const { locale, setLocale: setStoreLocale } = useApp();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  const selectLang = (code: string) => {
    setStoreLocale(code as any);
    setLocale(code as any);
    setOpen(false);
  };

  return (
    <View>
      {/* Trigger button */}
      <Pressable onPress={() => setOpen(true)} style={styles.trigger}>
        <Text style={styles.flag}>{current.flag}</Text>
        <Text style={styles.label}>{current.label}</Text>
        <Ionicons name="chevron-down" size={14} color={Colors.ink[500]} />
      </Pressable>

      {/* Dropdown modal */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Select Language</Text>
            {LANGUAGES.map((lang) => {
              const isActive = lang.code === locale;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => selectLang(lang.code)}
                  style={[styles.option, isActive ? styles.optionActive : null]}
                >
                  <Text style={styles.optionFlag}>{lang.flag}</Text>
                  <Text style={[styles.optionLabel, isActive ? styles.optionLabelActive : null]}>
                    {lang.label}
                  </Text>
                  {isActive && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.brand.primary}
                      style={styles.checkIcon}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.ink[50],
    gap: 6,
  },
  flag: {
    fontSize: 16,
  },
  label: {
    color: Colors.ink[700],
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  dropdown: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
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
    marginBottom: 16,
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
  },
  optionActive: {
    backgroundColor: Colors.brand.primary50,
  },
  optionFlag: {
    fontSize: 22,
  },
  optionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.ink[700],
  },
  optionLabelActive: {
    color: Colors.brand.primary,
    fontFamily: "Inter_600SemiBold",
  },
  checkIcon: {
    marginLeft: "auto" as any,
  },
});
