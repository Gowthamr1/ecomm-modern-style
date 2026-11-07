import type { TokenStorage } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const extra = Constants.expoConfig?.extra as { convexUrl?: string } | undefined;

export const CONVEX_URL =
  process.env.EXPO_PUBLIC_CONVEX_URL ??
  extra?.convexUrl ??
  "https://secret-capybara-607.convex.cloud";

export const convex = new ConvexReactClient(CONVEX_URL, {
  unsavedChangesWarning: false,
});

/** Convex Auth needs an explicit storage adapter on React Native. */
export const secureStorage: TokenStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};
