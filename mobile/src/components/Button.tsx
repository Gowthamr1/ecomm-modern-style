import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, fonts, radius } from "@/lib/theme";
import { AppText } from "./AppText";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
}: Props) {
  const inactive = disabled || loading;
  const spinnerColor =
    variant === "primary" || variant === "danger" ? colors.paper : colors.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === "md" ? styles.md : styles.sm,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        inactive && styles.inactive,
        pressed && !inactive && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.content}>
          {icon}
          <AppText
            style={[
              styles.label,
              size === "sm" && styles.labelSmall,
              { color: labelColors[variant] },
            ]}
          >
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const labelColors: Record<ButtonVariant, string> = {
  primary: colors.paper,
  secondary: colors.ink,
  ghost: colors.pine,
  danger: colors.paper,
};

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.pine,
    borderWidth: 1,
    borderColor: colors.pine,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "transparent",
  },
  danger: {
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: colors.danger,
  },
});

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: 20,
  },
  md: {
    height: 52,
  },
  sm: {
    height: 40,
    paddingHorizontal: 16,
  },
  fullWidth: {
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  labelSmall: {
    fontSize: 12,
  },
  inactive: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.82,
  },
});
