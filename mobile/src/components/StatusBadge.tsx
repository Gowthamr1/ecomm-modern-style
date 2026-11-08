import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { colors, fonts, radius } from "@/lib/theme";

const tones: Record<string, { background: string; foreground: string }> = {
  paid: { background: colors.sand, foreground: colors.pineDeep },
  shipped: { background: colors.pineSoft, foreground: colors.pine },
  delivered: { background: colors.pine, foreground: colors.paper },
  cancelled: { background: colors.dangerSoft, foreground: colors.danger },
  succeeded: { background: colors.pineSoft, foreground: colors.pine },
  refunded: { background: colors.paperDeep, foreground: colors.muted },
  customer: { background: colors.paperDeep, foreground: colors.muted },
  guest: { background: colors.sand, foreground: colors.pineDeep },
  "in stock": { background: colors.pineSoft, foreground: colors.pine },
  "low stock": { background: colors.sand, foreground: colors.pineDeep },
  "sold out": { background: colors.dangerSoft, foreground: colors.danger },
};

type Props = {
  status: string;
  label?: string;
};

export function StatusBadge({ status, label }: Props) {
  const tone = tones[status.toLowerCase()] ?? {
    background: colors.paperDeep,
    foreground: colors.muted,
  };

  return (
    <View style={[styles.badge, { backgroundColor: tone.background }]}>
      <AppText
        style={[styles.text, { color: tone.foreground }]}
        numberOfLines={1}
      >
        {label ?? status.replace(/_/g, " ")}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  text: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    lineHeight: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
