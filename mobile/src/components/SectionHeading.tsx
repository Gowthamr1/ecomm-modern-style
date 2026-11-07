import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { colors } from "@/lib/theme";
import { AppText } from "./AppText";

type Props = {
  title: string;
  eyebrow?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeading({ title, eyebrow, actionLabel, onAction }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {eyebrow ? (
          <AppText variant="label" color={colors.muted} style={styles.eyebrow}>
            {eyebrow}
          </AppText>
        ) : null}
        <AppText variant="h2">{title}</AppText>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <AppText variant="small" color={colors.pine} style={styles.actionText}>
            {actionLabel}
          </AppText>
          <ChevronRight size={14} color={colors.pine} strokeWidth={1.8} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    gap: 12,
  },
  copy: {
    flexShrink: 1,
    gap: 4,
  },
  eyebrow: {
    marginBottom: 2,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingBottom: 3,
  },
  actionText: {
    textDecorationLine: "underline",
  },
  pressed: {
    opacity: 0.6,
  },
});
