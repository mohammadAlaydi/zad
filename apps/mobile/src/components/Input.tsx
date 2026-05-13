import { Ionicons } from "@expo/vector-icons";
import { useState, type ReactNode, forwardRef } from "react";
import {
  View,
  TextInput,
  Text,
  Pressable,
  type TextInputProps,
  type ViewStyle,
  StyleSheet,
} from "react-native";
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
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>{label}</Text>
          {helperRight}
        </View>
      ) : null}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? Colors.accent.red
              : focused
                ? Colors.brand.primary
                : Colors.ink[200],
            backgroundColor: error ? "#FFF5F5" : Colors.white,
          },
        ]}
      >
        {leftIcon ? <View style={styles.leftIconWrap}>{leftIcon}</View> : null}
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
          style={[styles.textInput, rest.style as any]}
        />
        {isPassword ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Ionicons name={hidden ? "eye-off" : "eye"} size={20} color={Colors.ink[400]} />
          </Pressable>
        ) : (
          rightIcon
        )}
      </View>
      {hint && !error ? <Text style={styles.hintText}>{hint}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  labelText: {
    color: Colors.ink[700],
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  leftIconWrap: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: Colors.ink[900],
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    paddingVertical: 0,
  },
  hintText: {
    marginTop: 6,
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  errorText: {
    marginTop: 6,
    color: Colors.accent.red,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
});
