import { StyleSheet, Text, type TextProps } from "react-native";
import { colors, fonts } from "@/lib/theme";

export type TextVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "title"
  | "body"
  | "bodyStrong"
  | "small"
  | "label"
  | "price"
  | "quote";

type Props = TextProps & {
  variant?: TextVariant;
  color?: string;
};

const variants = StyleSheet.create({
  display: {
    fontFamily: fonts.serif,
    fontSize: 44,
    lineHeight: 46,
    letterSpacing: -1,
  },
  h1: {
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  h2: {
    fontFamily: fonts.serif,
    fontSize: 27,
    lineHeight: 31,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: fonts.serif,
    fontSize: 21,
    lineHeight: 26,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 21,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  bodyStrong: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
  },
  small: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 17,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  price: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
    fontVariant: ["tabular-nums"],
  },
  quote: {
    fontFamily: fonts.serifItalic,
    fontSize: 26,
    lineHeight: 33,
    letterSpacing: -0.2,
  },
});

export function AppText({
  variant = "body",
  color = colors.ink,
  style,
  ...rest
}: Props) {
  return (
    <Text
      {...rest}
      style={[styles.base, variants[variant], { color }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
