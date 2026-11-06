import { SiteShell } from "@/components/site/SiteShell";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { formatDate, formatMoney } from "@/lib/format";
import { useQuery } from "convex/react";
import { ArrowRight, CreditCard, Lock, ReceiptText } from "lucide-react";
import { Link } from "react-router";

export default function Payments() {
  const payments = useQuery(api.payments.listMine);

  const succeeded = (payments ?? []).filter(
    (payment) => payment.status === "succeeded",
  );
  const refunded = (payments ?? []).filter(
    (payment) => payment.status === "refunded",
  );
  const spent = succeeded.reduce((sum, payment) => sum + payment.amount, 0);
  const returned = refunded.reduce((sum, payment) => sum + payment.amount, 0);
  const latestCard = (payments ?? []).find(
    (payment) => payment.last4 && payment.last4 !== "0000",
  );

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-5xl px-5 pt-12 sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Account
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl tracking-tight sm:text-[2.75rem]">
            Payments
          </h1>
          <Link
            to="/orders"
            className="border-b border-foreground/20 pb-1 text-[12px] font-medium transition-colors hover:border-foreground"
          >
            View orders
          </Link>
        </div>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
          Receipts from the demo checkout. All payments run in test mode, so no
          money ever moves.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border hairline bg-card px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Paid (demo)
            </p>
            <p className="mt-1 text-xl font-medium tabular-nums">
              {formatMoney(spent)}
            </p>
          </div>
          <div className="rounded-xl border hairline bg-card px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Refunded
            </p>
            <p className="mt-1 text-xl font-medium tabular-nums">
              {formatMoney(returned)}
            </p>
          </div>
          <div className="rounded-xl border hairline bg-card px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Transactions
            </p>
            <p className="mt-1 text-xl font-medium tabular-nums">
              {payments?.length ?? 0}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 rounded-2xl border hairline bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-11 items-center justify-center rounded-xl bg-sand text-primary">
              <CreditCard className="size-5" strokeWidth={1.6} />
            </span>
            <div>
              <p className="text-sm font-medium">
                {latestCard
                  ? `${latestCard.brand} ending ${latestCard.last4}`
                  : "No card saved"}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {latestCard
                  ? "Demo card on file — last four digits only"
                  : "Use the test card 4242 4242 4242 4242 at checkout"}
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <Lock className="size-3" /> Demo mode
          </span>
        </div>

        <h2 className="mt-10 font-display text-2xl tracking-tight">
          Receipts
        </h2>

        {payments === undefined ? (
          <div className="mt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl border hairline bg-card"
              />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="mt-4 flex flex-col items-center rounded-[1.75rem] border hairline bg-card px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-sand text-primary">
              <ReceiptText className="size-6" strokeWidth={1.5} />
            </span>
            <h3 className="mt-5 font-display text-2xl">No payments yet.</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Your first demo checkout will show up here with a receipt and
              reference number.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/shop">
                Browse the collection
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border hairline bg-card">
            <div className="hidden grid-cols-[1.3fr_1fr_0.8fr_0.7fr] gap-4 border-b hairline bg-muted/40 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:grid">
              <span>Reference</span>
              <span>Method</span>
              <span>Date</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="divide-y hairline">
              {payments.map((payment) => (
                <div
                  key={payment._id}
                  className="grid gap-2 px-5 py-4 sm:grid-cols-[1.3fr_1fr_0.8fr_0.7fr] sm:items-center sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[11px] text-foreground/80">
                      {payment.reference}
                    </p>
                    <div className="mt-1 sm:hidden">
                      <StatusBadge status={payment.status} />
                    </div>
                  </div>
                  <div className="text-[12px] text-muted-foreground">
                    {payment.brand} ··· {payment.last4}
                  </div>
                  <div className="text-[12px] text-muted-foreground">
                    {formatDate(payment.createdAt)}
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-[13px] font-medium tabular-nums">
                      {formatMoney(payment.amount)}
                    </span>
                    <span className="hidden sm:inline">
                      <StatusBadge status={payment.status} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-5 text-[11px] leading-5 text-muted-foreground">
          Want real card processing? Stripe Checkout can replace the demo
          payment step later — the order and receipt flow stays the same.
        </p>
      </div>
    </SiteShell>
  );
}
