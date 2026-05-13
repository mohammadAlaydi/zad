import { router } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

const EMOJI_PRESETS = ["🏠", "✈️", "🎓", "🚗", "💍", "📱", "🏋️", "🌴", "🐾", "🎁", "💻", "🛥️"];

export default function CreateGoal() {
  const insets = useSafeAreaInsets();
  const { addGoal, activeCurrency } = useApp();

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [target, setTarget] = useState("");

  const canCreate = name.trim().length > 0 && parseFloat(target) > 0;

  function handleCreate() {
    addGoal({
      id: "goal-" + Date.now(),
      name: name.trim(),
      emoji,
      targetAmount: parseFloat(target),
      savedAmount: 0,
      currency: activeCurrency,
      createdAt: new Date().toISOString(),
    });
    router.back();
  }

  return (
    <Screen bg={Colors.surface.background}>
      <Header title="Create Goal" />

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Emoji picker */}
        <Text style={s.label}>Choose an emoji</Text>
        <View style={s.emojiGrid}>
          {EMOJI_PRESETS.map((e) => (
            <Pressable
              key={e}
              onPress={() => setEmoji(e)}
              style={[s.emojiBtn, emoji === e && s.emojiBtnActive]}
            >
              <Text style={s.emojiText}>{e}</Text>
            </Pressable>
          ))}
        </View>

        {/* Goal name */}
        <Text style={s.label}>Goal Name</Text>
        <TextInput
          style={s.input}
          placeholder='e.g. "Trip to Dubai"'
          placeholderTextColor={Colors.ink[300]}
          value={name}
          onChangeText={setName}
          maxLength={40}
        />

        {/* Target amount */}
        <Text style={s.label}>Target Amount ({activeCurrency})</Text>
        <View style={s.amountRow}>
          <Text style={s.currency}>{activeCurrency}</Text>
          <TextInput
            style={s.amountInput}
            placeholder="0.00"
            placeholderTextColor={Colors.ink[300]}
            value={target}
            onChangeText={setTarget}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Preview card */}
        {name.trim().length > 0 && (
          <View style={s.preview}>
            <Text style={s.previewEmoji}>{emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.previewName}>{name}</Text>
              <Text style={s.previewTarget}>
                Target: {activeCurrency} {parseFloat(target || "0").toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[s.footer, { bottom: insets.bottom + 16 }]}>
        <Button title="Create Goal" disabled={!canCreate} onPress={handleCreate} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 18, paddingTop: 8 },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.ink[600],
    marginBottom: 10,
    marginTop: 20,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  emojiBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiBtnActive: {
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.brand.primary50,
  },
  emojiText: { fontSize: 24 },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.ink[900],
    backgroundColor: Colors.white,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.brand.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
  },
  currency: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[500],
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 22,
    color: Colors.ink[900],
    paddingVertical: 14,
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.brand.primary50,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  previewEmoji: { fontSize: 32 },
  previewName: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.ink[900] },
  previewTarget: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.ink[500],
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    left: 18,
    right: 18,
  },
});
