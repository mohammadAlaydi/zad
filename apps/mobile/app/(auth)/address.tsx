import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { COUNTRIES, type Country } from "@/data/countries";
import { Colors } from "@/theme/colors";

export default function Address() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [country, setCountry] = useState<Country>(COUNTRIES[3]); // Iraq
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [open, setOpen] = useState(false);

  const valid = city.length > 0 && address.length > 0;

  return (
    <Screen scroll keyboard>
      <Header />
      <View style={styles.content}>
        <Text style={styles.heading}>{t("auth.homeAddress")}</Text>
        <Text style={styles.subheading}>{t("auth.homeAddressHint")}</Text>

        {/* Country selector */}
        <Text style={styles.fieldLabel}>{t("auth.country")}</Text>
        <Pressable onPress={() => setOpen(true)} style={styles.selectField}>
          <View style={styles.selectInner}>
            <Text style={styles.flagEmoji}>{country.flag}</Text>
            <Text style={styles.selectText}>{country.name}</Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={Colors.ink[400]} />
        </Pressable>

        <Input label={t("auth.city")} value={city} onChangeText={setCity} />
        <Input label={t("auth.addressLine")} value={address} onChangeText={setAddress} />
        <Input label={t("auth.zip")} value={zip} keyboardType="number-pad" onChangeText={setZip} />
      </View>
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
        <Button
          title={t("common.continue")}
          disabled={!valid}
          onPress={() => router.push("/(auth)/id-scan")}
        />
      </View>

      {/* Country picker modal */}
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{t("auth.country")}</Text>
          <FlatList
            data={COUNTRIES}
            keyExtractor={(c) => c.code}
            renderItem={({ item }) => {
              const isActive = item.code === country.code;
              return (
                <Pressable
                  onPress={() => {
                    setCountry(item);
                    setOpen(false);
                  }}
                  style={[styles.countryRow, isActive ? styles.countryRowActive : null]}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <Text style={[styles.countryName, isActive ? styles.countryNameActive : null]}>
                    {item.name}
                  </Text>
                  {isActive ? (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.brand.primary} />
                  ) : null}
                </Pressable>
              );
            }}
          />
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
  selectInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  flagEmoji: {
    fontSize: 20,
  },
  selectText: {
    color: Colors.ink[900],
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  bottom: {
    paddingHorizontal: 24,
  },
  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 30,
    maxHeight: "70%" as any,
  },
  handle: {
    width: 44,
    height: 4,
    backgroundColor: Colors.ink[200],
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  sheetTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: Colors.ink[900],
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  countryRowActive: {
    backgroundColor: Colors.brand.primary50,
  },
  countryFlag: {
    fontSize: 22,
  },
  countryName: {
    flex: 1,
    color: Colors.ink[900],
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  countryNameActive: {
    color: Colors.brand.primary,
    fontFamily: "Inter_600SemiBold",
  },
});
