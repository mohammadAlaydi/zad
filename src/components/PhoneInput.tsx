import { useState } from "react";
import { View, Text, TextInput, Pressable, Modal, FlatList, StyleSheet } from "react-native";
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
        style={[
          styles.container,
          { borderColor: focused ? Colors.brand.primary : Colors.ink[200] },
        ]}
      >
        <Pressable
          onPress={() => setOpen(true)}
          style={styles.countryBtn}
        >
          <Text style={styles.flagEmoji}>{country.flag}</Text>
          <Text style={styles.dialCode}>{country.dial}</Text>
          <Ionicons name="chevron-down" size={14} color={Colors.ink[500]} />
        </Pressable>
        <View style={styles.separator} />
        <TextInput
          value={value}
          onChangeText={(t) => onChangeText(t.replace(/[^0-9]/g, ""))}
          placeholder={placeholder}
          placeholderTextColor={Colors.ink[400]}
          keyboardType="phone-pad"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.input}
        />
      </View>
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Select country</Text>
          <FlatList
            data={COUNTRIES}
            keyExtractor={(c) => c.code}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onCountryChange(item);
                  setOpen(false);
                }}
                style={styles.countryRow}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.countryDial}>{item.dial}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  countryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: "100%" as any,
    gap: 4,
  },
  flagEmoji: {
    fontSize: 18,
  },
  dialCode: {
    color: Colors.ink[900],
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: Colors.ink[200],
  },
  input: {
    flex: 1,
    height: "100%" as any,
    paddingHorizontal: 12,
    color: Colors.ink[900],
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
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
  countryFlag: {
    fontSize: 22,
  },
  countryName: {
    flex: 1,
    color: Colors.ink[900],
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  countryDial: {
    color: Colors.ink[600],
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
});
