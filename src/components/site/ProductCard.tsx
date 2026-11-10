import type { Doc } from "@/convex/_generated/dataModel";
import { useCart } from "@/lib/cart";
import { cleanImageUrl, DEFAULT_SPICE_IMAGE, handleImageFallback } from "@/lib/catalog-store";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Check, Plus, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

export function ProductCard({
  product,
  className,
}: {
  product: Doc<"products">;
  className?: string;
}) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const soldOut = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const onSale =
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;

    add({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);

    toast.success(`${product.name} added to your bag`, {
      description: "Demo checkout — no real card is charged.",
    });
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl border border-border/70 bg-card p-3 transition-all duration-300",
        "hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5",
        className,
      )}
    >
      {/* Image Container with Badges */}
      <div className="relative overflow-hidden rounded-xl bg-muted/60 aspect-[4/5] w-full">
        <Link
          to={`/product/${product.slug}`}
          className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={product.name}
        >
          <img
            src={cleanImageUrl(product.image) || DEFAULT_SPICE_IMAGE}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => handleImageFallback(e, product.image)}
            className={cn(
              "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
              soldOut && "opacity-60 grayscale-[30%]",
            )}
          />
        </Link>

        {/* Floating Badges */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5 z-10">
          {onSale && (
            <span className="rounded-full bg-emerald-500/90 text-white px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-xs">
              {Math.round(
                ((product.compareAtPrice! - product.price) /
                  product.compareAtPrice!) *
                  100,
              )}
              % off
            </span>
          )}
          {product.featured && !onSale && (
            <span className="rounded-full bg-sand/95 border border-primary/20 text-primary px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-xs">
              Estate Reserve
            </span>
          )}
          {lowStock && !soldOut && (
            <span className="rounded-full bg-amber-500/90 text-white px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-xs flex items-center gap-1">
              <span className="size-1 rounded-full bg-white animate-ping" />
              {product.stock} left
            </span>
          )}
          {soldOut && (
            <span className="rounded-full bg-background/90 text-muted-foreground px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-xs">
              Sold out
            </span>
          )}
        </div>

        {/* Quick Add To Bag Button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut}
          aria-label={`Add ${product.name} to bag`}
          className={cn(
            "absolute bottom-2.5 right-2.5 z-10 flex size-9 items-center justify-center rounded-full shadow-md transition-all duration-200 cursor-pointer select-none",
            justAdded
              ? "bg-emerald-600 text-white scale-110"
              : "bg-background/95 text-foreground hover:bg-primary hover:text-primary-foreground backdrop-blur-md",
            "sm:opacity-0 sm:translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          {justAdded ? (
            <Check className="size-4 animate-in zoom-in" strokeWidth={2.5} />
          ) : (
            <Plus className="size-4" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Product Metadata & Pricing */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            <span>{product.category}</span>
            {product.material && (
              <span className="truncate max-w-[110px] text-muted-foreground/80 font-normal">
                {product.material}
              </span>
            )}
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="mt-1 block font-medium text-[13px] text-foreground transition-colors hover:text-primary leading-tight group-hover:underline"
          >
            {product.name}
          </Link>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-foreground tabular-nums text-[13px]">
              {formatMoney(product.price)}
            </span>
            {(product as any).weight && (
              <span className="text-[11px] text-muted-foreground font-mono">
                / {(product as any).weight}
              </span>
            )}
            {onSale && (
              <span className="text-[11px] text-muted-foreground line-through tabular-nums">
                {formatMoney(product.compareAtPrice!)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Star className="size-3 fill-sand-deep text-sand-deep" />
            <span className="font-medium text-foreground text-[11px] tabular-nums">
              {(product.rating ?? 4.9).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border/60 bg-card p-3">
      <div className="aspect-[4/5] w-full rounded-xl bg-muted" />
      <div className="mt-3 h-2.5 w-16 rounded bg-muted" />
      <div className="mt-2 h-3.5 w-3/4 rounded bg-muted" />
      <div className="mt-3 flex justify-between border-t border-border/40 pt-2">
        <div className="h-3 w-14 rounded bg-muted" />
        <div className="h-3 w-8 rounded bg-muted" />
      </div>
    </div>
  );
}
