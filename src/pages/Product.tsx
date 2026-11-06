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
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  Check,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export default function Product() {
  const { slug = "" } = useParams();
  const product = useQuery(api.products.getBySlug, { slug });
  const products = useQuery(api.products.list);
  const { add } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [slug]);

  if (product === undefined) {
    return (
      <SiteShell>
        <div className="mx-auto w-full max-w-6xl animate-pulse px-5 py-12 sm:px-8">
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

  if (product === null) {
    return (
      <SiteShell>
        <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            404
          </p>
          <h1 className="mt-3 font-display text-4xl">This object moved on.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The product you're looking for isn't in the collection anymore.
          </p>
          <Button asChild className="mt-7 rounded-full">
            <Link to="/shop">Back to the shop</Link>
          </Button>
        </div>
      </SiteShell>
    );
  }

  const soldOut = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
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
      { description: "Checkout is a demo — no real charge." },
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
      <div className="mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8">
        <nav className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span className="text-border">/</span>
          <Link to="/shop" className="transition-colors hover:text-foreground">
            Shop
          </Link>
          <span className="text-border">/</span>
          <Link
            to={`/shop?category=${encodeURIComponent(product.category)}`}
            className="transition-colors hover:text-foreground"
          >
            {product.category}
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground/70">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 pb-4 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          {/* Gallery */}
          <div>
            <div className="relative overflow-hidden rounded-[1.75rem] bg-muted shadow-soft">
              <img
                src={product.image}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover"
              />
              {onSale && (
                <span className="absolute left-4 top-4 rounded-full bg-sand px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                  Sale
                </span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "Ships in 48h" },
                { icon: RotateCcw, label: "30-day returns" },
                { icon: ShieldCheck, label: "Demo payment" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 rounded-xl border hairline bg-card px-2 py-3 text-center"
                >
                  <item.icon
                    className="size-4 text-muted-foreground"
                    strokeWidth={1.6}
                  />
                  <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {product.category}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.3rem,4.4vw,3.2rem)] leading-[1.02] tracking-tight">
              {product.name}
            </h1>
            <p className="mt-2 text-sm italic text-muted-foreground">
              {product.tagline}
            </p>

            <div className="mt-4 flex items-center gap-3 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "size-3.5",
                      index < Math.round(product.rating)
                        ? "fill-sand-deep text-sand-deep"
                        : "text-border",
                    )}
                  />
                ))}
              </span>
              <span className="tabular-nums">{product.rating.toFixed(1)}</span>
              <span>·</span>
              <span>{product.reviewCount} reviews</span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-2xl font-medium tabular-nums">
                {formatMoney(product.price)}
              </span>
              {onSale && (
                <span className="text-sm text-muted-foreground line-through tabular-nums">
                  {formatMoney(product.compareAtPrice!)}
                </span>
              )}
            </div>

            <p className="mt-5 max-w-md text-[14px] leading-7 text-muted-foreground">
              {product.description}
            </p>

            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-y hairline py-4 text-[12px]">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Material
                </dt>
                <dd className="mt-1">{product.material}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Availability
                </dt>
                <dd className="mt-1 flex items-center gap-1.5">
                  {soldOut ? (
                    <span className="text-muted-foreground">Sold out</span>
                  ) : (
                    <>
                      <span className="size-1.5 rounded-full bg-primary" />
                      In stock · {product.stock} left
                    </>
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-12 items-center justify-between gap-1 rounded-full border hairline bg-card px-2 sm:w-32">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={soldOut || quantity <= 1}
                  className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="min-w-6 text-center text-sm tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  disabled={soldOut || quantity >= 10}
                  className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              <Button
                onClick={handleAdd}
                disabled={soldOut}
                className="h-12 flex-1 rounded-full text-[13px]"
              >
                Add to bag
                <span className="ml-2 tabular-nums opacity-70">
                  {formatMoney(product.price * quantity)}
                </span>
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={soldOut}
                variant="outline"
                className="h-12 rounded-full border-foreground/15 px-5 text-[13px]"
              >
                Buy now
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Check className="size-3.5 text-primary" />
              {lowStock
                ? `Only ${product.stock} left — low stock`
                : "Free shipping on orders over $75"}
              {!isAuthenticated && (
                <span className="text-muted-foreground/70">
                  · sign in at checkout
                </span>
              )}
            </p>

            <Accordion
              type="single"
              collapsible
              className="mt-8 border-t hairline"
            >
              <AccordionItem value="shipping" className="border-b hairline">
                <AccordionTrigger className="py-4 text-[13px] font-medium hover:no-underline">
                  Shipping &amp; delivery
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-[13px] leading-6 text-muted-foreground">
                  Orders leave the studio within 48 hours. Standard delivery is
                  free over $75, otherwise $9 flat. Tracking is emailed as soon
                  as your parcel is scanned.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns" className="border-b hairline">
                <AccordionTrigger className="py-4 text-[13px] font-medium hover:no-underline">
                  Returns &amp; exchanges
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-[13px] leading-6 text-muted-foreground">
                  Thirty days to return anything unused in its original
                  packaging. Refunds are issued to the original (demo) payment
                  method by an admin.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care" className="border-b hairline">
                <AccordionTrigger className="py-4 text-[13px] font-medium hover:no-underline">
                  Care
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-[13px] leading-6 text-muted-foreground">
                  Wipe with a soft dry cloth. Avoid solvents and long exposure to
                  direct sun. Spare parts are available on request.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-5 pb-4 pt-20 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl tracking-tight">
              Pairs well with
            </h2>
            <Link
              to="/shop"
              className="text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              All objects
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3 lg:gap-x-7">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </SiteShell>
  );
}
