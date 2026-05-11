import { useState } from "react";
import { View, Text, TextInput, Pressable, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COUNTRIES, Country } from "@/data/countries";
import { Colors } from "@/theme/colors";

type Props = {
  country: Country;
  onCountryChange: (c: Country) => void;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
};

export function PhoneInput({ country, onCountryChange, value, onChangeText, placeholder = "Mobile Number" }: Props) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          height: 52,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: focused ? Colors.brand.primary : Colors.ink[200],
          overflow: "hidden",
        }}
      >
        <Pressable
          onPress={() => setOpen(true)}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            height: "100%",
            backgroundColor: pressed ? Colors.ink[100] : "transparent",
            gap: 4,
          })}
        >
          <Text style={{ fontSize: 18 }}>{country.flag}</Text>
          <Text style={{ color: Colors.ink[900], fontFamily: "Inter_500Medium", fontSize: 14 }}>{country.dial}</Text>
          <Ionicons name="chevron-down" size={14} color={Colors.ink[500]} />
        </Pressable>
        <View style={{ width: 1, height: 24, backgroundColor: Colors.ink[200] }} />
        <TextInput
          value={value}
          onChangeText={(t) => onChangeText(t.replace(/[^0-9]/g, ""))}
          placeholder={placeholder}
          placeholderTextColor={Colors.ink[400]}
          keyboardType="phone-pad"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ flex: 1, height: "100%", paddingHorizontal: 12, color: Colors.ink[900], fontFamily: "Inter_400Regular", fontSize: 15 }}
        />
      </View>
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} onPress={() => setOpen(false)} />
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16, paddingBottom: 30, maxHeight: "70%" }}>
          <View style={{ width: 44, height: 4, backgroundColor: Colors.ink[200], borderRadius: 2, alignSelf: "center", marginBottom: 12 }} />
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 17, paddingHorizontal: 20, marginBottom: 8 }}>Select country</Text>
          <FlatList
            data={COUNTRIES}
            keyExtractor={(c) => c.code}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onCountryChange(item);
                  setOpen(false);
                }}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  backgroundColor: pressed ? Colors.ink[50] : "transparent",
                  gap: 12,
                })}
              >
                <Text style={{ fontSize: 22 }}>{item.flag}</Text>
                <Text style={{ flex: 1, color: Colors.ink[900], fontFamily: "Inter_500Medium", fontSize: 15 }}>{item.name}</Text>
                <Text style={{ color: Colors.ink[600], fontFamily: "Inter_500Medium", fontSize: 14 }}>{item.dial}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </>
  );
}
