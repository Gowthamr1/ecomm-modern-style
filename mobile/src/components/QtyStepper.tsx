import { Minus, Plus } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { colors, fonts, radius } from "@/lib/theme";
import { AppText } from "./AppText";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  compact?: boolean;
};

export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  compact = false,
}: Props) {
  const size = compact ? 30 : 38;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - 1))}
        style={({ pressed }) => [
          styles.button,
          { width: size, height: size },
          value <= min && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <Minus size={compact ? 13 : 15} color={colors.ink} strokeWidth={1.8} />
      </Pressable>
      <AppText style={styles.value}>{value}</AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))}
        style={({ pressed }) => [
          styles.button,
          { width: size, height: size },
          value >= max && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <Plus size={compact ? 13 : 15} color={colors.ink} strokeWidth={1.8} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    padding: 4,
    gap: 4,
  },
  wrapCompact: {
    padding: 2,
    gap: 2,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.paperDeep,
  },
  value: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    minWidth: 22,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  disabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.65,
  },
});
