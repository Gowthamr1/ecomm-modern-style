import { useQuery } from "convex/react";
import { router } from "expo-router";
import { ChevronRight, ReceiptText } from "lucide-react-native";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AppText } from "@/components/AppText";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { SignInPrompt } from "@/components/SignInPrompt";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { useAuth } from "@/lib/use-auth";
import { colors, fonts, radius, shadowSoft } from "@/lib/theme";

export default function OrdersScreen() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.pine} />
        </View>
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return (
      <Screen>
        <View style={styles.header}>
          <AppText variant="label" color={colors.muted}>
            Account
          </AppText>
          <AppText variant="h1">Your orders</AppText>
        </View>
        <ScrollView contentContainerStyle={styles.signedOutScroll}>
          <SignInPrompt
            title="Every receipt, in one place"
            description="Sign in to see order status, delivery details and demo payment receipts."
            returnTo="/orders"
          />
        </ScrollView>
      </Screen>
    );
  }

  return <OrdersList />;
}

function OrdersList() {
  const orders = useQuery(api.orders.listMine);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <AppText variant="label" color={colors.muted}>
            Account
          </AppText>
          <View style={styles.titleRow}>
            <AppText variant="h1">Your orders</AppText>
            {orders && orders.length > 0 ? (
              <View style={styles.countPill}>
                <AppText variant="small" color={colors.pine}>
                  {orders.length}
                </AppText>
              </View>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/payments")}
            style={({ pressed }) => [
              styles.paymentsLink,
              pressed && styles.pressed,
            ]}
          >
            <AppText variant="small" color={colors.pine}>
              View payment receipts
            </AppText>
            <ChevronRight size={14} color={colors.pine} strokeWidth={1.8} />
          </Pressable>
        </View>

        {orders === undefined ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.pine} />
          </View>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<ReceiptText size={23} color={colors.pine} strokeWidth={1.6} />}
            title="No orders yet"
            description="The first thing you buy will show up here, with its status and receipt."
            actionLabel="Browse the collection"
            onAction={() => router.push("/shop")}
          />
        ) : (
          <View style={styles.list}>
            {orders.map((order) => (
              <View key={order._id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardTopCopy}>
                    <AppText variant="title">{order.number}</AppText>
                    <AppText variant="small" color={colors.muted}>
                      {formatDate(order.createdAt)}
                    </AppText>
                  </View>
                  <StatusBadge status={order.status} />
                </View>

                <View style={styles.items}>
                  {order.items.map((item) => (
                    <Pressable
                      key={item.productId}
                      accessibilityRole="button"
                      onPress={() => router.push(`/product/${item.slug}`)}
                      style={({ pressed }) => [
                        styles.item,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Image
                        source={{ uri: item.image }}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                      <View style={styles.itemCopy}>
                        <AppText variant="bodyStrong" numberOfLines={1}>
                          {item.name}
                        </AppText>
                        <AppText variant="small" color={colors.muted}>
                          Qty {item.quantity} · {formatMoney(item.price)}
                        </AppText>
                      </View>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.meta}>
                  <View style={styles.metaRow}>
                    <AppText variant="small" color={colors.muted}>
                      Delivering to
                    </AppText>
                    <AppText variant="small" color={colors.inkSoft} style={styles.metaValue}>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.region ||
                        order.shippingAddress.country}
                    </AppText>
                  </View>
                  <View style={styles.metaRow}>
                    <AppText variant="small" color={colors.muted}>
                      Payment
                    </AppText>
                    <AppText variant="small" color={colors.inkSoft}>
                      {order.payment
                        ? `${order.payment.brand} ···· ${order.payment.last4}${
                            order.payment.status === "refunded"
                              ? " · Refunded"
                              : ""
                          }`
                        : "Demo card"}
                    </AppText>
                  </View>
                </View>

                <View style={styles.totalRow}>
                  <AppText variant="label" color={colors.muted}>
                    Total
                  </AppText>
                  <AppText variant="price" style={styles.total}>
                    {formatMoney(order.total)}
                  </AppText>
                </View>

                {order.status === "cancelled" ? (
                  <AppText variant="small" color={colors.danger} style={styles.cancelled}>
                    This order was cancelled and the demo payment refunded.
                  </AppText>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  countPill: {
    borderRadius: radius.pill,
    backgroundColor: colors.pineSoft,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginTop: 4,
  },
  paymentsLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  pressed: {
    opacity: 0.7,
  },
  scroll: {
    paddingBottom: 36,
  },
  signedOutScroll: {
    paddingBottom: 36,
  },
  center: {
    paddingVertical: 60,
    alignItems: "center",
  },
  list: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 14,
    ...shadowSoft,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTopCopy: {
    gap: 3,
  },
  items: {
    gap: 8,
    paddingTop: 2,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemImage: {
    width: 42,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.sand,
  },
  itemCopy: {
    flex: 1,
    gap: 2,
  },
  meta: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: 6,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  metaValue: {
    flexShrink: 1,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  total: {
    fontFamily: fonts.semibold,
    fontSize: 18,
  },
  cancelled: {
    lineHeight: 17,
  },
});
