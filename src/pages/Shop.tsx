import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCatalog } from "@/hooks/use-catalog";
import { cn } from "@/lib/utils";
import {
  Grid2X2,
  Grid3X3,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

const SORTS = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
};

type SortKey = keyof typeof SORTS;

export default function Shop() {
  const products = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [isCompact, setIsCompact] = useState(false);

  const activeCategory = searchParams.get("category") ?? "All";
  const categories = useMemo(() => {
    const unique = new Set((products ?? []).map((product) => product.category));
    return ["All", ...Array.from(unique).sort()];
  }, [products]);

  const visible = useMemo(() => {
    let list = [...(products ?? [])];
    if (activeCategory !== "All") {
      list = list.filter((product) => product.category === activeCategory);
    }
    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.tagline.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term),
      );
    }
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Prioritize newly added custom spices first, then featured items
        list.sort((a, b) => {
          const aCustom = a._id?.startsWith("spice_custom_") ? 1 : 0;
          const bCustom = b._id?.startsWith("spice_custom_") ? 1 : 0;
          if (aCustom !== bCustom) return bCustom - aCustom;
          return Number(b.featured) - Number(a.featured);
        });
    }
    return list;
  }, [products, activeCategory, query, sort]);

  const selectCategory = (category: string) => {
    const next = new URLSearchParams(searchParams);
    if (category === "All") next.delete("category");
    else next.set("category", category);
    setSearchParams(next, { replace: true });
  };

  const hasActiveFilters = activeCategory !== "All" || query.trim() !== "";

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-8 sm:pt-12">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-sand px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary mb-3">
              <Sparkles className="size-3" />
              Single-Origin Terroirs
            </div>
            <h1 className="font-display text-[clamp(2.4rem,5vw,3.6rem)] leading-[0.98] tracking-tight text-foreground">
              Artisanal Indian Spices
            </h1>
            <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
              Freshly harvested whole pods, hand-plucked saffron, and stone-ground heritage spices. Vacuum-sealed in airtight brass tins directly from farm estates.
            </p>
          </div>

          {/* Desktop & Windows View Density Toggle */}
          <div className="hidden lg:flex items-center gap-1 rounded-full border border-border/80 bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => setIsCompact(false)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                !isCompact
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Grid2X2 className="size-3.5" />
              Editorial
            </button>
            <button
              type="button"
              onClick={() => setIsCompact(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                isCompact
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Grid3X3 className="size-3.5" />
              Compact (Dense)
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-4 flex flex-col gap-3 border-y border-border/70 py-3 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Mobile & Android Touch-Friendly Category Chips */}
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0 lg:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => selectCategory(category)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all select-none active:scale-95",
                  activeCategory === category
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search input and sort select */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-60">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter current view..."
                className="h-9.5 rounded-full bg-card pl-8.5 pr-8 text-xs shadow-xs"
                aria-label="Filter products"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
              <SelectTrigger className="h-9.5 w-auto min-w-[160px] gap-2 rounded-full bg-card text-xs shadow-xs">
                <SlidersHorizontal className="size-3 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {Object.entries(SORTS).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results summary bar */}
        <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>
            {products === undefined
              ? "Loading spices…"
              : `${visible.length} ${visible.length === 1 ? "spice" : "spices"} available`}
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                selectCategory("All");
              }}
              className="text-primary hover:underline font-semibold"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Product Grid */}
        {products === undefined ? (
          <div
            className={cn(
              "mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 pb-12",
              isCompact ? "lg:grid-cols-4" : "lg:grid-cols-3",
            )}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="my-14 flex flex-col items-center rounded-2xl border border-border/80 bg-card px-6 py-16 text-center shadow-xs">
            <p className="font-display text-2xl text-foreground">
              No matching spices found.
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Try a different keyword or reset filters to view our entire single-origin collection.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="rounded-full text-xs"
                onClick={() => {
                  setQuery("");
                  selectCategory("All");
                }}
              >
                Clear all filters
              </Button>
              <Button asChild className="rounded-full text-xs">
                <Link to="/shop">View all spices</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 pb-16",
              isCompact
                ? "lg:grid-cols-4 lg:gap-x-5 lg:gap-y-8"
                : "lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14",
            )}
          >
            {visible.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                className={cn(
                  "transition-all duration-300",
                  isCompact && "scale-98",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
