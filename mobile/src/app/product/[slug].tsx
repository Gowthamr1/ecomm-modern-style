import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowRight,
  Check,
  PackageCheck,
  RotateCcw,
  Star,
} from "lucide-react-native";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ProductTile } from "@/components/ProductTile";
import { QtyStepper } from "@/components/QtyStepper";
import { Screen } from "@/components/Screen";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { useCatalog } from "@/lib/use-catalog";
import { colors, fonts, radius, shadowSoft } from "@/lib/theme";

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { products, isLoading } = useCatalog();
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = (products ?? []).find((item) => item.slug === slug);

  if (isLoading) {
    return (
      <Screen edges={["bottom"]}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.pine} />
        </View>
      </Screen>
    );
  }

  if (!product) {
    return (
      <Screen edges={["bottom"]}>
        <EmptyState
          title="This piece has moved on"
          description="It may have sold out or left the collection. There are plenty more to see."
          actionLabel="Back to the shop"
          onAction={() => router.replace("/shop")}
        />
      </Screen>
    );
  }

  const soldOut = product.stock <= 0;
  const onSale =
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price;
  const maxQuantity = Math.min(10, Math.max(product.stock, 1));
  const related = (products ?? [])
    .filter(
      (item) => item.category === product.category && item._id !== product._id,
    )
    .slice(0, 4);

  function handleAdd(buyNow = false) {
    if (!product) return;
    add(
      {
        productId: product._id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      quantity,
    );
    setAdded(true);
    if (buyNow) {
      router.push("/checkout");
      return;
    }
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <Screen edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.badges}>
            {product.featured ? (
              <View style={styles.badgeDark}>
                <AppText variant="label" color={colors.paper}>
                  Studio pick
                </AppText>
              </View>
            ) : null}
            {onSale ? (
              <View style={styles.badgeSale}>
                <AppText variant="label" color={colors.pineDeep}>
                  On sale
                </AppText>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.kickerRow}>
            <AppText variant="label" color={colors.pine}>
              {product.category}
            </AppText>
            <View style={styles.rating}>
              <Star
                size={12}
                color={colors.gold}
                fill={colors.gold}
                strokeWidth={0}
              />
              <AppText variant="small" color={colors.muted}>
                {product.rating.toFixed(1)} · {product.reviewCount} reviews
              </AppText>
            </View>
          </View>

          <AppText variant="h1" style={styles.name}>
            {product.name}
          </AppText>
          <AppText style={styles.tagline}>{product.tagline}</AppText>

          <View style={styles.priceRow}>
            <AppText variant="price" style={styles.price}>
              {formatMoney(product.price)}
            </AppText>
            {onSale ? (
              <AppText style={styles.compare}>
                {formatMoney(product.compareAtPrice!)}
              </AppText>
            ) : null}
            <View style={styles.stockPill}>
              <View
                style={[
                  styles.stockDot,
                  { backgroundColor: soldOut ? colors.danger : colors.pine },
                ]}
              />
              <AppText variant="small" color={soldOut ? colors.danger : colors.pine}>
                {soldOut
                  ? "Sold out"
                  : product.stock <= 5
                    ? `Only ${product.stock} left`
                    : "In stock"}
              </AppText>
            </View>
          </View>

          <AppText style={styles.description}>{product.description}</AppText>

          <View style={styles.detailCard}>
            <DetailRow label="Material" value={product.material} />
            <DetailRow label="Category" value={product.category} />
            <DetailRow
              label="Reference"
              value={`FM-${product._id.slice(-6).toUpperCase()}`}
            />
          </View>

          <View style={styles.serviceRow}>
            <Service
              icon={<PackageCheck size={16} color={colors.pine} strokeWidth={1.6} />}
              text="Free shipping over $75"
            />
            <Service
              icon={<RotateCcw size={16} color={colors.pine} strokeWidth={1.6} />}
              text="30-day returns"
            />
          </View>

          {!soldOut ? (
            <View style={styles.buyBlock}>
              <View style={styles.qtyRow}>
                <AppText variant="label" color={colors.muted}>
                  Quantity
                </AppText>
                <QtyStepper
                  value={quantity}
                  onChange={setQuantity}
                  max={maxQuantity}
                />
              </View>
              <Button
                label={added ? "Added to bag" : "Add to bag"}
                onPress={() => handleAdd(false)}
                fullWidth
                icon={
                  added ? (
                    <Check size={16} color={colors.paper} strokeWidth={2.2} />
                  ) : undefined
                }
              />
              <Button
                label="Buy it now"
                variant="secondary"
                onPress={() => handleAdd(true)}
                fullWidth
                style={styles.buyNow}
                icon={<ArrowRight size={15} color={colors.ink} strokeWidth={1.8} />}
              />
            </View>
          ) : (
            <View style={styles.soldOutCard}>
              <AppText variant="title">Currently sold out</AppText>
              <AppText variant="small" color={colors.muted} style={styles.soldOutCopy}>
                This piece returns to the studio soon. Browse the rest of the
                collection in the meantime.
              </AppText>
              <Button
                label="See similar pieces"
                variant="secondary"
                size="sm"
                onPress={() => router.push("/shop")}
                style={styles.soldOutButton}
              />
            </View>
          )}

          <View style={styles.shippingNote}>
            <AppText variant="label" color={colors.muted}>
              Shipping & returns
            </AppText>
            <AppText variant="small" color={colors.inkSoft} style={styles.shippingCopy}>
              Orders leave the studio within two working days. Shipping is free
              over $75, otherwise a flat $9. Returns are accepted within 30 days
              in original condition.
            </AppText>
          </View>
        </View>

        {related.length > 0 ? (
          <View style={styles.related}>
            <View style={styles.relatedHead}>
              <AppText variant="h2">Pairs well with</AppText>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/shop")}
                style={styles.relatedLink}
              >
                <AppText variant="small" color={colors.pine}>
                  See all
                </AppText>
              </Pressable>
            </View>
            <FlatList
              horizontal
              data={related}
              keyExtractor={(item) => item._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedList}
              renderItem={({ item }) => (
                <ProductTile
                  product={item}
                  width={200}
                  onPress={() => router.push(`/product/${item.slug}`)}
                />
              )}
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <AppText variant="small" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="bodyStrong" style={styles.detailValue}>
        {value}
      </AppText>
    </View>
  );
}

function Service({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <View style={styles.service}>
      {icon}
      <AppText variant="small" color={colors.inkSoft} style={styles.serviceText}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingBottom: 40,
  },
  imageWrap: {
    backgroundColor: colors.sand,
  },
  image: {
    width: "100%",
    height: 390,
  },
  badges: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    gap: 8,
  },
  badgeDark: {
    backgroundColor: "rgba(22,39,31,0.85)",
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  badgeSale: {
    backgroundColor: colors.sand,
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  name: {
    marginTop: 8,
  },
  tagline: {
    color: colors.muted,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  price: {
    fontSize: 24,
    lineHeight: 28,
  },
  compare: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  stockPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginLeft: "auto",
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  description: {
    marginTop: 18,
    color: colors.inkSoft,
    lineHeight: 22,
  },
  detailCard: {
    marginTop: 22,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  detailValue: {
    flexShrink: 1,
    textAlign: "right",
  },
  serviceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 16,
  },
  service: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  serviceText: {
    flexShrink: 1,
  },
  buyBlock: {
    marginTop: 24,
    gap: 12,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buyNow: {
    marginTop: 2,
  },
  soldOutCard: {
    marginTop: 24,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.paperDeep,
    gap: 6,
  },
  soldOutCopy: {
    lineHeight: 18,
  },
  soldOutButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: colors.card,
  },
  shippingNote: {
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: 7,
  },
  shippingCopy: {
    lineHeight: 19,
  },
  related: {
    marginTop: 34,
  },
  relatedHead: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  relatedLink: {
    paddingBottom: 3,
  },
  relatedList: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 12,
  },
});
