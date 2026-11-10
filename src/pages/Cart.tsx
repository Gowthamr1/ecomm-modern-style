import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart";
import { cleanImageUrl, DEFAULT_SPICE_IMAGE, handleImageFallback } from "@/lib/catalog-store";
import {
  FREE_SHIPPING_THRESHOLD,
  formatMoney,
  orderSummary,
} from "@/lib/format";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router";

export default function Cart() {
  const { lines, count, subtotal, setQuantity, remove } = useCart();
  const { isAuthenticated } = useAuth();
  const summary = orderSummary(subtotal);
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-6xl px-5 pt-12 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Spice Bag
            </p>
            <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-[2.75rem]">
              Your selection
              {count > 0 && (
                <span className="ml-2 align-middle text-base font-sans text-muted-foreground tabular-nums">
                  ({count})
                </span>
              )}
            </h1>
          </div>
          <Link
            to="/shop"
            className="hidden border-b border-foreground/20 pb-1 text-[12px] font-medium transition-colors hover:border-foreground sm:block"
          >
            Continue browsing spices
          </Link>
        </div>

        {lines.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-[1.75rem] border hairline bg-card px-6 py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-sand text-primary">
              <ShoppingBag className="size-6" strokeWidth={1.5} />
            </span>
            <h2 className="mt-5 font-display text-3xl">Your spice bag is empty.</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Discover peak-harvest spices — Idukki green cardamom, Kashmiri Mongra saffron,
              or Malabar Tellicherry black pepper.
            </p>
            <Button asChild className="mt-7 rounded-full px-6">
              <Link to="/shop">
                Explore Single-Origin Spices
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-9 grid gap-10 pb-4 lg:grid-cols-[1.5fr_0.85fr] lg:items-start lg:gap-12">
            {/* Lines */}
            <div className="divide-y hairline border-y hairline">
              {lines.map((line) => (
                <div key={line.productId} className="flex gap-4 py-5 sm:gap-6">
                  <Link
                    to={`/product/${line.slug}`}
                    className="shrink-0 overflow-hidden rounded-xl bg-muted"
                  >
                    <img
                      src={cleanImageUrl(line.image) || DEFAULT_SPICE_IMAGE}
                      alt={line.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleImageFallback(e, line.image)}
                      className="size-24 object-cover sm:size-28"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          to={`/product/${line.slug}`}
                          className="block truncate text-sm font-medium transition-colors hover:text-primary"
                        >
                          {line.name}
                        </Link>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          {formatMoney(line.price)} each
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(line.productId)}
                        className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                        aria-label={`Remove ${line.name}`}
                      >
                        <Trash2 className="size-4" strokeWidth={1.6} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex h-9 items-center gap-1 rounded-full border hairline bg-card px-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(line.productId, line.quantity - 1)
                          }
                          className="flex size-6 items-center justify-center rounded-full transition-colors hover:bg-muted"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="min-w-5 text-center text-xs tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(line.productId, line.quantity + 1)
                          }
                          disabled={line.quantity >= 10}
                          className="flex size-6 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <p className="text-sm font-medium tabular-nums">
                        {formatMoney(line.price * line.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <aside className="rounded-2xl border hairline bg-card p-6 shadow-soft lg:sticky lg:top-32">
              <h2 className="font-display text-2xl tracking-tight">Order Summary</h2>

              {remaining > 0 ? (
                <div className="mt-5 rounded-xl bg-muted/70 p-3.5">
                  <p className="text-[12px] text-muted-foreground">
                    Add{" "}
                    <span className="font-semibold text-foreground">
                      {formatMoney(remaining)}
                    </span>{" "}
                    for complimentary express delivery
                  </p>
                  <Progress
                    value={(subtotal / FREE_SHIPPING_THRESHOLD) * 100}
                    className="mt-2.5 h-1"
                  />
                </div>
              ) : (
                <p className="mt-5 inline-flex rounded-full bg-emerald-600/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  Complimentary express shipping unlocked
                </p>
              )}

              <dl className="mt-5 space-y-3 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{formatMoney(summary.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pan-India Express</dt>
                  <dd className="tabular-nums">
                    {summary.shipping === 0
                      ? "Free"
                      : formatMoney(summary.shipping)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">5% GST (Included)</dt>
                  <dd className="tabular-nums">{formatMoney(summary.tax)}</dd>
                </div>
                <div className="flex justify-between border-t hairline pt-3.5 text-base font-medium">
                  <dt>Total</dt>
                  <dd className="tabular-nums font-semibold">{formatMoney(summary.total)}</dd>
                </div>
              </dl>

              <Button asChild className="mt-6 h-12 w-full rounded-full text-[13px] bg-primary font-semibold shadow-xs">
                <Link
                  to={
                    isAuthenticated
                      ? "/checkout"
                      : "/auth?returnTo=%2Fcheckout"
                  }
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">
                Demo checkout · no real card is charged
              </p>
              <Link
                to="/shop"
                className="mt-3 block text-center text-[12px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Continue browsing
              </Link>
            </aside>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
