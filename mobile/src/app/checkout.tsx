import { useMutation } from "convex/react";
import { router } from "expo-router";
import {
  Check,
  CreditCard,
  Lock,
  ShoppingBag,
  Sparkles,
} from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Field } from "@/components/Field";
import { Notice } from "@/components/Notice";
import { Page } from "@/components/Screen";
import { SignInPrompt } from "@/components/SignInPrompt";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { useCart } from "@/lib/cart";
import {
  cardBrand,
  digitsOnly,
  formatCardNumber,
  formatExpiry,
  formatMoney,
  orderSummary,
} from "@/lib/format";
import { colors, fonts, radius, shadowSoft } from "@/lib/theme";

type Confirmation = { number: string; total: number };

export default function CheckoutScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { lines, subtotal, isReady, clear } = useCart();
  const checkout = useMutation(api.orders.checkout);

  const [fullName, setFullName] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const summary = orderSummary(subtotal);

  useEffect(() => {
    if (!user?.name) return;
    const name = user.name;
    setFullName((current) => current || name);
    setCardName((current) => current || name);
  }, [user?.name]);


  function fillDemoCard() {
    setCardName(fullName || user?.name || "Alex Morgan");
    setCardNumber("4242 4242 4242 4242");
    setExpiry("12/28");
    setCvc("123");
  }

  async function placeOrder() {
    setError(null);

    if (!fullName.trim() || !line1.trim() || !city.trim() || !postalCode.trim()) {
      setError("Please complete the shipping address.");
      return;
    }
    const digits = digitsOnly(cardNumber);
    if (digits.length !== 16) {
      setError("Enter the 16-digit demo card number.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError("Enter the expiry as MM/YY.");
      return;
    }
    if (digitsOnly(cvc).length < 3) {
      setError("Enter the three-digit security code.");
      return;
    }

    setPending(true);
    try {
      const result = await checkout({
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
        cardName: cardName.trim() || fullName.trim(),
        brand: cardBrand(cardNumber),
        last4: digits.slice(-4),
        address: {
          fullName: fullName.trim(),
          line1: line1.trim(),
          city: city.trim(),
          region: region.trim(),
          postalCode: postalCode.trim(),
          country: country.trim() || "United States",
        },
      });
      clear();
      setConfirmation({ number: result.number, total: result.total });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The demo payment could not be completed.",
      );
      setPending(false);
    }
  }

  if (isLoading) {
    return (
      <Page>
        <View style={styles.center}>
          <ActivityIndicator color={colors.pine} />
        </View>
      </Page>
    );
  }

  if (!isAuthenticated) {
    return (
      <Page>
        <ScrollView contentContainerStyle={styles.scroll}>
          <SignInPrompt
            title="Sign in to check out"
            description="Your bag is saved on this device. Sign in to place the order and keep the receipt."
            returnTo="/checkout"
          />
        </ScrollView>
      </Page>
    );
  }

  if (confirmation) {
    return (
      <Page>
        <ScrollView contentContainerStyle={styles.confirmScroll}>
          <View style={styles.successIcon}>
            <Check size={30} color={colors.paper} strokeWidth={2.2} />
          </View>
          <AppText variant="label" color={colors.pine} style={styles.confirmKicker}>
            Order confirmed
          </AppText>
          <AppText variant="display" style={styles.confirmTitle}>
            It's on its way.
          </AppText>
          <AppText style={styles.confirmCopy}>
            Thanks — this was a demo order, so no money moved. We've saved the
            receipt to your account.
          </AppText>

          <View style={styles.confirmCard}>
            <ConfirmRow label="Order number" value={confirmation.number} />
            <ConfirmRow label="Total" value={formatMoney(confirmation.total)} />
            <ConfirmRow label="Payment" value="Demo card · 4242" />
          </View>

          <Button
            label="View your orders"
            onPress={() => router.replace("/orders")}
            fullWidth
            style={styles.confirmAction}
          />
          <Button
            label="Keep shopping"
            variant="secondary"
            onPress={() => router.replace("/shop")}
            fullWidth
          />
        </ScrollView>
      </Page>
    );
  }

  if (!isReady) {
    return (
      <Page>
        <View style={styles.center}>
          <ActivityIndicator color={colors.pine} />
        </View>
      </Page>
    );
  }

  if (lines.length === 0) {
    return (
      <Page>
        <EmptyState
          icon={<ShoppingBag size={23} color={colors.pine} strokeWidth={1.6} />}
          title="Nothing to check out"
          description="Your bag is empty. Add a piece from the collection first."
          actionLabel="Browse the shop"
          onAction={() => router.replace("/shop")}
        />
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
          <View style={styles.demoBanner}>
            <Sparkles size={15} color={colors.pine} strokeWidth={1.8} />
            <AppText variant="small" color={colors.pine} style={styles.demoText}>
              Demo checkout — use any valid-looking details. Nothing is charged.
            </AppText>
          </View>

          <Section title="Contact">
            <AppText variant="small" color={colors.muted}>
              Signed in as {user?.email ?? user?.name ?? "guest"}
            </AppText>
          </Section>

          <Section title="Shipping address">
            <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Alex Morgan" autoComplete="name" />
            <Field label="Address" value={line1} onChangeText={setLine1} placeholder="14 Alder Lane" autoComplete="street-address" />
            <View style={styles.twoCol}>
              <Field
                label="City"
                value={city}
                onChangeText={setCity}
                placeholder="Portland"
                containerStyle={styles.col}
              />
              <Field
                label="State"
                value={region}
                onChangeText={setRegion}
                placeholder="OR"
                autoCapitalize="characters"
                containerStyle={styles.col}
              />
            </View>
            <View style={styles.twoCol}>
              <Field
                label="Postal code"
                value={postalCode}
                onChangeText={setPostalCode}
                placeholder="97205"
                keyboardType="number-pad"
                containerStyle={styles.col}
              />
              <Field
                label="Country"
                value={country}
                onChangeText={setCountry}
                placeholder="United States"
                containerStyle={styles.col}
              />
            </View>
          </Section>

          <Section title="Payment">
            <View style={styles.cardHead}>
              <View style={styles.cardBadge}>
                <CreditCard size={16} color={colors.pine} strokeWidth={1.7} />
              </View>
              <View style={styles.cardHeadCopy}>
                <AppText variant="title">Demo card</AppText>
                <AppText variant="small" color={colors.muted}>
                  Test card 4242 4242 4242 4242
                </AppText>
              </View>
              <Button
                label="Autofill"
                variant="ghost"
                size="sm"
                onPress={fillDemoCard}
                style={styles.autofill}
              />
            </View>
            <Field label="Name on card" value={cardName} onChangeText={setCardName} placeholder="Alex Morgan" autoComplete="cc-name" />
            <Field
              label="Card number"
              value={cardNumber}
              onChangeText={(value) => setCardNumber(formatCardNumber(value))}
              placeholder="4242 4242 4242 4242"
              keyboardType="number-pad"
              autoComplete="cc-number"
              maxLength={19}
            />
            <View style={styles.twoCol}>
              <Field
                label="Expiry"
                value={expiry}
                onChangeText={(value) => setExpiry(formatExpiry(value))}
                placeholder="MM/YY"
                keyboardType="number-pad"
                maxLength={5}
                containerStyle={styles.col}
              />
              <Field
                label="CVC"
                value={cvc}
                onChangeText={(value) => setCvc(digitsOnly(value).slice(0, 4))}
                placeholder="123"
                keyboardType="number-pad"
                maxLength={4}
                containerStyle={styles.col}
              />
            </View>
            <View style={styles.lockRow}>
              <Lock size={13} color={colors.muted} strokeWidth={1.7} />
              <AppText variant="small" color={colors.muted}>
                Only the card brand and last four digits are stored.
              </AppText>
            </View>
          </Section>

          <Section title="Summary">
            {lines.map((line) => (
              <View key={line.productId} style={styles.summaryLine}>
                <AppText variant="small" color={colors.inkSoft} style={styles.summaryName} numberOfLines={1}>
                  {line.quantity} × {line.name}
                </AppText>
                <AppText variant="small" color={colors.muted}>
                  {formatMoney(line.price * line.quantity)}
                </AppText>
              </View>
            ))}
            <View style={styles.summaryRule} />
            <SummaryRow label="Subtotal" value={formatMoney(summary.subtotal)} />
            <SummaryRow
              label="Shipping"
              value={summary.shipping === 0 ? "Free" : formatMoney(summary.shipping)}
            />
            <SummaryRow label="Tax (8%)" value={formatMoney(summary.tax)} />
            <View style={styles.summaryRule} />
            <View style={styles.totalRow}>
              <AppText variant="title">Total</AppText>
              <AppText variant="price" style={styles.total}>
                {formatMoney(summary.total)}
              </AppText>
            </View>
          </Section>

          {error ? <Notice message={error} /> : null}

          <Button
            label={`Pay ${formatMoney(summary.total)} (demo)`}
            onPress={placeOrder}
            loading={pending}
            fullWidth
            style={styles.payButton}
          />
          <AppText variant="small" color={colors.muted} style={styles.terms}>
            Demo payment only. No real card is charged and no money moves.
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </Page>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="label" color={colors.muted}>
        {title}
      </AppText>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <AppText variant="small" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="bodyStrong">{value}</AppText>
    </View>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.confirmRow}>
      <AppText variant="small" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="bodyStrong">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  demoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.pineSoft,
    borderRadius: radius.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  demoText: { flex: 1, lineHeight: 17 },
  section: { marginTop: 20, gap: 8 },
  sectionCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 16,
    gap: 13,
    ...shadowSoft,
  },
  twoCol: { flexDirection: "row", gap: 10 },
  col: { flex: 1 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.pineSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeadCopy: { flex: 1, gap: 1 },
  autofill: { paddingHorizontal: 8 },
  lockRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryName: { flex: 1 },
  summaryRule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  total: { fontFamily: fonts.semibold, fontSize: 19, lineHeight: 24 },
  payButton: { marginTop: 20 },
  terms: { textAlign: "center", marginTop: 10 },
  confirmScroll: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 36,
    alignItems: "center",
  },
  successIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.pine,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  confirmKicker: { marginBottom: 6 },
  confirmTitle: { textAlign: "center" },
  confirmCopy: {
    color: colors.muted,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
    maxWidth: 310,
  },
  confirmCard: {
    alignSelf: "stretch",
    marginTop: 24,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 12,
    ...shadowSoft,
  },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  confirmAction: { marginTop: 24, marginBottom: 10 },
});
