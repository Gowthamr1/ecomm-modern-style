import { StyleSheet, View } from "react-native";
import { colors, radius } from "@/lib/theme";
import { AppText } from "./AppText";

type Tone = "error" | "info";

type Props = {
  message: string;
  tone?: Tone;
};

export function Notice({ message, tone = "error" }: Props) {
  const error = tone === "error";
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: error ? colors.dangerSoft : colors.pineSoft,
          borderColor: error ? "transparent" : colors.border,
        },
      ]}
    >
      <AppText
        variant="small"
        color={error ? colors.danger : colors.pine}
        style={styles.text}
      >
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  text: {
    lineHeight: 18,
  },
});
