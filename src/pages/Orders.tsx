import { SiteShell } from "@/components/site/SiteShell";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { ArrowRight, Package } from "lucide-react";
import { Link } from "react-router";

const STEPS = ["paid", "shipped", "delivered"] as const;

function OrderProgress({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <p className="text-[11px] text-muted-foreground">
        Cancelled — the demo payment was refunded.
      </p>
    );
  }
  const activeIndex = STEPS.indexOf(status as (typeof STEPS)[number]);
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "size-1.5 rounded-full",
                index <= activeIndex ? "bg-primary" : "bg-border",
              )}
            />
            <span
              className={cn(
                "text-[10px] uppercase tracking-[0.12em]",
                index <= activeIndex
                  ? "text-foreground"
                  : "text-muted-foreground/70",
              )}
            >
              {step}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <span
              className={cn(
                "h-px w-6",
                index < activeIndex ? "bg-primary" : "bg-border",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Orders() {
  const orders = useQuery(api.orders.listMine);

  const totalSpent = (orders ?? [])
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);
  const activeCount = (orders ?? []).filter(
    (order) => order.status === "paid" || order.status === "shipped",
  ).length;

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-5xl px-5 pt-12 sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Account
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl tracking-tight sm:text-[2.75rem]">
            Orders
          </h1>
          <Link
            to="/shop"
            className="border-b border-foreground/20 pb-1 text-[12px] font-medium transition-colors hover:border-foreground"
          >
            Shop again
          </Link>
        </div>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
          Every demo purchase lands here, with its payment receipt and shipping
          status.
        </p>

        {orders && orders.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: "Orders", value: String(orders.length) },
              { label: "In progress", value: String(activeCount) },
              { label: "Total value", value: formatMoney(totalSpent) },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border hairline bg-card px-4 py-3.5"
              >
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-lg font-medium tabular-nums">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {orders === undefined ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-2xl border hairline bg-card"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-[1.75rem] border hairline bg-card px-6 py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-sand text-primary">
              <Package className="size-6" strokeWidth={1.5} />
            </span>
            <h2 className="mt-5 font-display text-3xl">No orders yet.</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              When you check out with the demo card, your order and payment
              receipt will appear here.
            </p>
            <Button asChild className="mt-7 rounded-full px-6">
              <Link to="/shop">
                Start shopping
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <article
                key={order._id}
                className="overflow-hidden rounded-2xl border hairline bg-card shadow-soft"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b hairline bg-muted/40 px-5 py-3.5">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <p className="text-[12px] font-medium tabular-nums">
                      {order.number}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}{" "}
                      item
                      {order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      ) === 1
                        ? ""
                        : "s"}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="grid gap-5 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="flex flex-wrap items-center gap-3">
                    {order.items.map((item) => (
                      <Link
                        key={item.productId}
                        to={`/product/${item.slug}`}
                        className="group flex items-center gap-2.5"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="size-12 rounded-lg object-cover"
                        />
                        <span className="max-w-[150px] truncate text-[12px] text-foreground/80 transition-colors group-hover:text-foreground">
                          {item.name}
                          <span className="ml-1 text-muted-foreground">
                            ×{item.quantity}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      Total
                    </p>
                    <p className="text-base font-medium tabular-nums">
                      {formatMoney(order.total)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t hairline px-5 py-3.5">
                  <OrderProgress status={order.status} />
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span>
                      {order.items[0]?.name}
                      {order.items.length > 1
                        ? ` +${order.items.length - 1} more`
                        : ""}
                    </span>
                    {order.payment && (
                      <span>
                        {order.payment.brand} ··· {order.payment.last4}
                      </span>
                    )}
                    <span>
                      {order.shippingAddress.city}, {order.shippingAddress.region}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
