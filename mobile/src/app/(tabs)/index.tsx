import { router } from "expo-router";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Leaf,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react-native";
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
import { ProductTile } from "@/components/ProductTile";
import { SectionHeading } from "@/components/SectionHeading";
import { Screen } from "@/components/Screen";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { useCatalog } from "@/lib/use-catalog";
import { colors, fonts, radius, shadowLift } from "@/lib/theme";

export default function HomeScreen() {
  const { products, featured, isLoading } = useCatalog();
  const { count } = useCart();
  const hero = featured[0] ?? products?.[0];
  const categories = Array.from(
    new Set((products ?? []).map((product) => product.category)),
  ).slice(0, 6);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View>
            <AppText variant="label" color={colors.muted}>
              Considered goods
            </AppText>
            <AppText variant="h2" style={styles.wordmark}>
              Forma
            </AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open bag"
            onPress={() => router.push("/bag")}
            style={({ pressed }) => [styles.bagButton, pressed && styles.pressed]}
          >
            <ShoppingBag size={20} color={colors.ink} strokeWidth={1.7} />
            {count > 0 ? (
              <View style={styles.bagCount}>
                <AppText style={styles.bagCountText}>{count}</AppText>
              </View>
            ) : null}
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.eyebrowRow}>
            <Sparkles size={13} color={colors.pine} strokeWidth={1.8} />
            <AppText variant="label" color={colors.pine}>
              The winter edit
            </AppText>
          </View>
          <AppText variant="display" style={styles.heroTitle}>
            Objects with{"\n"}quiet intent.
          </AppText>
          <AppText style={styles.heroCopy}>
            A small, deliberate collection for the desk, the pocket and the
            everyday. Chosen once, kept for years.
          </AppText>
          <View style={styles.heroActions}>
            <Button
              label="Shop the collection"
              onPress={() => router.push("/shop")}
              style={styles.heroButton}
            />
            <AppText variant="small" color={colors.muted} style={styles.shipNote}>
              Free shipping over ₹6,250
            </AppText>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.pine} />
          </View>
        ) : hero ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Featured product, ${hero.name}`}
            onPress={() => router.push(`/product/${hero.slug}`)}
            style={({ pressed }) => [styles.heroCard, pressed && styles.pressed]}
          >
            <Image
              source={{ uri: hero.image }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroBadge}>
              <AppText variant="label" color={colors.paper}>
                Studio pick
              </AppText>
            </View>
            <View style={styles.heroCaption}>
              <View style={styles.heroCaptionCopy}>
                <AppText variant="small" color={colors.sand}>
                  {hero.category} · {hero.tagline}
                </AppText>
                <AppText variant="h3" color={colors.paper} numberOfLines={1}>
                  {hero.name}
                </AppText>
                <AppText variant="price" color={colors.paper}>
                  {formatMoney(hero.price)}
                </AppText>
              </View>
              <View style={styles.heroArrow}>
                <ArrowUpRight size={19} color={colors.pine} strokeWidth={1.8} />
              </View>
            </View>
          </Pressable>
        ) : null}

        {featured.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading
              eyebrow="The short list"
              title="Good things, chosen"
              actionLabel="See all"
              onAction={() => router.push("/shop")}
            />
            <FlatList
              horizontal
              data={featured}
              keyExtractor={(item) => item._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <ProductTile
                  product={item}
                  width={210}
                  onPress={() => router.push(`/product/${item.slug}`)}
                />
              )}
            />
          </View>
        ) : null}

        {categories.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading eyebrow="Browse" title="By room, by ritual" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {categories.map((category) => (
                <Pressable
                  key={category}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({ pathname: "/shop", params: { category } })
                  }
                  style={({ pressed }) => [
                    styles.categoryChip,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText variant="bodyStrong">{category}</AppText>
                  <ArrowRight size={14} color={colors.muted} strokeWidth={1.8} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.editorial}>
          <AppText variant="label" color={colors.pine}>
            The Forma standard
          </AppText>
          <AppText variant="h2" style={styles.editorialTitle}>
            Better things, kept longer.
          </AppText>
          <AppText style={styles.editorialCopy}>
            We look for quiet materials, repairable construction and a shape
            that gets better with use. No seasonal churn, no filler.
          </AppText>
          <View style={styles.values}>
            <ValueRow
              icon={<Leaf size={18} color={colors.pine} strokeWidth={1.6} />}
              title="Materials that age well"
              body="Solid wood, brushed steel, honest cotton."
            />
            <ValueRow
              icon={
                <ShieldCheck size={18} color={colors.pine} strokeWidth={1.6} />
              }
              title="Two-year guarantee"
              body="Repairs first, replacements when needed."
            />
            <ValueRow
              icon={
                <PackageCheck size={18} color={colors.pine} strokeWidth={1.6} />
              }
              title="Sent with care"
              body="Plastic-free packing, tracked delivery."
            />
          </View>
        </View>

        <View style={styles.quote}>
          <AppText variant="quote" style={styles.quoteText}>
            “The best objects don't ask for attention. They simply make the day
            work better.”
          </AppText>
          <AppText variant="label" color={colors.muted} style={styles.quoteBy}>
            Mara Ellis · Studio founder
          </AppText>
        </View>

        <View style={styles.cta}>
          <AppText variant="h2" color={colors.paper} style={styles.ctaTitle}>
            Start with one good thing.
          </AppText>
          <AppText style={styles.ctaCopy}>
            Ten considered pieces, made to be used every day. Browse the full
            collection on your phone.
          </AppText>
          <Button
            label="Explore the shop"
            variant="secondary"
            onPress={() => router.push("/shop")}
            style={styles.ctaButton}
            icon={<ArrowRight size={15} color={colors.ink} strokeWidth={1.8} />}
          />
        </View>

        <View style={styles.footer}>
          <AppText variant="h3" style={styles.footerMark}>
            Forma
          </AppText>
          <AppText variant="small" color={colors.muted}>
            Demo storefront · Demo payments · Built with React Native
          </AppText>
        </View>
      </ScrollView>
    </Screen>
  );
}

function ValueRow({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.valueRow}>
      <View style={styles.valueIcon}>{icon}</View>
      <View style={styles.valueCopy}>
        <AppText variant="title">{title}</AppText>
        <AppText variant="small" color={colors.muted} style={styles.valueBody}>
          {body}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  wordmark: {
    fontSize: 30,
    lineHeight: 34,
    marginTop: 1,
  },
  bagButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  bagCount: {
    position: "absolute",
    top: -3,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.pine,
    alignItems: "center",
    justifyContent: "center",
  },
  bagCountText: {
    color: colors.paper,
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    lineHeight: 12,
  },
  pressed: {
    opacity: 0.8,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  heroTitle: {
    marginBottom: 14,
  },
  heroCopy: {
    color: colors.muted,
    maxWidth: 330,
    fontSize: 14.5,
    lineHeight: 22,
  },
  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 20,
  },
  heroButton: {
    paddingHorizontal: 24,
  },
  shipNote: {
    flexShrink: 1,
  },
  loading: {
    height: 260,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.pineDeep,
    ...shadowLift,
  },
  heroImage: {
    width: "100%",
    height: 270,
    backgroundColor: colors.sand,
  },
  heroBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(22,39,31,0.82)",
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  heroCaption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: colors.pineDeep,
  },
  heroCaptionCopy: {
    flex: 1,
    gap: 2,
  },
  heroArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginTop: 34,
  },
  horizontalList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  chipRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 9,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  editorial: {
    marginTop: 38,
    marginHorizontal: 20,
    padding: 24,
    borderRadius: radius.xl,
    backgroundColor: colors.sand,
  },
  editorialTitle: {
    marginTop: 8,
    marginBottom: 10,
    maxWidth: 260,
  },
  editorialCopy: {
    color: colors.inkSoft,
    lineHeight: 22,
  },
  values: {
    marginTop: 22,
    gap: 16,
  },
  valueRow: {
    flexDirection: "row",
    gap: 12,
  },
  valueIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,253,248,0.66)",
    alignItems: "center",
    justifyContent: "center",
  },
  valueCopy: {
    flex: 1,
    gap: 2,
  },
  valueBody: {
    lineHeight: 18,
  },
  quote: {
    marginTop: 38,
    marginHorizontal: 20,
    paddingLeft: 18,
    borderLeftWidth: 2,
    borderLeftColor: colors.sandDeep,
  },
  quoteText: {
    color: colors.inkSoft,
  },
  quoteBy: {
    marginTop: 12,
  },
  cta: {
    marginTop: 38,
    marginHorizontal: 20,
    padding: 26,
    borderRadius: radius.xl,
    backgroundColor: colors.pine,
  },
  ctaTitle: {
    maxWidth: 250,
  },
  ctaCopy: {
    color: colors.pineSoft,
    marginTop: 8,
    lineHeight: 21,
  },
  ctaButton: {
    marginTop: 20,
    alignSelf: "flex-start",
    backgroundColor: colors.paper,
    borderColor: colors.paper,
    paddingHorizontal: 22,
  },
  footer: {
    marginTop: 34,
    paddingHorizontal: 20,
    gap: 4,
  },
  footerMark: {
    fontSize: 24,
  },
});
