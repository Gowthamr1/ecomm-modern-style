import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { colors, fonts, radius } from "@/lib/theme";
import { AppText } from "./AppText";

type Props = Omit<TextInputProps, "style"> & {
  label: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function Field({
  label,
  hint,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  multiline,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <AppText variant="label" color={focused ? colors.pine : colors.muted}>
        {label}
      </AppText>
      <TextInput
        {...rest}
        accessibilityLabel={label}
        multiline={multiline}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        placeholderTextColor={colors.muted}
        selectionColor={colors.pine}
        style={[
          styles.input,
          multiline && styles.multiline,
          focused && styles.focused,
          inputStyle,
        ]}
      />
      {hint ? (
        <AppText variant="small" color={colors.muted}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 7,
  },
  input: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 14,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  focused: {
    borderColor: colors.pine,
  },
});
