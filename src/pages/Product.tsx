import { ProductCard } from "@/components/site/ProductCard";
import { SiteShell } from "@/components/site/SiteShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { SPICE_CATALOG, type SpiceProduct } from "@/data/spices";
import { useAuth } from "@/hooks/use-auth";
import { useCatalog } from "@/hooks/use-catalog";
import { useCart } from "@/lib/cart";
import { cleanImageUrl, DEFAULT_SPICE_IMAGE, handleImageFallback } from "@/lib/catalog-store";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  Check,
  Flame,
  Leaf,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export default function Product() {
  const { slug = "" } = useParams();
  const remoteProduct = useQuery(api.products.getBySlug, { slug });
  const products = useCatalog();
  const catalogMatch = products.find((p) => p.slug === slug);
  const spiceMatch = SPICE_CATALOG.find((p) => p.slug === slug);
  const product = (remoteProduct ?? catalogMatch ?? spiceMatch) as (SpiceProduct | undefined);
  const { add } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (remoteProduct === undefined && !catalogMatch && !spiceMatch) {
    return (
      <SiteShell>
        <div className="mx-auto w-full max-w-6xl animate-pulse px-4 py-12 sm:px-8">
          <div className="h-3 w-48 rounded bg-muted" />
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div className="aspect-[4/5] rounded-3xl bg-muted" />
            <div className="space-y-4 pt-4">
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-10 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="h-24 w-full rounded bg-muted" />
            </div>
          </div>
        </div>
      </SiteShell>
    );
  }

  if (!product) {
    return (
      <SiteShell>
        <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            404
          </p>
          <h1 className="mt-3 font-display text-4xl">This harvest has concluded.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The single-origin spice batch you are looking for has sold out or moved to archives.
          </p>
          <Button asChild className="mt-7 rounded-full">
            <Link to="/shop">Back to the spice pantry</Link>
          </Button>
        </div>
      </SiteShell>
    );
  }

  const soldOut = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 8;
  const onSale =
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price;

  const related = (products ?? [])
    .filter(
      (item) =>
        item._id !== product._id &&
        (item.category === product.category || item.featured),
    )
    .slice(0, 3);

  const handleAdd = () => {
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
    toast.success(
      `${quantity} × ${product.name} added to your bag`,
      { description: "Demo checkout — experience the artisanal spices workflow." },
    );
  };

  const handleBuyNow = () => {
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
    navigate("/checkout");
  };

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-8">
        {/* Breadcrumbs Navigation */}
        <nav aria-label="Breadcrumbs" className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span className="text-border">/</span>
          <Link to="/shop" className="transition-colors hover:text-foreground">
            Spices Collection
          </Link>
          <span className="text-border">/</span>
          <Link
            to={`/shop?category=${encodeURIComponent(product.category)}`}
            className="transition-colors hover:text-foreground"
          >
            {product.category}
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground/80 font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        <div className="mt-6 grid gap-8 pb-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Product Gallery View */}
          <div>
            <div className="relative overflow-hidden rounded-3xl bg-muted/50 border border-border/60 shadow-sm">
              <img
                src={cleanImageUrl(product.image) || DEFAULT_SPICE_IMAGE}
                alt={product.name}
                referrerPolicy="no-referrer"
                onError={(e) => handleImageFallback(e, product.image)}
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              />
              {onSale && (
                <span className="absolute left-4 top-4 rounded-full bg-sand px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary shadow-xs">
                  Harvest Special
                </span>
              )}
              {product.origin && (
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-foreground shadow-xs">
                  <Leaf className="size-3 text-emerald-600" />
                  {product.origin}
                </span>
              )}
            </div>

            {/* Service & Guarantee Badges */}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { icon: Truck, label: "Express Dispatch", sub: "Ships in 24–48h" },
                { icon: Sun, label: "Kiln-Cured Fresh", sub: "Preserved Aromatics" },
                { icon: ShieldCheck, label: "100% Single Origin", sub: "Certified Terroir" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/70 bg-card p-3 text-center shadow-xs"
                >
                  <item.icon
                    className="size-4 text-emerald-700 dark:text-emerald-400"
                    strokeWidth={1.8}
                  />
                  <span className="text-[11px] font-semibold text-foreground">
                    {item.label}
                  </span>
                  <span className="text-[9px] text-muted-foreground hidden sm:block">
                    {item.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Details & Ordering Form */}
          <div className="lg:pt-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-sand/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="size-3" />
              {product.category}
            </div>
            <h1 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.2rem)] leading-[1.02] tracking-tight text-foreground">
              {product.name}
            </h1>
            <p className="mt-2 text-sm italic text-muted-foreground">
              {product.tagline}
            </p>

            {/* Rating & Reviews */}
            <div className="mt-4 flex items-center gap-3 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "size-3.5",
                      index < Math.round(product.rating ?? 4.9)
                        ? "fill-[#E5A93B] text-[#E5A93B]"
                        : "text-border",
                    )}
                  />
                ))}
              </span>
              <span className="font-semibold text-foreground tabular-nums">
                {(product.rating ?? 4.9).toFixed(1)}
              </span>
              <span>·</span>
              <span>{product.reviewCount ?? 1} verified connoisseur reviews</span>
            </div>

            {/* Price Display */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-semibold tabular-nums text-foreground">
                {formatMoney(product.price)}
              </span>
              {(product as any).weight && (
                <span className="text-xs font-mono font-medium text-primary bg-sand/80 dark:bg-muted dark:text-foreground px-2.5 py-1 rounded-full border border-border/70">
                  Pack Size: {(product as any).weight}
                </span>
              )}
              {onSale && (
                <span className="text-sm text-muted-foreground line-through tabular-nums">
                  {formatMoney(product.compareAtPrice!)}
                </span>
              )}
            </div>

            <p className="mt-5 text-[14px] leading-7 text-muted-foreground">
              {product.description}
            </p>

            {/* Specifications Matrix */}
            <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-border/70 py-4 text-[12px]">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Grade &amp; Sourcing
                </dt>
                <dd className="mt-1 font-medium text-foreground">{product.material}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Net Quantity / Weight
                </dt>
                <dd className="mt-1 font-medium font-mono text-foreground">{(product as any).weight || "100g"}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Batch Status
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 font-medium">
                  {soldOut ? (
                    <span className="text-destructive font-medium">Sold out</span>
                  ) : (
                    <>
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-foreground">In stock ({product.stock} units)</span>
                    </>
                  )}
                </dd>
              </div>
              {(product as any).packaging && (
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Packaging
                  </dt>
                  <dd className="mt-1 font-medium text-foreground truncate">{(product as any).packaging}</dd>
                </div>
              )}
              {product.aromaProfile && (
                <div className="col-span-2 pt-2 border-t border-border/40">
                  <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Aroma &amp; Terpene Notes
                  </dt>
                  <dd className="mt-1 text-xs text-foreground/90 font-medium">
                    {product.aromaProfile}
                  </dd>
                </div>
              )}
            </dl>

            {/* Desktop Action Form */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-12 items-center justify-between gap-1 rounded-full border border-border/80 bg-card px-2 sm:w-32 shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={soldOut || quantity <= 1}
                  className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-30 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="min-w-6 text-center text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  disabled={soldOut || quantity >= 10}
                  className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-30 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              <Button
                onClick={handleAdd}
                disabled={soldOut}
                size="lg"
                className="h-12 flex-1 rounded-full text-[13px] font-medium shadow-xs"
              >
                <ShoppingBag className="mr-2 size-4" />
                Add to bag · {formatMoney(product.price * quantity)}
              </Button>

              <Button
                onClick={handleBuyNow}
                disabled={soldOut}
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-foreground/15 px-5 text-[13px] font-medium shadow-xs"
              >
                Instant checkout
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Check className="size-3.5 text-emerald-600" />
              {lowStock
                ? `Only ${product.stock} tins remaining from this harvest run`
                : "Complimentary express delivery across India on orders over ₹1,500"}
            </p>

            {/* Accordion Specs */}
            <Accordion type="single" collapsible className="mt-8 border-t border-border/70">
              <AccordionItem value="shipping" className="border-b border-border/70">
                <AccordionTrigger className="py-4 text-[13px] font-medium hover:no-underline">
                  Single-Estate Provenance &amp; Lab Testing
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-[13px] leading-6 text-muted-foreground">
                  Each harvest batch is traceable back to its estate GPS coordinates. Tested
                  rigorously for volatile oil percentage, absence of chemical pesticides, and zero
                  artificial color adulteration.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns" className="border-b border-border/70">
                <AccordionTrigger className="py-4 text-[13px] font-medium hover:no-underline">
                  Airtight Storage &amp; Aroma Retention
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-[13px] leading-6 text-muted-foreground">
                  Keep in the airtight inner-lid tin in a cool dark pantry. Whole pods stay fresh
                  for up to 24 months. Grind right before cooking to release volatile essential
                  oils and full terroir resonance.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care" className="border-b border-border/70">
                <AccordionTrigger className="py-4 text-[13px] font-medium hover:no-underline">
                  Pan-India Shipping &amp; Freshness Guarantee
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-[13px] leading-6 text-muted-foreground">
                  Dispatched within 24–48 hours of kiln curing. Packed in double-sealed food-grade
                  brass &amp; steel canisters with food-safe humidity seals. If you are not blown away
                  by the fragrance upon opening, contact our concierge for an instant refund.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Android & Mobile Native Sticky Bottom Action Bar */}
      <div
        className={cn(
          "fixed bottom-16 left-0 right-0 z-40 md:hidden",
          "border-t border-border/80 bg-background/95 backdrop-blur-xl px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]",
          "flex items-center justify-between gap-3",
        )}
      >
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
            Total Price
          </span>
          <span className="text-lg font-bold tabular-nums text-foreground">
            {formatMoney(product.price * quantity)}
          </span>
        </div>

        <Button
          onClick={handleAdd}
          disabled={soldOut}
          className="h-11 flex-1 rounded-full text-xs font-semibold shadow-md gap-2"
        >
          <ShoppingBag className="size-4" />
          {soldOut ? "Sold Out" : "Add to Bag"}
        </Button>
      </div>

      {/* Related Products Carousel / Grid */}
      {related.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-16 sm:px-8">
          <div className="flex items-end justify-between gap-4 border-b border-border/70 pb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Terroir Pairings
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl tracking-tight text-foreground">
                Pairs well with
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-[12px] font-medium text-primary hover:underline"
            >
              Browse all spices →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </SiteShell>
  );
}
