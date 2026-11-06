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
import { Search, SlidersHorizontal } from "lucide-react";
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
        list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [products, activeCategory, query, sort]);

  const selectCategory = (category: string) => {
    const next = new URLSearchParams(searchParams);
    if (category === "All") next.delete("category");
    else next.set("category", category);
    setSearchParams(next, { replace: true });
  };

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-6xl px-5 pt-12 sm:px-8">
        <div className="max-w-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Shop
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.6rem,5vw,3.6rem)] leading-[1] tracking-tight">
            The full collection
          </h1>
          <p className="mt-4 text-[14px] leading-6 text-muted-foreground">
            Ten objects we actually use. Every piece ships from our studio and
            every checkout runs on a demo payment — no card is charged.
          </p>
        </div>

        {/* Controls */}
        <div className="mt-10 flex flex-col gap-4 border-y hairline py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => selectCategory(category)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors",
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-56">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search objects"
                className="h-10 rounded-full bg-card pl-9 text-sm"
                aria-label="Search products"
              />
            </div>
            <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
              <SelectTrigger className="h-10 w-auto min-w-[170px] gap-2 rounded-full bg-card text-xs">
                <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {Object.entries(SORTS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {products === undefined
            ? "Loading the collection…"
            : `${visible.length} ${visible.length === 1 ? "object" : "objects"}${
                activeCategory !== "All" ? ` in ${activeCategory}` : ""
              }`}
        </p>

        {products === undefined ? (
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 pb-6 lg:grid-cols-3 lg:gap-x-7">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="my-16 flex flex-col items-center rounded-2xl border hairline bg-card px-6 py-16 text-center">
            <p className="font-display text-2xl">Nothing matches that yet.</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Try a different word or browse the full collection.
            </p>
            <div className="mt-6 flex gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setQuery("");
                  selectCategory("All");
                }}
              >
                Clear filters
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/shop">All objects</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-11 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-14">
            {visible.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
