import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart";
import { cleanImageUrl, DEFAULT_SPICE_IMAGE, handleImageFallback } from "@/lib/catalog-store";
import { formatMoney, orderSummary } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import {
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
  Lock,
  Package,
  Sparkles,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass = "h-11 rounded-xl bg-card text-sm";

function cardBrand(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (digits.startsWith("5")) return "Mastercard";
  if (digits.startsWith("3")) return "Amex";
  return "Visa";
}

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

export default function Checkout() {
  const { user } = useAuth();
  const { lines, subtotal, clear } = useCart();
  const checkout = useMutation(api.orders.checkout);

  const [fullName, setFullName] = useState(user?.name ?? "");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [cardName, setCardName] = useState(user?.name ?? "");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placed, setPlaced] = useState<{
    number: string;
    total: number;
  } | null>(null);

  const summary = orderSummary(subtotal);

  const fillDemoCard = () => {
    setCardName(user?.name ?? "Alex Morgan");
    setCardNumber("4242 4242 4242 4242");
    setExpiry("12/28");
    setCvc("123");
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 15) {
      setError("Enter a 16-digit demo card number.");
      return;
    }
    if (!/^\d{2}\s?\/\s?\d{2}$/.test(expiry.trim())) {
      setError("Use an expiry in MM/YY format.");
      return;
    }
    if (cvc.replace(/\D/g, "").length < 3) {
      setError("Add the 3-digit security code.");
      return;
    }
    if (!fullName.trim() || !line1.trim() || !city.trim() || !postalCode.trim()) {
      setError("Please complete the shipping address.");
      return;
    }

    setIsPlacing(true);
    try {
      const result = await checkout({
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
        cardName,
        brand: cardBrand(cardNumber),
        last4: digits.slice(-4),
        address: { fullName, line1, city, region, postalCode, country },
      });
      setPlaced({ number: result.number, total: result.total });
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The demo payment could not be completed.",
      );
    } finally {
      setIsPlacing(false);
    }
  };

  if (placed) {
    return (
      <SiteShell>
        <div className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-8">
          <div className="rounded-[1.75rem] border hairline bg-card p-8 text-center shadow-soft sm:p-12">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-6" strokeWidth={2} />
            </span>
            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Demo payment approved
            </p>
            <h1 className="mt-3 font-display text-4xl tracking-tight">
              Order confirmed
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Thanks{user?.name ? `, ${user.name.split(" ")[0]}` : ""} — your
              order is in. Nothing was actually charged.
            </p>
            <div className="mx-auto mt-7 max-w-sm divide-y hairline rounded-xl border hairline text-left text-sm">
              <div className="flex justify-between px-4 py-3">
                <span className="text-muted-foreground">Order</span>
                <span className="font-medium tabular-nums">{placed.number}</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-muted-foreground">Total paid</span>
                <span className="font-medium tabular-nums">
                  {formatMoney(placed.total)}
                </span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-medium">Demo card</span>
              </div>
            </div>
            <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
              <Button asChild className="rounded-full">
                <Link to="/orders">
                  <Package className="mr-2 size-4" /> View order
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/shop">Keep shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </SiteShell>
    );
  }

  if (lines.length === 0) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="font-display text-4xl">Your bag is empty.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Add something to your bag before checking out.
          </p>
          <Button asChild className="mt-7 rounded-full">
            <Link to="/shop">Browse the collection</Link>
          </Button>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8">
        <div className="max-w-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Checkout
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-[2.75rem]">
            Almost yours
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Two steps: where it's going, then the demo payment. No real charge
            will be made.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-9 grid gap-10 pb-4 lg:grid-cols-[1.45fr_0.85fr] lg:items-start lg:gap-12"
        >
          <div className="space-y-8">
            {/* Contact */}
            <section>
              <div className="flex items-center gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  1
                </span>
                <h2 className="text-sm font-medium">Contact</h2>
              </div>
              <div className="mt-4 rounded-xl border hairline bg-card px-4 py-3 text-sm">
                <p className="font-medium">{user?.name ?? "Signed-in customer"}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {user?.email ?? "Email available in your profile"}
                </p>
              </div>
            </section>

            {/* Shipping */}
            <section>
              <div className="flex items-center gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  2
                </span>
                <h2 className="text-sm font-medium">Shipping address</h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3.5">
                <Field label="Full name" className="col-span-2">
                  <Input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Alex Morgan"
                    autoComplete="name"
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="Street address" className="col-span-2">
                  <Input
                    value={line1}
                    onChange={(event) => setLine1(event.target.value)}
                    placeholder="14 Linking Road, Apt 4"
                    autoComplete="address-line1"
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="City">
                  <Input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Mumbai"
                    autoComplete="address-level2"
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="State / region">
                  <Input
                    value={region}
                    onChange={(event) => setRegion(event.target.value)}
                    placeholder="MH"
                    autoComplete="address-level1"
                    className={inputClass}
                  />
                </Field>
                <Field label="Postal code">
                  <Input
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    placeholder="400050"
                    autoComplete="postal-code"
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="Country">
                  <Input
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    autoComplete="country-name"
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            {/* Payment */}
            <section>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    3
                  </span>
                  <h2 className="text-sm font-medium">Payment</h2>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                  <Lock className="size-3" /> Demo mode
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-primary/25 bg-primary/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 size-4 text-primary" />
                  <p className="text-[12px] leading-5 text-muted-foreground">
                    This is a demo store. Use the test card and no money moves.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillDemoCard}
                  className="shrink-0 rounded-full border-primary/20 bg-card text-[11px]"
                >
                  Use demo card
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3.5">
                <Field label="Name on card" className="col-span-2">
                  <Input
                    value={cardName}
                    onChange={(event) => setCardName(event.target.value)}
                    placeholder="Alex Morgan"
                    autoComplete="cc-name"
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="Card number" className="col-span-2">
                  <div className="relative">
                    <Input
                      value={cardNumber}
                      onChange={(event) =>
                        setCardNumber(formatCardNumber(event.target.value))
                      }
                      placeholder="4242 4242 4242 4242"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      className={cn(inputClass, "pr-11 tracking-wider")}
                      required
                    />
                    <CreditCard className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </Field>
                <Field label="Expiry">
                  <Input
                    value={expiry}
                    onChange={(event) => {
                      const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
                      setExpiry(
                        digits.length > 2
                          ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                          : digits,
                      );
                    }}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="CVC">
                  <Input
                    value={cvc}
                    onChange={(event) =>
                      setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="123"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    className={inputClass}
                    required
                  />
                </Field>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Lock className="size-3" />
                Only the last four digits are stored, for demo receipts.
              </p>
            </section>
          </div>

          {/* Summary */}
          <aside className="rounded-2xl border hairline bg-card p-6 shadow-soft lg:sticky lg:top-32">
            <h2 className="font-display text-2xl tracking-tight">
              Order summary
            </h2>
            <ul className="mt-4 space-y-3">
              {lines.map((line) => (
                <li key={line.productId} className="flex items-center gap-3">
                  <img
                    src={cleanImageUrl(line.image) || DEFAULT_SPICE_IMAGE}
                    alt={line.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      handleImageFallback(e, line.image);
                    }}
                    className="size-14 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium">
                      {line.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                      Qty {line.quantity}
                    </p>
                  </div>
                  <p className="text-[12px] tabular-nums">
                    {formatMoney(line.price * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2.5 border-t hairline pt-4 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatMoney(summary.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="tabular-nums">
                  {summary.shipping === 0
                    ? "Free"
                    : formatMoney(summary.shipping)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax</dt>
                <dd className="tabular-nums">{formatMoney(summary.tax)}</dd>
              </div>
              <div className="flex justify-between border-t hairline pt-3 text-base font-medium">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatMoney(summary.total)}</dd>
              </div>
            </dl>

            {error && (
              <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2.5 text-[12px] leading-5 text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isPlacing}
              className="mt-5 h-12 w-full rounded-full text-[13px]"
            >
              {isPlacing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Processing demo payment…
                </>
              ) : (
                <>
                  Pay {formatMoney(summary.total)}
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Demo only — nothing is charged
            </p>
          </aside>
        </form>
      </div>
    </SiteShell>
  );
}
