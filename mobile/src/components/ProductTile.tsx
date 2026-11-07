import { Image, Pressable, StyleSheet, View } from "react-native";
import type { Product } from "@/lib/api";
import { colors, fonts, radius, shadowSoft } from "@/lib/theme";
import { formatMoney } from "@/lib/format";
import { AppText } from "./AppText";

type Props = {
  product: Product;
  onPress: () => void;
  width?: number;
};

export function ProductTile({ product, onPress, width }: Props) {
  const soldOut = product.stock <= 0;
  const onSale =
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatMoney(product.price)}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        width ? { width } : styles.flex,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        {onSale ? (
          <View style={styles.sale}>
            <AppText style={styles.saleText}>
              −
              {Math.round(
                ((product.compareAtPrice! - product.price) /
                  product.compareAtPrice!) *
                  100,
              )}
              %
            </AppText>
          </View>
        ) : null}
        {soldOut ? (
          <View style={styles.soldOut}>
            <AppText variant="label" color={colors.ink}>
              Sold out
            </AppText>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <AppText variant="small" color={colors.muted}>
          {product.tagline}
        </AppText>
        <AppText variant="title" numberOfLines={2}>
          {product.name}
        </AppText>
        <View style={styles.priceRow}>
          <AppText variant="price">{formatMoney(product.price)}</AppText>
          {onSale ? (
            <AppText style={styles.compare}>
              {formatMoney(product.compareAtPrice!)}
            </AppText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadowSoft,
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.86,
  },
  imageWrap: {
    aspectRatio: 0.96,
    backgroundColor: colors.sand,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  sale: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: colors.pine,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  saleText: {
    color: colors.paper,
    fontFamily: fonts.semibold,
    fontSize: 10,
    lineHeight: 13,
  },
  soldOut: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(250,248,244,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: 12,
    gap: 3,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 7,
    marginTop: 3,
  },
  compare: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.muted,
    textDecorationLine: "line-through",
  },
});
