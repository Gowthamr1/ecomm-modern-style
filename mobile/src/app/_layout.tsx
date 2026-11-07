import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CartProvider } from "@/lib/cart";
import { convex, secureStorage } from "@/lib/convex";
import { colors, fonts } from "@/lib/theme";

const FONT_MAP = {
  Inter_400Regular: require("@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf"),
  Inter_500Medium: require("@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf"),
  Inter_600SemiBold: require("@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf"),
  Inter_700Bold: require("@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf"),
  InstrumentSerif_400Regular: require("@expo-google-fonts/instrument-serif/400Regular/InstrumentSerif_400Regular.ttf"),
  InstrumentSerif_400Regular_Italic: require("@expo-google-fonts/instrument-serif/400Regular_Italic/InstrumentSerif_400Regular_Italic.ttf"),
};

export default function RootLayout() {
  const [fontLoaded, fontError] = useFonts(FONT_MAP);

  if (!fontLoaded && !fontError) {
    return <View style={styles.loading} />;
  }

  return (
    <SafeAreaProvider>
      <ConvexAuthProvider client={convex} storage={secureStorage}>
        <CartProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.paper },
              headerShadowVisible: false,
              headerTintColor: colors.ink,
              headerTitleStyle: {
                fontFamily: fonts.serif,
                fontSize: 22,
                color: colors.ink,
              },
              headerBackButtonDisplayMode: "minimal",
              contentStyle: { backgroundColor: colors.paper },
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="product/[slug]" options={{ title: "" }} />
            <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
            <Stack.Screen name="payments" options={{ title: "Payments" }} />
            <Stack.Screen name="admin" options={{ title: "Store admin" }} />
            <Stack.Screen name="auth" options={{ title: "Sign in" }} />
          </Stack>
        </CartProvider>
      </ConvexAuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.paper,
  },
});
