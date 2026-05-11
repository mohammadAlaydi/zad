import { useState, ReactNode, forwardRef } from "react";
import { View, TextInput, Text, Pressable, TextInputProps, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  helperRight?: ReactNode;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, hint, error, leftIcon, rightIcon, containerStyle, isPassword, helperRight, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!isPassword);

  return (
    <View style={[{ marginBottom: 14 }, containerStyle]}>
      {label ? (
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Text style={{ color: Colors.ink[700], fontFamily: "Inter_500Medium", fontSize: 13 }}>{label}</Text>
          {helperRight}
        </View>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          height: 52,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: error ? Colors.accent.red : focused ? Colors.brand.primary : Colors.ink[200],
          paddingHorizontal: 14,
          backgroundColor: error ? "#FFF5F5" : Colors.white,
        }}
      >
        {leftIcon ? <View style={{ marginRight: 8 }}>{leftIcon}</View> : null}
        <TextInput
          ref={ref}
          {...rest}
          secureTextEntry={hidden}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={Colors.ink[400]}
          style={[
            { flex: 1, color: Colors.ink[900], fontFamily: "Inter_400Regular", fontSize: 15, paddingVertical: 0 },
            rest.style as any,
          ]}
        />
        {isPassword ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Ionicons name={hidden ? "eye-off" : "eye"} size={20} color={Colors.ink[400]} />
          </Pressable>
        ) : (
          rightIcon
        )}
      </View>
      {hint && !error ? (
        <Text style={{ marginTop: 6, color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 12 }}>{hint}</Text>
      ) : null}
      {error ? (
        <Text style={{ marginTop: 6, color: Colors.accent.red, fontFamily: "Inter_500Medium", fontSize: 12 }}>{error}</Text>
      ) : null}
    </View>
  );
});
