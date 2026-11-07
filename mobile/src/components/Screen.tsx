import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import {
  SafeAreaView,
  type Edge,
} from "react-native-safe-area-context";
import { colors } from "@/lib/theme";

type Props = {
  children: ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
};

/** Page background for screens that already have a native stack header. */
export function Page({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <SafeAreaView edges={["bottom"]} style={[styles.page, style]}>
      {children}
    </SafeAreaView>
  );
}

/** Safe-area wrapper for tab screens that draw their own header. */
export function Screen({ children, edges = ["top"], style }: Props) {
  return (
    <SafeAreaView edges={edges} style={[styles.page, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.paper,
  },
});
