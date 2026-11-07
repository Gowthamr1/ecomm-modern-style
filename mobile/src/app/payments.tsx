import { useQuery } from "convex/react";
import { CreditCard, ReceiptText } from "lucide-react-native";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AppText } from "@/components/AppText";
import { EmptyState } from "@/components/EmptyState";
import { Page } from "@/components/Screen";
import { SignInPrompt } from "@/components/SignInPrompt";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { useAuth } from "@/lib/use-auth";
import { colors, fonts, radius, shadowSoft } from "@/lib/theme";

export default function PaymentsScreen() {
  const { isLoading, isAuthenticated } = useAuth();

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
            title="Your receipts, kept safe"
            description="Sign in to see every demo payment, its reference and its refund status."
            returnTo="/payments"
          />
        </ScrollView>
      </Page>
    );
  }

  return <PaymentsList />;
}

function PaymentsList() {
  const payments = useQuery(api.payments.listMine);

  const succeeded = (payments ?? []).filter(
    (payment) => payment.status === "succeeded",
  );
  const refunded = (payments ?? []).filter(
    (payment) => payment.status === "refunded",
  );
  const paid = succeeded.reduce((sum, payment) => sum + payment.amount, 0);
  const returned = refunded.reduce((sum, payment) => sum + payment.amount, 0);
  const card = (payments ?? []).find((payment) => payment.last4);

  return (
    <Page>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <AppText variant="label" color={colors.muted}>
          Account
        </AppText>
        <AppText style={styles.intro}>
          Receipts from the demo checkout. Every payment runs in test mode, so
          no money ever moves.
        </AppText>

        <View style={styles.stats}>
          <Stat label="Paid (demo)" value={formatMoney(paid)} />
          <Stat label="Refunded" value={formatMoney(returned)} />
          <Stat
            label="Card"
            value={card ? `···· ${card.last4}` : "None"}
          />
        </View>

        {payments === undefined ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.pine} />
          </View>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={<ReceiptText size={23} color={colors.pine} strokeWidth={1.6} />}
            title="No payments yet"
            description="Your demo receipts will appear here after you check out."
          />
        ) : (
          <View style={styles.list}>
            <AppText variant="label" color={colors.muted} style={styles.listLabel}>
              Receipts
            </AppText>
            {payments.map((payment) => (
              <View key={payment._id} style={styles.receipt}>
                <View style={styles.receiptTop}>
                  <View style={styles.brandMark}>
                    <CreditCard size={17} color={colors.pine} strokeWidth={1.7} />
                  </View>
                  <View style={styles.receiptCopy}>
                    <AppText variant="title">
                      {payment.brand} ···· {payment.last4}
                    </AppText>
                    <AppText variant="small" color={colors.muted}>
                      {formatDate(payment.createdAt)} · {payment.method}
                    </AppText>
                  </View>
                  <StatusBadge status={payment.status} />
                </View>
                <View style={styles.receiptBottom}>
                  <View>
                    <AppText variant="label" color={colors.muted}>
                      Reference
                    </AppText>
                    <AppText variant="small" color={colors.inkSoft}>
                      {payment.reference}
                    </AppText>
                  </View>
                  <View style={styles.amountWrap}>
                    <AppText variant="label" color={colors.muted}>
                      Amount
                    </AppText>
                    <AppText variant="price" style={styles.amount}>
                      {formatMoney(payment.amount)}
                    </AppText>
                  </View>
                </View>
                {payment.status === "refunded" ? (
                  <AppText variant="small" color={colors.muted}>
                    Refunded in full to the demo card.
                  </AppText>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Page>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="label" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="price" style={styles.statValue}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  intro: {
    color: colors.muted,
    marginTop: 8,
    lineHeight: 21,
    maxWidth: 340,
  },
  stats: {
    flexDirection: "row",
    gap: 9,
    marginTop: 20,
  },
  stat: {
    flex: 1,
    gap: 4,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  statValue: {
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  loading: {
    paddingVertical: 60,
    alignItems: "center",
  },
  list: {
    marginTop: 26,
    gap: 10,
  },
  listLabel: {
    marginBottom: 2,
  },
  receipt: {
    padding: 15,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 13,
    ...shadowSoft,
  },
  receiptTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.pineSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  receiptCopy: {
    flex: 1,
    gap: 2,
  },
  receiptBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  amountWrap: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 17,
  },
});
