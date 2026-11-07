import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius } from "@/lib/theme";
import { AppText } from "./AppText";
import { Button } from "./Button";

type Props = {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  return (
    <View style={styles.wrap}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <AppText variant="h2" style={styles.title}>
        {title}
      </AppText>
      <AppText style={styles.description}>{description}</AppText>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          size="sm"
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 26,
    paddingVertical: 34,
    alignItems: "center",
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.pineSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    textAlign: "center",
  },
  description: {
    marginTop: 8,
    textAlign: "center",
    color: colors.muted,
    maxWidth: 280,
  },
  action: {
    marginTop: 20,
  },
});
