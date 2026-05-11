import { useState } from "react";
import { View, Text, Pressable, Modal, FlatList } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Colors } from "@/theme/colors";

const GENDERS = ["Male", "Female"];

export default function PersonalInfo() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("Mahmoud rafat fauda");
  const [user, setUser] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const valid = name.length > 2 && dob.length > 2;

  return (
    <Screen scroll keyboard>
      <Header />
      <View style={{ paddingHorizontal: 24, flex: 1 }}>
        <Text style={{ color: Colors.brand.primary, fontFamily: "Sora_700Bold", fontSize: 22 }}>{t("auth.personalInfo")}</Text>
        <Text style={{ marginTop: 6, marginBottom: 22, color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 }}>
          {t("auth.personalInfoHint")}
        </Text>
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
          placeholder="dd / mm / yy"
          value={dob}
          onChangeText={setDob}
          leftIcon={<Ionicons name="calendar-outline" size={16} color={Colors.ink[400]} />}
        />
        <Text style={{ color: Colors.ink[700], fontFamily: "Inter_500Medium", fontSize: 13, marginBottom: 6 }}>{t("auth.gender")}</Text>
        <Pressable
          onPress={() => setOpen(true)}
          style={({ pressed }) => ({
            height: 52,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: Colors.ink[200],
            paddingHorizontal: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: gender ? Colors.ink[900] : Colors.ink[400], fontFamily: "Inter_400Regular", fontSize: 15 }}>
            {gender ?? t("auth.chooseGender")}
          </Text>
          <Ionicons name="chevron-down" size={18} color={Colors.ink[400]} />
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
        <Button title={t("common.continue")} onPress={() => router.push("/(auth)/address")} />
      </View>
      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }} onPress={() => setOpen(false)} />
        <View style={{ position: "absolute", left: 24, right: 24, top: "40%", borderRadius: 18, backgroundColor: "#FFFFFF", overflow: "hidden" }}>
          {GENDERS.map((g) => (
            <Pressable
              key={g}
              onPress={() => {
                setGender(g);
                setOpen(false);
              }}
              style={({ pressed }) => ({ padding: 18, backgroundColor: pressed ? Colors.ink[50] : "transparent", borderBottomWidth: 1, borderBottomColor: Colors.ink[100] })}
            >
              <Text style={{ color: Colors.ink[900], fontFamily: "Inter_500Medium", fontSize: 15 }}>{g}</Text>
            </Pressable>
          ))}
        </View>
      </Modal>
    </Screen>
  );
}
