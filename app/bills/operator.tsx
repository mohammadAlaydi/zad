import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Colors } from "@/theme/colors";

export default function BillsOperator() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [step, setStep] = useState<"operators" | "form">("operators");
  const [selectedOperator, setSelectedOperator] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [serviceOpen, setServiceOpen] = useState(false);

  const operators = [
    { name: "Asiacell", subtitle: "topup, bills, more", color: "#E84A39" },
    { name: "Zain Iraq", subtitle: "topup, bills, more", color: "#982D87" },
  ];

  const services = [
    "Postpaid bill",
    "Internet package",
    "Monthly subscription",
    "Roaming",
  ];

  if (step === "operators") {
    return (
      <Screen bg={Colors.white}>
        <Header title={t("bills.operators")} />
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>Mobile operators</Text>
          <Text style={styles.subtext}>{t("bills.chooseOperator")}</Text>

          {operators.map((op, i) => (
            <MotiView
              key={op.name}
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 80, duration: 300 }}
            >
              <Pressable
                onPress={() => {
                  setSelectedOperator(op.name);
                  setStep("form");
                }}
                style={styles.operatorRow}
              >
                <View
                  style={[styles.operatorBadge, { backgroundColor: op.color }]}
                >
                  <Text style={styles.operatorBadgeText}>
                    {op.name.split(" ")[0].slice(0, 3)}
                  </Text>
                </View>
                <View style={styles.operatorInfo}>
                  <Text style={styles.operatorName}>{op.name}</Text>
                  <Text style={styles.operatorSub}>{op.subtitle}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.ink[400]}
                />
              </Pressable>
            </MotiView>
          ))}
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen bg={Colors.white} keyboard>
      <Header title={selectedOperator} onBack={() => setStep("operators")} />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label={t("bills.phoneNumber")}
          placeholder="07XX XXX XXXX"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          containerStyle={styles.phoneInput}
        />

        <Text style={styles.fieldLabel}>{selectedOperator}</Text>

        {/* Service dropdown trigger */}
        <Pressable
          onPress={() => setServiceOpen(!serviceOpen)}
          style={styles.selectField}
        >
          <Text
            style={[
              styles.selectText,
              !service ? styles.selectPlaceholder : null,
            ]}
          >
            {service || t("bills.chooseService")}
          </Text>
          <Ionicons
            name={serviceOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color={Colors.ink[500]}
          />
        </Pressable>

        {/* Dropdown options */}
        {serviceOpen && (
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 200 }}
            style={styles.dropdownContainer}
          >
            {services.map((s, i) => {
              const isActive = s === service;
              return (
                <Pressable
                  key={s}
                  onPress={() => {
                    setService(s);
                    setServiceOpen(false);
                  }}
                  style={[
                    styles.dropdownOption,
                    isActive ? styles.dropdownOptionActive : null,
                    i < services.length - 1 ? styles.dropdownOptionBorder : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      isActive ? styles.dropdownOptionTextActive : null,
                    ]}
                  >
                    {s}
                  </Text>
                  {isActive ? (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={Colors.brand.primary}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </MotiView>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { bottom: insets.bottom + 12 }]}>
        <Button
          title={t("common.proceed")}
          disabled={!phone || !service}
          onPress={() =>
            router.push({
              pathname: "/bills/pay",
              params: { operator: selectedOperator, phone, service },
            })
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 18,
  },
  heading: {
    color: Colors.brand.primary,
    fontFamily: "Sora_700Bold",
    fontSize: 19,
    marginTop: 4,
  },
  subtext: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginBottom: 18,
    marginTop: 4,
  },
  // Operator rows
  operatorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.ink[100],
    marginBottom: 12,
  },
  operatorBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  operatorBadgeText: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  operatorInfo: {
    flex: 1,
  },
  operatorName: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  operatorSub: {
    color: Colors.ink[400],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  // Form step
  phoneInput: {
    marginTop: 10,
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
  },
  selectText: {
    flex: 1,
    color: Colors.ink[900],
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  selectPlaceholder: {
    color: Colors.ink[400],
  },
  // Dropdown
  dropdownContainer: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.ink[200],
    overflow: "hidden",
    backgroundColor: Colors.white,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dropdownOptionActive: {
    backgroundColor: Colors.brand.primary50,
  },
  dropdownOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink[100],
  },
  dropdownOptionText: {
    flex: 1,
    color: Colors.ink[900],
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  dropdownOptionTextActive: {
    color: Colors.brand.primary,
    fontFamily: "Inter_600SemiBold",
  },
  // Bottom
  bottomBar: {
    position: "absolute",
    left: 18,
    right: 18,
  },
});
