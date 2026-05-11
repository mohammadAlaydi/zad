import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
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

  const services = ["Postpaid bill", "Internet package", "Monthly subscription", "Roaming"];

  if (step === "operators") {
    return (
      <Screen bg={Colors.white}>
        <Header title={t("bills.operators")} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 24 }}>
          <Text style={{ color: Colors.brand.primary, fontFamily: "Sora_700Bold", fontSize: 19, marginTop: 4 }}>
            Mobile operators
          </Text>
          <Text style={{ color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12, marginBottom: 18, marginTop: 4 }}>
            {t("bills.chooseOperator")}
          </Text>

          {operators.map((op, i) => (
            <MotiView
              key={op.name}
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 80, duration: 300 }}
            >
              <Pressable
                onPress={() => { setSelectedOperator(op.name); setStep("form"); }}
                style={({ pressed }) => ({
                  flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14,
                  borderRadius: 14, backgroundColor: Colors.white,
                  borderWidth: 1, borderColor: Colors.ink[100], marginBottom: 12,
                  opacity: pressed ? 0.85 : 1,
                  shadowColor: "#101225", shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
                })}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 12, backgroundColor: op.color,
                  alignItems: "center", justifyContent: "center", marginRight: 12,
                }}>
                  <Text style={{ color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 13 }}>
                    {op.name.split(" ")[0].slice(0, 3)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 15 }}>{op.name}</Text>
                  <Text style={{ color: Colors.ink[400], fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }}>
                    {op.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.ink[400]} />
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
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label={t("bills.phoneNumber")}
          placeholder="07XX XXX XXXX"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          containerStyle={{ marginTop: 10 }}
        />

        <Text style={{ color: Colors.ink[700], fontFamily: "Inter_500Medium", fontSize: 13, marginBottom: 6 }}>
          {selectedOperator}
        </Text>
        <Pressable
          onPress={() => setServiceOpen(!serviceOpen)}
          style={({ pressed }) => ({
            height: 52, borderRadius: 14, borderWidth: 1, borderColor: Colors.ink[200],
            flexDirection: "row", alignItems: "center", paddingHorizontal: 14, opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{
            flex: 1, color: service ? Colors.ink[900] : Colors.ink[400],
            fontFamily: "Inter_400Regular", fontSize: 15,
          }}>
            {service || t("bills.chooseService")}
          </Text>
          <Ionicons name={serviceOpen ? "chevron-up" : "chevron-down"} size={18} color={Colors.ink[500]} />
        </Pressable>

        {serviceOpen && (
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 200 }}
            style={{
              marginTop: 6, borderRadius: 14, borderWidth: 1, borderColor: Colors.ink[200],
              overflow: "hidden", backgroundColor: Colors.white,
            }}
          >
            {services.map((s, i) => (
              <Pressable
                key={s}
                onPress={() => { setService(s); setServiceOpen(false); }}
                style={({ pressed }) => ({
                  paddingHorizontal: 14, paddingVertical: 12,
                  borderBottomWidth: i === services.length - 1 ? 0 : 1,
                  borderBottomColor: Colors.ink[100],
                  backgroundColor: pressed ? Colors.ink[50] : "transparent",
                })}
              >
                <Text style={{ color: Colors.ink[900], fontFamily: "Inter_400Regular", fontSize: 14 }}>{s}</Text>
              </Pressable>
            ))}
          </MotiView>
        )}
      </ScrollView>

      <View style={{ position: "absolute", left: 18, right: 18, bottom: insets.bottom + 12 }}>
        <Button
          title={t("common.proceed")}
          disabled={!phone || !service}
          onPress={() => router.push({ pathname: "/bills/pay", params: { operator: selectedOperator, phone, service } })}
        />
      </View>
    </Screen>
  );
}
