import { useAuthActions } from "@convex-dev/auth/react";
import { router } from "expo-router";
import { UserRound } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius, shadowSoft } from "@/lib/theme";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { Notice } from "./Notice";

type Props = {
  title: string;
  description: string;
  returnTo: string;
};

export function SignInPrompt({ title, description, returnTo }: Props) {
  const { signIn } = useAuthActions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGuest() {
    setError(null);
    setLoading(true);
    try {
      await signIn("anonymous");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not start a guest session. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <UserRound size={22} color={colors.pine} strokeWidth={1.6} />
      </View>
      <AppText variant="h2" style={styles.title}>
        {title}
      </AppText>
      <AppText style={styles.description}>{description}</AppText>

      <Button
        label="Continue as guest"
        onPress={handleGuest}
        loading={loading}
        fullWidth
        style={styles.primary}
      />
      <Button
        label="Use email instead"
        variant="secondary"
        onPress={() =>
          router.push({ pathname: "/auth", params: { returnTo } })
        }
        fullWidth
      />

      <AppText variant="small" color={colors.muted} style={styles.note}>
        Guest sessions are saved on this device. Use email if you want your
        orders on another phone.
      </AppText>

      {error ? <Notice tone="error" message={error} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    ...shadowSoft,
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
    marginBottom: 22,
    textAlign: "center",
    color: colors.muted,
    maxWidth: 290,
  },
  primary: {
    marginBottom: 10,
  },
  note: {
    marginTop: 14,
    textAlign: "center",
    maxWidth: 290,
  },
});
