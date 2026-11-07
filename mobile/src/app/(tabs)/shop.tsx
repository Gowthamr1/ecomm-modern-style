import { router, useLocalSearchParams } from "expo-router";
import { Search, SlidersHorizontal, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { AppText } from "@/components/AppText";
import { ProductTile } from "@/components/ProductTile";
import { Screen } from "@/components/Screen";
import { useCatalog } from "@/lib/use-catalog";
import { colors, fonts, radius } from "@/lib/theme";

type Sort = "featured" | "price-low" | "price-high" | "rating";

const SORTS: { key: Sort; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-low", label: "Price low" },
  { key: "price-high", label: "Price high" },
  { key: "rating", label: "Top rated" },
];

export default function ShopScreen() {
  const { products, isLoading } = useCatalog();
  const params = useLocalSearchParams<{ category?: string }>();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<Sort>("featured");

  useEffect(() => {
    if (params.category) setCategory(params.category);
  }, [params.category]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set((products ?? []).map((p) => p.category)))],
    [products],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = (products ?? []).filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;
      const matchesSearch =
        !needle ||
        product.name.toLowerCase().includes(needle) ||
        product.tagline.toLowerCase().includes(needle) ||
        product.material.toLowerCase().includes(needle) ||
        product.category.toLowerCase().includes(needle);
      return matchesCategory && matchesSearch;
    });

    return list.sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [products, query, category, sort]);

  const tileWidth = Math.floor((width - 40 - 12) / 2);
  const hasFilters = query.trim().length > 0 || category !== "All";

  return (
    <Screen>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <AppText variant="label" color={colors.muted}>
                The collection
              </AppText>
              <AppText variant="h1" style={styles.title}>
                Everyday objects
              </AppText>
              <AppText style={styles.intro}>
                Ten pieces for desk, home and pocket. Chosen for material,
                function and the long run.
              </AppText>
            </View>

            <View style={styles.searchWrap}>
              <Search size={17} color={colors.muted} strokeWidth={1.8} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search the collection"
                placeholderTextColor={colors.muted}
                selectionColor={colors.pine}
                returnKeyType="search"
                accessibilityLabel="Search products"
                style={styles.searchInput}
              />
              {query ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  onPress={() => setQuery("")}
                >
                  <X size={16} color={colors.muted} strokeWidth={1.8} />
                </Pressable>
              ) : null}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {categories.map((item) => {
                const active = item === category;
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setCategory(item)}
                    style={({ pressed }) => [
                      styles.chip,
                      active && styles.chipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText
                      variant="small"
                      color={active ? colors.paper : colors.inkSoft}
                      style={styles.chipText}
                    >
                      {item}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.toolbar}>
              <View style={styles.countRow}>
                <SlidersHorizontal
                  size={13}
                  color={colors.muted}
                  strokeWidth={1.8}
                />
                <AppText variant="small" color={colors.muted}>
                  {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
                </AppText>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sortRow}
              >
                {SORTS.map((option) => {
                  const active = option.key === sort;
                  return (
                    <Pressable
                      key={option.key}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setSort(option.key)}
                    >
                      <AppText
                        variant="small"
                        color={active ? colors.pine : colors.muted}
                        style={[styles.sortText, active && styles.sortActive]}
                      >
                        {option.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {hasFilters ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setQuery("");
                  setCategory("All");
                }}
                style={styles.clear}
              >
                <AppText variant="small" color={colors.pine}>
                  Clear filters
                </AppText>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <ProductTile
            product={item}
            width={tileWidth}
            onPress={() => router.push(`/product/${item.slug}`)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.empty}>
              <ActivityIndicator color={colors.pine} />
            </View>
          ) : (
            <View style={styles.empty}>
              <AppText variant="h2">Nothing here yet</AppText>
              <AppText style={styles.emptyCopy}>
                Try a different search or clear the filters to see the full
                collection.
              </AppText>
            </View>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 36,
  },
  column: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 6,
  },
  title: {
    marginTop: 2,
  },
  intro: {
    color: colors.muted,
    marginTop: 4,
    maxWidth: 340,
    lineHeight: 21,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    paddingVertical: 0,
  },
  chips: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: {
    backgroundColor: colors.pine,
    borderColor: colors.pine,
  },
  chipText: {
    fontFamily: fonts.medium,
  },
  pressed: {
    opacity: 0.75,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  sortRow: {
    gap: 12,
  },
  sortText: {
    fontFamily: fonts.medium,
  },
  sortActive: {
    textDecorationLine: "underline",
  },
  clear: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  empty: {
    paddingVertical: 50,
    paddingHorizontal: 30,
    alignItems: "center",
    gap: 8,
  },
  emptyCopy: {
    color: colors.muted,
    textAlign: "center",
  },
});
