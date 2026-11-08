import { useAuthActions } from "@convex-dev/auth/react";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { Check, Mail, ShieldCheck, UserRound } from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { Notice } from "@/components/Notice";
import { Page } from "@/components/Screen";
import { useAuth } from "@/lib/use-auth";
import { colors, fonts, radius, shadowSoft } from "@/lib/theme";

type Mode = "guest" | "email";

export default function AuthScreen() {
  const params = useLocalSearchParams<{ returnTo?: string }>();
  const returnTo =
    params.returnTo && params.returnTo.startsWith("/") ? params.returnTo : "/";
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useAuth();

  const [mode, setMode] = useState<Mode>("guest");
  const [guestLoading, setGuestLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [emailLoading, setEmailLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    // The sign-in screen is normally pushed from the screen that needs auth,
    // so returning preserves that screen. Deep links fall back to returnTo.
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(returnTo as Href);
    }
  }, [isAuthenticated, isLoading, returnTo]);

  async function handleGuest() {
    setError(null);
    setGuestLoading(true);
    try {
      await signIn("anonymous");
    } catch (cause) {
      setError(readError(cause, "Could not start a guest session."));
      setGuestLoading(false);
    }
  }

  async function sendCode() {
    const address = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(address)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setEmailLoading(true);
    try {
      await signIn("email-otp", { email: address });
      setStep("code");
    } catch (cause) {
      setError(readError(cause, "Could not send a sign-in code."));
    } finally {
      setEmailLoading(false);
    }
  }

  async function verifyCode() {
    if (code.trim().length < 4) {
      setError("Enter the six-digit code from your email.");
      return;
    }
    setError(null);
    setEmailLoading(true);
    try {
      await signIn("email-otp", { email: email.trim(), code: code.trim() });
    } catch (cause) {
      setError(readError(cause, "That code didn't match. Try again."));
      setEmailLoading(false);
    }
  }

  async function resendCode() {
    setError(null);
    setResending(true);
    try {
      await signIn("email-otp", { email: email.trim() });
    } catch (cause) {
      setError(readError(cause, "Could not resend the code."));
    } finally {
      setResending(false);
    }
  }

  if (isLoading || isAuthenticated) {
    return (
      <Page>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.pine} />
        </View>
      </Page>
    );
  }

  return (
    <Page>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppText variant="label" color={colors.muted}>
            Forma account
          </AppText>
          <AppText variant="h1" style={styles.title}>
            Keep your good things together.
          </AppText>
          <AppText style={styles.copy}>
            Sign in to check out, follow orders and keep your receipts. Demo
            store — no real money moves.
          </AppText>

          <View style={styles.segment}>
            <SegmentButton
              active={mode === "guest"}
              label="Guest"
              icon={
                <UserRound
                  size={15}
                  color={mode === "guest" ? colors.paper : colors.ink}
                  strokeWidth={1.8}
                />
              }
              onPress={() => {
                setError(null);
                setMode("guest");
              }}
            />
            <SegmentButton
              active={mode === "email"}
              label="Email"
              icon={
                <Mail
                  size={15}
                  color={mode === "email" ? colors.paper : colors.ink}
                  strokeWidth={1.8}
                />
              }
              onPress={() => {
                setError(null);
                setMode("email");
              }}
            />
          </View>

          {mode === "guest" ? (
            <View style={styles.card}>
              <View style={styles.icon}>
                <UserRound size={22} color={colors.pine} strokeWidth={1.6} />
              </View>
              <AppText variant="h2" style={styles.cardTitle}>
                Just here to browse?
              </AppText>
              <AppText style={styles.cardCopy}>
                A guest session is created on this device instantly. Your bag,
                orders and receipts stay available while you're signed in.
              </AppText>
              <View style={styles.benefits}>
                <Benefit text="No password, no email needed" />
                <Benefit text="Demo checkout in under a minute" />
                <Benefit text="Your details stay ready for next time" />
              </View>
              <Button
                label="Continue as guest"
                onPress={handleGuest}
                loading={guestLoading}
                fullWidth
                style={styles.action}
              />
              <AppText variant="small" color={colors.muted} style={styles.finePrint}>
                A guest account lives on this phone. Signing out and starting
                again creates a new one, so use email if you want to sign back
                in later.
              </AppText>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.icon}>
                <Mail size={22} color={colors.pine} strokeWidth={1.6} />
              </View>
              {step === "email" ? (
                <>
                  <AppText variant="h2" style={styles.cardTitle}>
                    Sign in with email
                  </AppText>
                  <AppText style={styles.cardCopy}>
                    We'll send a six-digit code. No password to remember, and
                    your account follows you to another device.
                  </AppText>
                  <Field
                    label="Email address"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    containerStyle={styles.field}
                    onSubmitEditing={sendCode}
                  />
                  <Button
                    label="Send sign-in code"
                    onPress={sendCode}
                    loading={emailLoading}
                    fullWidth
                    style={styles.action}
                  />
                </>
              ) : (
                <>
                  <AppText variant="h2" style={styles.cardTitle}>
                    Check your inbox
                  </AppText>
                  <AppText style={styles.cardCopy}>
                    We sent a six-digit code to{" "}
                    <AppText variant="bodyStrong">{email.trim()}</AppText>.
                  </AppText>
                  <Field
                    label="Six-digit code"
                    value={code}
                    onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    keyboardType="number-pad"
                    autoComplete="one-time-code"
                    maxLength={6}
                    containerStyle={styles.field}
                  />
                  <Button
                    label="Sign in"
                    onPress={verifyCode}
                    loading={emailLoading}
                    fullWidth
                    style={styles.action}
                  />
                  <View style={styles.emailActions}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={resendCode}
                      disabled={resending}
                    >
                      <AppText variant="small" color={colors.pine}>
                        {resending ? "Sending…" : "Resend code"}
                      </AppText>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setStep("email");
                        setCode("");
                        setError(null);
                      }}
                    >
                      <AppText variant="small" color={colors.muted}>
                        Change email
                      </AppText>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          )}

          {error ? <Notice message={error} /> : null}

          <View style={styles.secure}>
            <ShieldCheck size={15} color={colors.muted} strokeWidth={1.7} />
            <AppText variant="small" color={colors.muted} style={styles.secureText}>
              Sessions are stored in Android SecureStore. Payments are demo
              only.
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Page>
  );
}

function SegmentButton({
  active,
  label,
  icon,
  onPress,
}: {
  active: boolean;
  label: string;
  icon: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.segmentButton, active && styles.segmentActive]}
    >
      {icon}
      <AppText
        variant="small"
        color={active ? colors.paper : colors.ink}
        style={styles.segmentLabel}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <View style={styles.benefit}>
      <Check size={13} color={colors.pine} strokeWidth={2.2} />
      <AppText variant="small" color={colors.inkSoft} style={styles.benefitText}>
        {text}
      </AppText>
    </View>
  );
}

function readError(cause: unknown, fallback: string) {
  if (!(cause instanceof Error)) return fallback;
  const message = cause.message.trim();
  if (!message || message.length > 180) return fallback;
  return message;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },
  title: {
    marginTop: 6,
    maxWidth: 320,
  },
  copy: {
    color: colors.muted,
    marginTop: 10,
    lineHeight: 22,
    maxWidth: 340,
  },
  segment: {
    flexDirection: "row",
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.paperDeep,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 22,
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    height: 40,
    borderRadius: radius.pill,
  },
  segmentActive: {
    backgroundColor: colors.pine,
  },
  segmentLabel: {
    fontFamily: fonts.medium,
  },
  card: {
    marginTop: 16,
    padding: 22,
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
    marginBottom: 14,
  },
  cardTitle: {
    textAlign: "center",
  },
  cardCopy: {
    color: colors.muted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
    maxWidth: 300,
  },
  benefits: {
    alignSelf: "stretch",
    gap: 8,
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  benefit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  benefitText: {
    flex: 1,
  },
  action: {
    marginTop: 18,
  },
  finePrint: {
    textAlign: "center",
    marginTop: 12,
    lineHeight: 17,
    maxWidth: 300,
  },
  field: {
    alignSelf: "stretch",
    marginTop: 18,
  },
  emailActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "stretch",
    marginTop: 14,
  },
  secure: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginTop: 18,
    paddingHorizontal: 4,
  },
  secureText: {
    flex: 1,
    lineHeight: 17,
  },
});
