import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCatalog } from "@/hooks/use-catalog";
import { formatMoney } from "@/lib/format";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CreditCard,
  RotateCcw,
  Star,
  Truck,
} from "lucide-react";
import { Link } from "react-router";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const EDITORIAL_IMAGE =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=80";

export default function Landing() {
  const products = useCatalog();
  const { isAuthenticated } = useAuth();
  const featured = (products ?? []).filter((p) => p.featured).slice(0, 4);
  const hero = featured[0] ?? products?.[0];

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute -right-40 -top-32 size-[520px] rounded-full bg-sand/50 blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-10 lg:pb-24 lg:pt-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border hairline bg-card/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              Studio collection · 2026
            </div>
            <h1 className="mt-7 font-display text-[clamp(3.1rem,7vw,5.2rem)] leading-[0.92] tracking-[-0.01em] text-balance-tight">
              Everyday objects,
              <br />
              <span className="italic text-primary">considered.</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-7 text-muted-foreground">
              A small collection of quiet, well-made things — audio, timepieces,
              light and the desk you sit at. Choose fewer things, use them
              longer.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="group h-12 rounded-full px-6 text-[13px]"
              >
                <Link to="/shop">
                  Shop the collection
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-foreground/15 px-6 text-[13px]"
              >
                <Link to={isAuthenticated ? "/orders" : "/auth?returnTo=%2Fshop"}>
                  {isAuthenticated ? "View your orders" : "Sign in to order"}
                </Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["A", "M", "J"].map((letter, index) => (
                    <span
                      key={letter}
                      className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-sand text-[10px] font-semibold text-primary"
                      style={{ zIndex: 3 - index }}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] leading-4 text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Star className="size-3 fill-sand-deep text-sand-deep" />
                    4.9 average
                  </span>
                  from 2,100+ households
                </div>
              </div>
              <div className="hidden h-8 w-px bg-border sm:block" />
              <p className="text-[11px] leading-4 text-muted-foreground">
                <span className="block font-medium text-foreground">
                  Free shipping
                </span>
                on orders over ₹6,250
              </p>
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-[460px] lg:max-w-none"
          >
            <div className="absolute -left-4 top-8 hidden h-[88%] w-[86%] rounded-[2rem] border hairline bg-sand/70 sm:block" />
            <div className="relative overflow-hidden rounded-[2rem] bg-muted shadow-lift">
              {hero ? (
                <img
                  src={hero.image}
                  alt={hero.name}
                  className="aspect-[4/5] w-full object-cover"
                />
              ) : (
                <div className="aspect-[4/5] w-full animate-pulse bg-muted" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                {hero ? (
                  <>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                        Studio pick
                      </p>
                      <p className="mt-1 font-display text-xl text-white">
                        {hero.name}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-medium tabular-nums text-primary">
                      {formatMoney(hero.price)}
                    </span>
                  </>
                ) : (
                  <div className="h-10 w-40 rounded-full bg-white/20" />
                )}
              </div>
            </div>

            <div className="absolute -right-3 top-6 rounded-2xl border hairline bg-card/95 px-4 py-3 shadow-soft backdrop-blur sm:-right-6">
              <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Dispatch
              </p>
              <p className="mt-0.5 text-xs font-medium">Within 48 hours</p>
            </div>
            <Link
              to={hero ? `/product/${hero.slug}` : "/shop"}
              className="absolute -bottom-5 -left-2 inline-flex items-center gap-2 rounded-full border hairline bg-card px-4 py-2.5 text-[11px] font-medium shadow-soft transition-transform hover:-translate-y-0.5 sm:-left-6"
            >
              Explore this piece
              <ArrowUpRight className="size-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Promises strip */}
      <section className="border-y hairline bg-card/50">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-4 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:px-8">
          {[
            "Free shipping over ₹6,250",
            "30-day returns",
            "Demo payments only",
            "Small-batch production",
          ].map((item, index) => (
            <span key={item} className="flex items-center gap-10">
              {index > 0 && <span className="hidden size-1 rounded-full bg-border sm:block" />}
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Collection */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              The collection
            </p>
            <h2 className="mt-3 font-display text-4xl leading-none tracking-tight sm:text-[2.75rem]">
              Four good things to start with
            </h2>
          </div>
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 border-b border-foreground/20 pb-1 text-[12px] font-medium transition-colors hover:border-foreground"
          >
            Browse all objects
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {products === undefined
            ? Array.from({ length: 4 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            : featured.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </div>
      </section>

      {/* Editorial */}
      <section className="bg-card/60">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
          <div className="relative">
            <div className="overflow-hidden rounded-[1.75rem]">
              <img
                src={EDITORIAL_IMAGE}
                alt="A quiet living room with warm natural light"
                loading="lazy"
                className="aspect-[5/4] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 right-4 max-w-[210px] rounded-2xl border hairline bg-background p-4 shadow-soft sm:right-8">
              <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Materials
              </p>
              <p className="mt-1.5 text-xs leading-5 text-foreground/80">
                Solid ash, waxed canvas, stoneware, full-grain leather.
              </p>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Our approach
            </p>
            <h2 className="mt-3 font-display text-4xl leading-[1.02] tracking-tight sm:text-[3rem]">
              Made to be lived with,
              <br />
              not just looked at.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-muted-foreground">
              We work with a short list of makers and keep the range small on
              purpose. Fewer finishes, replaceable parts, and materials that
              pick up character instead of wearing out.
            </p>
            <ul className="mt-7 space-y-3.5">
              {[
                "Repairable construction and spare parts",
                "Natural, low-finish materials only",
                "Packed and shipped plastic-free",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3" strokeWidth={2.5} />
                  </span>
                  <span className="text-foreground/80">{line}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              variant="outline"
              className="mt-8 rounded-full border-foreground/15"
            >
              <Link to="/shop?category=Home">Shop objects for home</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: Truck,
              title: "Free shipping over ₹6,250",
              copy: "Dispatched within 48 hours, tracked end to end.",
            },
            {
              icon: RotateCcw,
              title: "30 days to change your mind",
              copy: "Return anything unworn or unused, no questions asked.",
            },
            {
              icon: CreditCard,
              title: "Demo checkout",
              copy: "Payments run in demo mode — no real card is ever charged.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border hairline bg-card p-6 shadow-soft"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-sand text-primary">
                <item.icon className="size-[18px]" strokeWidth={1.6} />
              </span>
              <h3 className="mt-4 text-sm font-medium">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                {item.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="rounded-[2rem] bg-sand px-6 py-14 text-center sm:px-16 sm:py-20">
          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className="size-3.5 fill-primary/70 text-primary/70"
              />
            ))}
          </div>
          <blockquote className="mx-auto mt-6 max-w-2xl font-display text-[clamp(1.7rem,3.6vw,2.6rem)] leading-[1.15] text-primary">
            “Two years in and the lamp, the pack, the chair — everything still
            looks like the day it arrived. That almost never happens.”
          </blockquote>
          <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-primary/60">
            Elena R. · Verified customer
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-7 py-14 text-primary-foreground sm:px-14 sm:py-16">
          <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-primary-foreground/10 blur-2xl" />
          <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-lg">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary-foreground/60">
                Start small
              </p>
              <h2 className="mt-3 font-display text-4xl leading-[1.02] sm:text-[3.2rem]">
                Start with one good thing.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-primary-foreground/70">
                Browse the collection, add a piece to your bag and check out with
                the demo card. It takes about a minute.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="h-12 shrink-0 rounded-full bg-primary-foreground px-6 text-[13px] text-primary hover:bg-primary-foreground/90"
            >
              <Link to="/shop">
                Browse the shop
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
