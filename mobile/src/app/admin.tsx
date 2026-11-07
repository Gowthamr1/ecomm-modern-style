import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import {
  Minus,
  Package,
  Plus,
  RefreshCcw,
  ShieldAlert,
  TrendingUp,
} from "lucide-react-native";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Notice } from "@/components/Notice";
import { Page } from "@/components/Screen";
import { SignInPrompt } from "@/components/SignInPrompt";
import { StatusBadge } from "@/components/StatusBadge";
import { api, type Product } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { useAuth } from "@/lib/use-auth";
import { colors, fonts, radius, shadowSoft } from "@/lib/theme";

export default function AdminScreen() {
  const { user, isLoading, isAuthenticated } = useAuth();

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
            title="Admin access"
            description="Sign in with the account that claimed the admin role to manage this demo store."
            returnTo="/admin"
          />
        </ScrollView>
      </Page>
    );
  }

  if (user?.role !== "admin") {
    return (
      <Page>
        <View style={styles.denied}>
          <View style={styles.deniedIcon}>
            <ShieldAlert size={26} color={colors.danger} strokeWidth={1.6} />
          </View>
          <AppText variant="h1" style={styles.deniedTitle}>
            Admins only
          </AppText>
          <AppText style={styles.deniedCopy}>
            This account is a customer. If the store has no admin yet, you can
            claim the role from your profile.
          </AppText>
          <Button
            label="Back to profile"
            variant="secondary"
            onPress={() => router.replace("/profile")}
            style={styles.deniedButton}
          />
        </View>
      </Page>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const orders = useQuery(api.orders.listAll);
  const payments = useQuery(api.payments.listAll);
  const products = useQuery(api.products.list);
  const updateStatus = useMutation(api.orders.updateStatus);
  const refund = useMutation(api.payments.refund);
  const updateProduct = useMutation(api.products.update);

  const [busyOrder, setBusyOrder] = useState<string | null>(null);
  const [busyPayment, setBusyPayment] = useState<string | null>(null);
  const [busyProduct, setBusyProduct] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lowStock = (products ?? []).filter((product) => product.stock <= 5);
  const revenue = (payments ?? [])
    .filter((payment) => payment.status === "succeeded")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const refunded = (payments ?? []).filter(
    (payment) => payment.status === "refunded",
  ).length;

  async function changeStatus(
    orderId: string,
    status: "shipped" | "delivered" | "cancelled",
  ) {
    setError(null);
    setBusyOrder(orderId);
    try {
      await updateStatus({ orderId, status });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update the order.");
    } finally {
      setBusyOrder(null);
    }
  }

  function confirmCancel(order: { _id: string; number: string }) {
    Alert.alert(
      `Cancel ${order.number}?`,
      "Items will be restocked and the demo payment refunded. This cannot be undone.",
      [
        { text: "Keep order", style: "cancel" },
        {
          text: "Cancel order",
          style: "destructive",
          onPress: () => changeStatus(order._id, "cancelled"),
        },
      ],
    );
  }

  async function refundPayment(paymentId: string) {
    setError(null);
    setBusyPayment(paymentId);
    try {
      await refund({ paymentId });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not refund the payment.");
    } finally {
      setBusyPayment(null);
    }
  }

  function confirmRefund(payment: { _id: string; reference: string }) {
    Alert.alert(
      "Refund this payment?",
      `Receipt ${payment.reference} will be marked refunded and any linked order cancelled and restocked.`,
      [
        { text: "Keep payment", style: "cancel" },
        {
          text: "Refund",
          style: "destructive",
          onPress: () => refundPayment(payment._id),
        },
      ],
    );
  }

  async function adjustStock(product: Product, delta: number) {
    const next = Math.max(0, product.stock + delta);
    if (next === product.stock) return;
    setError(null);
    setBusyProduct(product._id);
    try {
      await updateProduct({
        productId: product._id,
        name: product.name,
        category: product.category,
        tagline: product.tagline,
        description: product.description,
        price: product.price,
        ...(product.compareAtPrice !== undefined
          ? { compareAtPrice: product.compareAtPrice }
          : {}),
        image: product.image,
        material: product.material,
        stock: next,
        featured: product.featured,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update stock.");
    } finally {
      setBusyProduct(null);
    }
  }

  if (orders === undefined || payments === undefined || products === undefined) {
    return (
      <Page>
        <View style={styles.center}>
          <ActivityIndicator color={colors.pine} />
        </View>
      </Page>
    );
  }

  return (
    <Page>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <AppText variant="label" color={colors.muted}>
          Store overview
        </AppText>
        <AppText style={styles.intro}>
          Live demo data from the same Convex deployment as the web store.
        </AppText>

        <View style={styles.stats}>
          <Stat
            icon={<TrendingUp size={16} color={colors.pine} strokeWidth={1.7} />}
            label="Demo revenue"
            value={formatMoney(revenue)}
          />
          <Stat
            icon={<Package size={16} color={colors.pine} strokeWidth={1.7} />}
            label="Orders"
            value={String(orders.length)}
          />
          <Stat
            icon={<ShieldAlert size={16} color={colors.pine} strokeWidth={1.7} />}
            label="Low stock"
            value={String(lowStock.length)}
          />
          <Stat
            icon={<RefreshCcw size={16} color={colors.pine} strokeWidth={1.7} />}
            label="Refunds"
            value={String(refunded)}
          />
        </View>

        {error ? <Notice message={error} /> : null}

        <SectionTitle title="Orders" note="Manage fulfilment" />
        {orders.length === 0 ? (
          <EmptyLine text="No orders yet. They'll appear here as soon as a shopper checks out." />
        ) : (
          <View style={styles.list}>
            {orders.slice(0, 10).map((order) => {
              const busy = busyOrder === order._id;
              return (
                <View key={order._id} style={styles.orderCard}>
                  <View style={styles.orderTop}>
                    <View style={styles.orderCopy}>
                      <AppText variant="title">{order.number}</AppText>
                      <AppText variant="small" color={colors.muted}>
                        {order.customer?.name ?? "Guest customer"} ·{" "}
                        {formatDate(order.createdAt)}
                      </AppText>
                    </View>
                    <StatusBadge status={order.status} />
                  </View>
                  <View style={styles.orderMid}>
                    <AppText variant="small" color={colors.muted}>
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                      {order.items.length === 1 ? "item" : "items"} ·{" "}
                      {order.shippingAddress.city}
                    </AppText>
                    <AppText variant="price">{formatMoney(order.total)}</AppText>
                  </View>
                  {order.status !== "cancelled" ? (
                    <View style={styles.orderActions}>
                      {order.status === "paid" ? (
                        <Button
                          label="Mark shipped"
                          size="sm"
                          variant="secondary"
                          loading={busy}
                          onPress={() => changeStatus(order._id, "shipped")}
                        />
                      ) : order.status === "shipped" ? (
                        <Button
                          label="Mark delivered"
                          size="sm"
                          variant="secondary"
                          loading={busy}
                          onPress={() => changeStatus(order._id, "delivered")}
                        />
                      ) : (
                        <AppText variant="small" color={colors.muted}>
                          Delivered
                        </AppText>
                      )}
                      {order.status !== "delivered" ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => confirmCancel(order)}
                          style={({ pressed }) => [
                            styles.cancelLink,
                            pressed && styles.pressed,
                          ]}
                        >
                          <AppText variant="small" color={colors.danger}>
                            Cancel & refund
                          </AppText>
                        </Pressable>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        <SectionTitle title="Payments" note="Refund demo charges" />
        {payments.length === 0 ? (
          <EmptyLine text="No demo payments yet." />
        ) : (
          <View style={styles.list}>
            {payments.slice(0, 6).map((payment) => (
              <View key={payment._id} style={styles.paymentRow}>
                <View style={styles.paymentCopy}>
                  <AppText variant="bodyStrong">
                    {payment.brand} ···· {payment.last4}
                  </AppText>
                  <AppText variant="small" color={colors.muted}>
                    {payment.customer?.name ?? "Guest"} ·{" "}
                    {formatDate(payment.createdAt)} · {payment.reference}
                  </AppText>
                </View>
                <View style={styles.paymentRight}>
                  <AppText variant="price">{formatMoney(payment.amount)}</AppText>
                  {payment.status === "refunded" ? (
                    <StatusBadge status="refunded" />
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => confirmRefund(payment)}
                      disabled={busyPayment === payment._id}
                    >
                      <AppText variant="small" color={colors.danger}>
                        {busyPayment === payment._id ? "Refunding…" : "Refund"}
                      </AppText>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <SectionTitle title="Inventory" note={`${lowStock.length} need attention`} />
        <View style={styles.list}>
          {products.map((product) => (
            <View key={product._id} style={styles.stockRow}>
              <View style={styles.stockCopy}>
                <AppText variant="bodyStrong" numberOfLines={1}>
                  {product.name}
                </AppText>
                <AppText variant="small" color={colors.muted}>
                  {formatMoney(product.price)} · {product.category}
                </AppText>
              </View>
              <View style={styles.stockControl}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Decrease stock for ${product.name}`}
                  disabled={product.stock <= 0 || busyProduct === product._id}
                  onPress={() => adjustStock(product, -1)}
                  style={styles.stockButton}
                >
                  <Minus size={14} color={colors.ink} strokeWidth={1.9} />
                </Pressable>
                <AppText style={styles.stockValue}>
                  {busyProduct === product._id ? "…" : product.stock}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Increase stock for ${product.name}`}
                  disabled={busyProduct === product._id}
                  onPress={() => adjustStock(product, 1)}
                  style={styles.stockButton}
                >
                  <Plus size={14} color={colors.ink} strokeWidth={1.9} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
        <AppText variant="small" color={colors.muted} style={styles.footnote}>
          Stock can be adjusted here. Creating and editing full product details
          remains available in the web admin.
        </AppText>
      </ScrollView>
    </Page>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statTop}>
        <View style={styles.statIcon}>{icon}</View>
        <AppText variant="label" color={colors.muted} style={styles.statLabel}>
          {label}
        </AppText>
      </View>
      <AppText variant="price" style={styles.statValue} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

function SectionTitle({ title, note }: { title: string; note: string }) {
  return (
    <View style={styles.sectionTitle}>
      <AppText variant="h2">{title}</AppText>
      <AppText variant="small" color={colors.muted}>
        {note}
      </AppText>
    </View>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <View style={styles.emptyLine}>
      <AppText variant="small" color={colors.muted}>
        {text}
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
    marginTop: 6,
    lineHeight: 20,
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  stat: {
    width: "47.5%",
    flexGrow: 1,
    padding: 13,
    gap: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    ...shadowSoft,
  },
  statTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.pineSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: fonts.semibold,
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 30,
    marginBottom: 12,
  },
  list: {
    gap: 9,
  },
  orderCard: {
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 11,
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  orderCopy: {
    flex: 1,
    gap: 2,
  },
  orderMid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  orderActions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  cancelLink: {
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.6,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  paymentCopy: {
    flex: 1,
    gap: 2,
  },
  paymentRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  stockCopy: {
    flex: 1,
    gap: 2,
  },
  stockControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    padding: 3,
    backgroundColor: colors.paper,
  },
  stockButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.paperDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  stockValue: {
    minWidth: 30,
    textAlign: "center",
    fontFamily: fonts.semibold,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  footnote: {
    marginTop: 14,
    lineHeight: 18,
  },
  emptyLine: {
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  denied: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  deniedIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  deniedTitle: {
    textAlign: "center",
  },
  deniedCopy: {
    color: colors.muted,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },
  deniedButton: {
    marginTop: 22,
  },
});
