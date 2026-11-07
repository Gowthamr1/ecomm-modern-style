import { Tabs } from "expo-router";
import {
  House,
  ReceiptText,
  ShoppingBag,
  Store,
  UserRound,
} from "lucide-react-native";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "@/lib/cart";
import { colors, fonts } from "@/lib/theme";

export default function TabsLayout() {
  const { count } = useCart();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.pine,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: 10,
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 58 + insets.bottom,
          paddingTop: 7,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <House size={21} color={color} strokeWidth={1.7} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color }) => (
            <Store size={21} color={color} strokeWidth={1.7} />
          ),
        }}
      />
      <Tabs.Screen
        name="bag"
        options={{
          title: "Bag",
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.pine,
            color: colors.paper,
            fontFamily: fonts.semibold,
            fontSize: 9,
          },
          tabBarIcon: ({ color }) => (
            <ShoppingBag size={21} color={color} strokeWidth={1.7} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <ReceiptText size={21} color={color} strokeWidth={1.7} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <UserRound size={21} color={color} strokeWidth={1.7} />
          ),
        }}
      />
    </Tabs>
  );
}

