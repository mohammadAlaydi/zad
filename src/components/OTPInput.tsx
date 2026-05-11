import { useRef, useState, useEffect } from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import { Colors } from "@/theme/colors";
import { MotiView } from "moti";

type Props = {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
};

export function OTPInput({ length = 6, value, onChange, autoFocus = true }: Props) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  return (
    <View style={{ position: "relative", height: 64 }}>
      <Pressable onPress={() => inputRef.current?.focus()} style={{ flexDirection: "row", justifyContent: "center", gap: 12 }}>
        {Array.from({ length }).map((_, i) => {
          const filled = !!value[i];
          const focused = i === value.length;
          return (
            <MotiView
              key={i}
              animate={{
                borderColor: filled || focused ? Colors.brand.primary : Colors.ink[200],
                scale: focused ? 1.04 : 1,
              }}
              transition={{ type: "timing", duration: 180 }}
              style={{
                width: 44,
                height: 56,
                borderBottomWidth: 2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: Colors.brand.primary, fontFamily: "Inter_600SemiBold", fontSize: 22 }}>
                {value[i] ?? ""}
              </Text>
            </MotiView>
          );
        })}
      </Pressable>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, "").slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
        caretHidden
      />
    </View>
  );
}
