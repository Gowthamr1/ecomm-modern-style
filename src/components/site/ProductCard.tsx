import type { Doc } from "@/convex/_generated/dataModel";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Plus, Star } from "lucide-react";
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
  const soldOut = product.stock <= 0;
  const onSale =
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price;

  const handleAdd = () => {
    if (soldOut) return;
    add({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast.success(`${product.name} added to your bag`);
  };

  return (
    <article className={cn("group flex flex-col", className)}>
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <Link
          to={`/product/${product.slug}`}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={product.name}
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={cn(
              "aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
              soldOut && "opacity-70",
            )}
          />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {onSale && (
            <span className="rounded-full bg-sand px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
              {Math.round(
                ((product.compareAtPrice! - product.price) /
                  product.compareAtPrice!) *
                  100,
              )}
              % off
            </span>
          )}
          {product.featured && !onSale && (
            <span className="rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground backdrop-blur">
              Studio pick
            </span>
          )}
          {soldOut && (
            <span className="rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground backdrop-blur">
              Sold out
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut}
          aria-label={`Add ${product.name} to bag`}
          className={cn(
            "absolute bottom-3 right-3 inline-flex size-10 items-center justify-center rounded-full bg-background/95 text-foreground shadow-soft backdrop-blur transition-all duration-300",
            "opacity-100 sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100",
            "focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring",
            "hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          <Plus className="size-4" strokeWidth={1.8} />
        </button>
      </div>

      <div className="mt-3.5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {product.category}
          </p>
          <Link
            to={`/product/${product.slug}`}
            className="mt-1 block truncate text-[13px] font-medium text-foreground transition-colors hover:text-primary"
          >
            {product.name}
          </Link>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[13px] font-medium tabular-nums">
            {formatMoney(product.price)}
          </p>
          {onSale && (
            <p className="text-[11px] text-muted-foreground line-through tabular-nums">
              {formatMoney(product.compareAtPrice!)}
            </p>
          )}
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
        <Star className="size-3 fill-sand-deep text-sand-deep" />
        <span className="tabular-nums">{product.rating.toFixed(1)}</span>
        <span className="text-muted-foreground/60">
          ({product.reviewCount})
        </span>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] w-full rounded-2xl bg-muted" />
      <div className="mt-4 h-2.5 w-16 rounded bg-muted" />
      <div className="mt-2 h-3 w-3/4 rounded bg-muted" />
      <div className="mt-2 h-2.5 w-12 rounded bg-muted" />
    </div>
  );
}
