import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCatalog } from "@/hooks/use-catalog";
import { cleanImageUrl, DEFAULT_SPICE_IMAGE, handleImageFallback } from "@/lib/catalog-store";
import { formatMoney } from "@/lib/format";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CreditCard,
  Flame,
  Flower2,
  Headphones,
  Leaf,
  Layers,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Truck,
  Volume2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export default function Landing() {
  const products = useCatalog();
  const { isAuthenticated } = useAuth();
  const [activeTerroir, setActiveTerroir] = useState("Idukki Valley (Cardamom)");
  const [isPlayingAroma, setIsPlayingAroma] = useState(false);

  const featured = useMemo(() => {
    const all = products ?? [];
    const custom = all.filter((p) => p._id?.startsWith("spice_custom_"));
    const markedFeatured = all.filter(
      (p) => p.featured && !p._id?.startsWith("spice_custom_"),
    );
    const rest = all.filter(
      (p) => !p.featured && !p._id?.startsWith("spice_custom_"),
    );
    return [...custom, ...markedFeatured, ...rest].slice(0, 8);
  }, [products]);
  const hero = featured[0] ?? products?.[0];

  const terroirs = [
    {
      name: "Idukki Valley (Cardamom)",
      color: "#2C5E43",
      spice: "8mm+ Green Cardamom",
      elevation: "1,200m",
      notes: "Sweet eucalyptus, wild pine, citrus camphor",
    },
    {
      name: "Pampore, Kashmir (Saffron)",
      color: "#9E2A2B",
      spice: "Mongra A++ Saffron",
      elevation: "1,600m",
      notes: "Golden honey, warm cedar, autumnal warmth",
    },
    {
      name: "Wayanad, Malabar (Pepper)",
      color: "#3F3027",
      spice: "Tellicherry Extra Bold",
      elevation: "850m",
      notes: "Crushed cedar, pine resin, slow glowing heat",
    },
    {
      name: "Jaintia Hills (Turmeric)",
      color: "#D97706",
      spice: "Lakadong 9.2% Curcumin",
      elevation: "700m",
      notes: "Sun-warmed clay, peppery amber, sweet ginger",
    },
  ];

  return (
    <SiteShell>
      <div className="overflow-hidden">
        {/* Top Ticker Notification */}
        <div className="border-b border-border/60 bg-[#20382F]/5 px-4 py-2 text-center text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-2">
          <span className="flex size-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="font-semibold text-foreground">Winter 2025/2026 Harvest Drop</span>
          <span className="text-border">·</span>
          <span>Complimentary express delivery across India over ₹1,500</span>
          <span className="text-border">·</span>
          <span className="text-primary font-semibold">100% Single-Estate Harvest Guarantee</span>
        </div>

        {/* Hero Section */}
        <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24">
          <div className="pointer-events-none absolute -right-40 -top-32 size-[560px] rounded-full bg-[#E5A93B]/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-40 top-1/2 size-[420px] rounded-full bg-[#1B382B]/10 blur-3xl" />

          <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Studio Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground shadow-xs">
                <Leaf className="size-3 text-emerald-600" />
                Single-Origin Indian Terroir Spices
              </div>

              {/* Bold Editorial Headline */}
              <h1 className="mt-6 font-display text-[clamp(2.8rem,6.8vw,5.2rem)] leading-[0.93] tracking-[-0.015em] text-foreground">
                Indian spices,
                <br />
                <span className="italic text-primary">harvested by hand.</span>
              </h1>

              {/* Subheading */}
              <p className="mt-5 max-w-lg text-[15px] leading-7 text-muted-foreground">
                Sun-dried 8mm+ jumbo green cardamom from Kerala’s high-altitude mist slopes,
                hand-plucked Kashmiri Mongra saffron, high-curcumin Lakadong turmeric, and
                vine-ripened Tellicherry pepper. Fresh from single-family estates, packaged in
                airtight brass tins within days of harvest.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="group h-12 rounded-full bg-[#20382F] hover:bg-[#20382F]/90 text-white px-7 text-[13px] font-semibold shadow-md gap-2"
                >
                  <Link to="/shop">
                    Explore Single-Origin Spices
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-foreground/20 px-6 text-[13px] font-medium shadow-xs"
                >
                  <Link to={isAuthenticated ? "/orders" : "/auth?returnTo=%2Fshop"}>
                    {isAuthenticated ? "My orders & tracking" : "Sign in / Register"}
                  </Link>
                </Button>
              </div>

              {/* Interactive Terroir Swatches on Hero */}
              <div className="mt-9 rounded-2xl border border-border/80 bg-card/70 p-4 backdrop-blur-xs shadow-xs">
                <div className="flex items-center justify-between text-[11px] mb-2.5 font-medium">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Flower2 className="size-3.5 text-primary" /> Select Single-Origin Terroir:
                  </span>
                  <span className="font-semibold text-primary">{activeTerroir}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {terroirs.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setActiveTerroir(t.name)}
                      className={`group flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer ${
                        activeTerroir === t.name
                          ? "border-primary bg-primary text-primary-foreground shadow-xs font-semibold"
                          : "border-border/80 bg-background text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <span
                        className="size-2.5 rounded-full ring-1 ring-border"
                        style={{ backgroundColor: t.color }}
                      />
                      <span>{t.spice}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground/80 italic border-t border-border/40 pt-2">
                  Aromatic profile: {terroirs.find((t) => t.name === activeTerroir)?.notes}
                </p>
              </div>

              {/* Trust Metric Row */}
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 pt-4 border-t border-border/60">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["K", "M", "S", "D"].map((letter, index) => (
                      <span
                        key={letter}
                        className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-sand text-[10px] font-bold text-primary shadow-xs"
                        style={{ zIndex: 4 - index }}
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] leading-4 text-muted-foreground">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Star className="size-3 fill-sand-deep text-sand-deep" />
                      4.95 / 5.0 Rating
                    </span>
                    trusted by 2,800+ chefs &amp; heritage kitchens
                  </div>
                </div>

                <div className="hidden h-7 w-px bg-border sm:block" />

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                  <Truck className="size-3.5 text-primary" />
                  <span>Fresh crop dispatched within 48h</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-[480px] lg:max-w-none"
            >
              <div className="absolute -left-4 top-8 hidden h-[88%] w-[88%] rounded-[2.5rem] border border-border/80 bg-sand/60 sm:block" />
              <div className="relative overflow-hidden rounded-[2.2rem] bg-muted shadow-2xl border border-border/60">
                {hero ? (
                  <img
                    src={cleanImageUrl(hero.image) || DEFAULT_SPICE_IMAGE}
                    alt={hero.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageFallback(e, hero.image)}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                ) : (
                  <div className="aspect-[4/5] w-full animate-pulse bg-muted" />
                )}

                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Sensory Aroma Pulse Button */}
                <button
                  type="button"
                  onClick={() => setIsPlayingAroma(!isPlayingAroma)}
                  className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1.5 text-[11px] font-medium text-white backdrop-blur-md border border-white/20 hover:bg-black/80 transition-all cursor-pointer shadow-md"
                >
                  <Sparkles className="size-3.5 text-amber-400" />
                  <span>
                    {isPlayingAroma ? "Cardamom Terpene Release: 8.4%" : "Sensory Terpene Profile"}
                  </span>
                  {isPlayingAroma && (
                    <span className="flex gap-0.5 items-end h-3">
                      <span className="w-0.5 bg-emerald-400 animate-pulse h-2" />
                      <span className="w-0.5 bg-emerald-400 animate-pulse h-3" />
                      <span className="w-0.5 bg-emerald-400 animate-pulse h-1.5" />
                    </span>
                  )}
                </button>

                {/* Card Bottom Meta */}
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 z-10">
                  {hero ? (
                    <>
                      <div>
                        <div className="inline-block rounded-full bg-sand/90 text-primary px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider mb-1">
                          Harvest Highlight · Grade AGEB
                        </div>
                        <p className="font-display text-2xl text-white font-medium">
                          {hero.name}
                        </p>
                        <p className="text-xs text-white/80 line-clamp-1">
                          {hero.tagline}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3.5 py-1.5 text-xs font-bold tabular-nums text-primary shadow-lg shrink-0">
                        {formatMoney(hero.price)} / {(hero as any).weight || "100g"}
                      </span>
                    </>
                  ) : (
                    <div className="h-10 w-44 rounded-full bg-white/20 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Floating Dispatch Card */}
              <div className="absolute -right-3 top-6 rounded-2xl border border-border/80 bg-card/95 px-4 py-3 shadow-lg backdrop-blur-md sm:-right-6">
                <p className="text-[9px] uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400 font-bold">
                  Single-Estate
                </p>
                <p className="mt-0.5 text-xs font-semibold text-foreground">
                  Idukki, Kerala (1,200m)
                </p>
              </div>

              {/* Quick Link Badge */}
              <Link
                to={hero ? `/product/${hero.slug}` : "/shop"}
                className="absolute -bottom-5 -left-2 inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-4 py-2.5 text-[11px] font-semibold text-foreground shadow-lg transition-transform hover:-translate-y-0.5 sm:-left-6"
              >
                Inspect terroir specifications
                <ArrowUpRight className="size-3.5 text-primary" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Featured Collection Grid */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-8 sm:py-22">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                The Heritage Pantry
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl text-foreground">
                Four heirloom spices to begin with
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              Browse complete single-origin catalog ({products?.length ?? 10} spices)
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {products === undefined
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <ProductCardSkeleton key={idx} />
                ))
              : featured.map((product) => (
                  <ProductCard key={product._id} product={product as any} />
                ))}
          </div>
        </section>

        {/* Anti-Slop Bento Grid Showcase: Artisanal Spice Craft */}
        <section className="bg-card/50 border-y border-border/70 py-16 sm:py-24 px-4 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-xl mb-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Uncompromising Terroir Standards
              </span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl text-foreground">
                Why single-origin spices change every dish.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Essential Oil Density */}
              <div className="md:col-span-2 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary mb-4">
                    <Sparkles className="size-3" /> 8.4% Essential Volatile Oils
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl text-foreground">
                    Whole pods that burst with aroma when cracked.
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-6 max-w-lg">
                    Commercial grocery store spices sit in hot warehouses for months, drying out
                    their vital volatile oils. Our green cardamom and Tellicherry pepper are harvested
                    at maximum oil maturity and vacuum-sealed at the estate to retain natural moisture and camphor.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Tested &amp; certified: Grade Alleppey Green Extra Bold</span>
                  <span className="font-mono text-foreground font-semibold">100% Unpolished</span>
                </div>
              </div>

              {/* Card 2: Micro Batch Stone Milling */}
              <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary mb-4">
                    Stone Ground
                  </div>
                  <h3 className="font-display text-2xl text-foreground">
                    Cold-milled under 35°C.
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-6">
                    Industrial high-speed blade pulverizers generate heat that evaporates fragile spice terpenes.
                    We slow-grind on traditional stone chakki mills in small 20kg batches.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-[11px] text-primary font-semibold">
                  Zero Preservatives or Starch Fillers
                </div>
              </div>

              {/* Card 3: Direct Estate Trade */}
              <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary mb-4">
                    Direct Trade
                  </div>
                  <h3 className="font-display text-2xl text-foreground">
                    Single-estate harvest transparency.
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-6">
                    Every tin is batch-numbered with exact farm location, elevation, and harvest date.
                    We pay cultivators 2.5× local commodity mandi prices.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-[11px] text-muted-foreground">
                  Sourced from Kerala, Kashmir &amp; Meghalaya
                </div>
              </div>

              {/* Card 4: Heritage Tin Protection */}
              <div className="md:col-span-2 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary mb-4">
                    Airtight Preservation
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl text-foreground">
                    Double-sealed brass &amp; UV-proof tins.
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-6 max-w-lg">
                    Light, heat, and air degrade spice aromatics rapidly. Our custom matte tins
                    feature airtight inner lids that lock out humidity and oxygen, keeping pods,
                    saffron threads, and peppercorns kiln-fresh for 24 months.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Food-grade reusable tins</span>
                  <span className="font-semibold text-emerald-600">100% Recyclable Brass &amp; Steel</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Review Voice */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-8">
          <div className="rounded-[2.5rem] bg-sand/80 border border-border/60 p-8 sm:p-14 text-center">
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-primary text-primary" />
              ))}
            </div>
            <blockquote className="mx-auto max-w-2xl font-display text-[clamp(1.6rem,3.4vw,2.5rem)] leading-tight text-primary">
              “Forma’s Idukki green cardamom and Kashmiri Mongra saffron completely transformed
              our kitchen. You open a tin and the whole room smells of sweet eucalyptus, floral pine,
              and sun-warmed earth. It is incomparable to commercial store spices.”
            </blockquote>
            <p className="mt-6 text-xs uppercase tracking-[0.18em] font-bold text-primary/80">
              Chef Priya Raghavan · Chef Patron, The Malabar Table, Kochi
            </p>
          </div>
        </section>

        {/* Final Elevated CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1B382B] p-8 sm:p-16 text-white shadow-2xl">
            <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-[#E5A93B]/20 blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="max-w-xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D7C4A5]">
                  Experience Real Terroir
                </span>
                <h2 className="mt-3 font-display text-3xl sm:text-5xl leading-[1.02]">
                  Cook with the freshest harvest in India.
                </h2>
                <p className="mt-4 text-xs sm:text-sm leading-6 text-white/80">
                  Every order ships in airtight gift-ready tins with detailed origin certificates.
                  Complimentary express shipping across India on orders over ₹1,500.
                </p>
              </div>

              <Button
                asChild
                size="lg"
                className="h-13 rounded-full bg-[#D7C4A5] text-[#1B382B] hover:bg-[#EFE9DE] text-sm font-bold px-8 shadow-md"
              >
                <Link to="/shop">
                  Browse Spices Collection
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
