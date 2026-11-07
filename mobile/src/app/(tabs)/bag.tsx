import { router } from "expo-router";
import { ChevronRight, ShoppingBag, X } from "lucide-react-native";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { QtyStepper } from "@/components/QtyStepper";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/lib/use-auth";
import { useCart } from "@/lib/cart";
import {
  FREE_SHIPPING_THRESHOLD,
  formatMoney,
  orderSummary,
} from "@/lib/format";
import { colors, fonts, radius } from "@/lib/theme";

export default function BagScreen() {
  const { lines, count, subtotal, isReady, setQuantity, remove } = useCart();
  const { isAuthenticated } = useAuth();
  const summary = orderSummary(subtotal);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress =
    subtotal >= FREE_SHIPPING_THRESHOLD
      ? 1
      : subtotal / FREE_SHIPPING_THRESHOLD;

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <AppText variant="label" color={colors.muted}>
            Order
          </AppText>
          <AppText variant="h1">Your bag</AppText>
        </View>
        <View style={styles.countPill}>
          <AppText variant="small" color={colors.pine}>
            {count} {count === 1 ? "item" : "items"}
          </AppText>
        </View>
      </View>

      {!isReady ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.pine} />
        </View>
      ) : lines.length === 0 ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <EmptyState
            icon={<ShoppingBag size={23} color={colors.pine} strokeWidth={1.6} />}
            title="Your bag is quiet"
            description="Add a considered piece or two and they'll wait for you here."
            actionLabel="Browse the collection"
            onAction={() => router.push("/shop")}
          />
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.shippingCard}>
            <AppText variant="small" color={colors.inkSoft}>
              {remaining > 0
                ? `${formatMoney(remaining)} away from free shipping`
                : "Free shipping unlocked"}
            </AppText>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress * 100}%` }]} />
            </View>
          </View>

          <View style={styles.lines}>
            {lines.map((line) => (
              <View key={line.productId} style={styles.line}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(`/product/${line.slug}`)}
                >
                  <Image
                    source={{ uri: line.image }}
                    style={styles.lineImage}
                    resizeMode="cover"
                  />
                </Pressable>
                <View style={styles.lineBody}>
                  <View style={styles.lineTop}>
                    <Pressable
                      accessibilityRole="button"
                      style={styles.lineNameWrap}
                      onPress={() => router.push(`/product/${line.slug}`)}
                    >
                      <AppText variant="title" numberOfLines={2}>
                        {line.name}
                      </AppText>
                      <AppText variant="small" color={colors.muted}>
                        {formatMoney(line.price)} each
                      </AppText>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${line.name}`}
                      onPress={() => remove(line.productId)}
                      hitSlop={10}
                    >
                      <X size={15} color={colors.muted} strokeWidth={1.8} />
                    </Pressable>
                  </View>
                  <View style={styles.lineBottom}>
                    <QtyStepper
                      value={line.quantity}
                      min={1}
                      onChange={(value) => setQuantity(line.productId, value)}
                      compact
                    />
                    <AppText variant="price">
                      {formatMoney(line.price * line.quantity)}
                    </AppText>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.summary}>
            <AppText variant="label" color={colors.muted}>
              Summary
            </AppText>
            <SummaryRow label="Subtotal" value={formatMoney(summary.subtotal)} />
            <SummaryRow
              label="Shipping"
              value={
                summary.shipping === 0 ? "Free" : formatMoney(summary.shipping)
              }
            />
            <SummaryRow
              label="Tax (8%)"
              value={formatMoney(summary.tax)}
            />
            <View style={styles.rule} />
            <View style={styles.totalRow}>
              <AppText variant="title">Total</AppText>
              <AppText variant="price" style={styles.total}>
                {formatMoney(summary.total)}
              </AppText>
            </View>
          </View>

          <Button
            label="Checkout"
            onPress={() => router.push("/checkout")}
            fullWidth
            icon={<ChevronRight size={16} color={colors.paper} strokeWidth={2} />}
            style={styles.checkout}
          />
          <AppText variant="small" color={colors.muted} style={styles.demoNote}>
            {isAuthenticated
              ? "Demo checkout · no real money moves"
              : "You'll be asked to sign in before checkout"}
          </AppText>
          <Button
            label="Continue shopping"
            variant="ghost"
            onPress={() => router.push("/shop")}
            fullWidth
            style={styles.continue}
          />
        </ScrollView>
      )}
    </Screen>
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

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  countPill: {
    borderRadius: radius.pill,
    backgroundColor: colors.pineSoft,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginBottom: 3,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  shippingCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.paperDeep,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.pine,
    borderRadius: 3,
  },
  lines: {
    marginTop: 18,
    gap: 10,
  },
  line: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  lineImage: {
    width: 82,
    height: 96,
    borderRadius: radius.md,
    backgroundColor: colors.sand,
  },
  lineBody: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  lineTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  lineNameWrap: {
    flex: 1,
    gap: 2,
  },
  lineBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  summary: {
    marginTop: 20,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  total: {
    fontSize: 19,
    lineHeight: 24,
    fontFamily: fonts.semibold,
  },
  checkout: {
    marginTop: 16,
  },
  demoNote: {
    textAlign: "center",
    marginTop: 9,
  },
  continue: {
    marginTop: 8,
  },
});
