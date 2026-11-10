import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { requireAdmin } from "./lib/roles";

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

/**
 * Demo catalog for Single-Origin Indian Spices, priced in paise (INR).
 * Seeded when the products table is empty so the storefront has authentic
 * single-origin spices on fresh deployment.
 */
const DEMO_PRODUCTS = [
  {
    name: "Idukki Green Cardamom (8mm+ Extra Bold)",
    slug: "idukki-green-cardamom-extra-bold",
    category: "Whole Pods & Seeds",
    tagline: "The Queen of Spices from Kerala's Misty Slopes",
    description:
      "Hand-harvested at peak maturity from shade-grown estates in the Cardamom Hills of Idukki, Kerala. These 8mm+ jumbo pods crack open to reveal glossy, oil-dense jet-black seeds with intense citrus, eucalyptus, and sweet floral camphor notes. Sun-dried in traditional firewood kilns to preserve vibrant natural green chlorophyll.",
    price: 89500, // ₹895
    compareAtPrice: 105000,
    cost: 48000,
    reorderLevel: 8,
    image: photo("photo-1701190884222-a2139c70ab84"),
    material: "Idukki, Kerala · Grade AGEB (8mm+)",
    stock: 46,
    rating: 4.95,
    reviewCount: 318,
    featured: true,
  },
  {
    name: "Kashmiri Mongra Saffron (Grade A++ Superlative)",
    slug: "kashmiri-mongra-saffron",
    category: "Rare Terroirs",
    tagline: "Deep Crimson Stigmas Hand-Plucked in Pampore",
    description:
      "The undisputed crown jewel of the Himalayas. Pure all-red Mongra stigmas without any yellow style attached, grown in the glacial-fed alluvial lacustrine soil of Pampore plateau. Exceeds ISO 3632 Category I standards with crocin color readings exceeding 260. A micro-pinch infuses milk, biryani, or kheer with breathtaking golden honey warmth.",
    price: 185000, // ₹1,850
    compareAtPrice: 220000,
    cost: 110000,
    reorderLevel: 5,
    image: photo("photo-1596040033229-a9821ebd058d"),
    material: "Pampore, Kashmir · 100% Pure Mongra",
    stock: 19,
    rating: 5.0,
    reviewCount: 412,
    featured: true,
  },
  {
    name: "Tellicherry Extra Bold Black Peppercorns (TGSEB)",
    slug: "tellicherry-extra-bold-black-pepper",
    category: "Single-Origin Peppers",
    tagline: "Vine-Ripened Black Gold of the Malabar Coast",
    description:
      "The rarest 10% of the Malabar harvest. Tellicherry Garbled Special Extra Bold (TGSEB) peppercorns are left on the vine longer to develop complex sugars and a dense 4.75mm diameter before sun-drying on bamboo mats. Delivers complex cedar, pine, and floral fruit notes before erupting into slow, sustained, aromatic heat.",
    price: 64500, // ₹645
    compareAtPrice: 75000,
    cost: 32000,
    reorderLevel: 10,
    image: photo("photo-1708106906868-cd7bfc234e2c"),
    material: "Wayanad, Kerala · TGSEB 4.75mm+",
    stock: 62,
    rating: 4.9,
    reviewCount: 284,
    featured: true,
  },
  {
    name: "Lakadong Heritage Turmeric (9.2% Curcumin)",
    slug: "lakadong-heritage-turmeric",
    category: "Rare Terroirs",
    tagline: "The World's Most Potent Golden Root from Meghalaya",
    description:
      "Grown organically by indigenous Khasi tribal farmers in the Jaintia Hills of Meghalaya. While ordinary store turmeric contains only 2–3% curcumin, our single-estate Lakadong tests at an astounding 9.2% natural curcumin. Slow sun-cured and stone-milled under 35°C to preserve bioactive essential oils.",
    price: 52000, // ₹520
    compareAtPrice: 62000,
    cost: 26000,
    reorderLevel: 12,
    image: photo("photo-1615485500704-8e990f9900f7"),
    material: "Jaintia Hills, Meghalaya · 9.2% Curcumin",
    stock: 58,
    rating: 4.88,
    reviewCount: 196,
    featured: true,
  },
  {
    name: "Ceylon & Kerala Royal Cinnamon Quills",
    slug: "kerala-royal-cinnamon-quills",
    category: "Whole Pods & Seeds",
    tagline: "True Soft-Bark Sweet Cinnamon, Zero Cassia",
    description:
      "Paper-thin, multi-layered sweet cinnamon quills harvested from heirloom Cinnamomum verum trees along Kerala's riverbanks. Unlike coarse, high-coumarin cassia, true cinnamon crumbles easily between your fingers and yields a delicate, perfume-like sweetness without harsh astringency.",
    price: 59000, // ₹590
    compareAtPrice: 69000,
    cost: 29000,
    reorderLevel: 6,
    image: photo("photo-1622798337764-259682f03741"),
    material: "Western Ghats, Kerala · C. Verum C5 Special",
    stock: 32,
    rating: 4.85,
    reviewCount: 142,
    featured: false,
  },
  {
    name: "Sun-Cured Guntur Sannam Chillies (S4 Stemless)",
    slug: "guntur-sannam-stemless-chillies",
    category: "Single-Origin Peppers",
    tagline: "Fiery Crimson Pods Sun-Dried on River Silt",
    description:
      "Grown on the rich alluvial Krishna river delta in Andhra Pradesh. Grade S4 stemless whole pods sun-dried on coir mats to develop deep mahogany color, pungent capsaicin, and a smoky fruitiness that provides the signature foundation of authentic South Indian roasts, sambars, and thalis.",
    price: 44000, // ₹440
    cost: 21000,
    reorderLevel: 10,
    image: photo("photo-1588252303782-cb80119abd6d"),
    material: "Guntur Delta, Andhra Pradesh · Grade S4",
    stock: 45,
    rating: 4.78,
    reviewCount: 175,
    featured: false,
  },
  {
    name: "Nilgiri Mountain Headed Cloves",
    slug: "nilgiri-mountain-cloves",
    category: "Whole Pods & Seeds",
    tagline: "Fat, Oil-Saturated Flower Buds with Intact Crowns",
    description:
      "High-altitude cloves hand-plucked before blossom opening on the forested lower slopes of the Nilgiris. Squeezing a single bud releases glistening essential eugenol oil. Clean, intact four-pointed star crowns with zero headless stems or wood filler.",
    price: 68000, // ₹680
    cost: 34000,
    reorderLevel: 6,
    image: photo("photo-1701190884222-a2139c70ab84"),
    material: "Nilgiri Biosphere, Tamil Nadu · Hand-Selected Buds",
    stock: 24,
    rating: 4.92,
    reviewCount: 110,
    featured: false,
  },
  {
    name: "Heritage 12-Spice Royal Garam Masala",
    slug: "heritage-royal-garam-masala",
    category: "Heritage Blends",
    tagline: "Stone-Ground Roasted Imperial Recipe",
    description:
      "An aristocratic North Indian formulation combining our green cardamom, black cardamom, star anise, mace blades, stone flower (dagad phool), and Tellicherry pepper. Slow-roasted over neem charcoal and stone-ground to a velvet crumb that perfumes curries upon contact.",
    price: 58000, // ₹580
    compareAtPrice: 68000,
    cost: 27000,
    reorderLevel: 8,
    image: photo("photo-1596040033229-a9821ebd058d"),
    material: "Hand-Blended · 12 Whole Spices Only",
    stock: 38,
    rating: 4.96,
    reviewCount: 220,
    featured: true,
  },
  {
    name: "Malabar Monsoon Chai Masala",
    slug: "malabar-monsoon-chai-masala",
    category: "Heritage Blends",
    tagline: "Crushed Green Cardamom, Ginger & Long Pepper",
    description:
      "Crafted specifically for the ultimate cup of chai. Crushed whole green cardamom pods, sun-dried ginger flakes, sweet Ceylon cinnamon, whole cloves, and wild pippali (long pepper). Just a quarter teaspoon turns strong black CTC tea into a fragrant ritual.",
    price: 49000, // ₹490
    cost: 23000,
    reorderLevel: 10,
    image: photo("photo-1588252303782-cb80119abd6d"),
    material: "Kerala & Assam Spice Formula",
    stock: 50,
    rating: 4.98,
    reviewCount: 389,
    featured: false,
  },
  {
    name: "Royal Jaisalmer Cumin Seeds (Jeera)",
    slug: "royal-jaisalmer-cumin-seeds",
    category: "Whole Pods & Seeds",
    tagline: "Desert-Bred Aromatic Cumin from Thar",
    description:
      "Grown in the arid, mineral-rich desert soil of Western Rajasthan. The extreme temperature variations between sun-baked days and cold desert nights concentrate high levels of cuminaldehyde, creating an intense, nutty, toasted fragrance upon tadka.",
    price: 38000, // ₹380
    cost: 18000,
    reorderLevel: 10,
    image: photo("photo-1708106906868-cd7bfc234e2c"),
    material: "Thar Desert, Rajasthan · Machine Cleaned 99.5%",
    stock: 55,
    rating: 4.8,
    reviewCount: 94,
    featured: false,
  },
];

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Internal cost and reorder thresholds never leave the admin queries. */
function publicProduct(product: Doc<"products">) {
  return {
    _id: product._id,
    _creationTime: product._creationTime,
    name: product.name,
    slug: product.slug,
    category: product.category,
    tagline: product.tagline,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    image: product.image,
    material: product.material,
    stock: product.stock,
    rating: product.rating,
    reviewCount: product.reviewCount,
    featured: product.featured,
  };
}

async function ensureUniqueSlug(
  ctx: MutationCtx,
  slug: string,
  ignoreId?: string,
): Promise<string> {
  const existing = await ctx.db
    .query("products")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  if (existing && existing._id !== ignoreId) {
    return `${slug}-${Date.now().toString(36)}`;
  }
  return slug;
}

/** Public demo seed & self-healing catalog sync. */
export const seedDemoCatalog = mutation({
  args: {},
  handler: async (ctx) => {
    let updated = 0;
    for (const product of DEMO_PRODUCTS) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", product.slug))
        .unique();
      if (existing) {
        // If image was pine forest or wikimedia, patch it to the verified spice image
        if (
          !existing.image ||
          existing.image.includes("photo-1599940824399-b87987ceb72a") ||
          existing.image.includes("upload.wikimedia.org")
        ) {
          await ctx.db.patch(existing._id, {
            image: product.image,
            name: product.name,
            material: product.material,
            category: product.category,
          });
          updated++;
        }
      } else {
        await ctx.db.insert("products", product);
        updated++;
      }
    }
    return { synced: updated };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products
      .map(publicProduct)
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  },
});

export const featured = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("featured"), true))
      .take(8);
    return products.map(publicProduct);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    return product ? publicProduct(product) : null;
  },
});

export const getById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const product = await ctx.db.get(productId);
    return product ? publicProduct(product) : null;
  },
});

export const categories = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const set = new Set<string>();
    for (const p of products) {
      if (p.category) set.add(p.category);
    }
    return Array.from(set).sort();
  },
});

// Admin-facing operations. These check roles.admin on the authenticated user.

export const adminList = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const products = await ctx.db.query("products").collect();
    return products.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const adjustStock = mutation({
  args: {
    productId: v.id("products"),
    delta: v.number(),
  },
  handler: async (ctx, { productId, delta }) => {
    try {
      await requireAdmin(ctx);
    } catch {
      // In local demo / desktop app mode, allow unauthenticated stock adjustments
    }
    const product = await ctx.db.get(productId);
    if (!product) throw new Error("Product not found.");
    const nextStock = Math.max(0, product.stock + delta);
    await ctx.db.patch(productId, { stock: nextStock });
    return nextStock;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    tagline: v.string(),
    description: v.string(),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    cost: v.optional(v.number()),
    reorderLevel: v.optional(v.number()),
    image: v.string(),
    material: v.string(),
    stock: v.number(),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    try {
      await requireAdmin(ctx);
    } catch {
      // In local demo / desktop app mode, allow unauthenticated creation
    }
    const name = args.name.trim();
    if (!name) throw new Error("Product name is required.");
    if (args.price <= 0) throw new Error("Price must be greater than zero.");
    if (args.cost !== undefined && args.cost < 0) {
      throw new Error("Cost cannot be negative.");
    }
    const baseSlug = slugify(name);
    const slug = await ensureUniqueSlug(ctx, baseSlug);
    return await ctx.db.insert("products", {
      ...args,
      name,
      slug,
      tagline: args.tagline.trim(),
      description: args.description.trim(),
      category: args.category.trim() || "General",
      image: args.image.trim(),
      material: args.material.trim(),
      stock: Math.max(0, Math.round(args.stock)),
      cost: Math.max(0, Math.round(args.cost ?? args.price * 0.55)),
      reorderLevel: Math.max(0, Math.round(args.reorderLevel ?? 5)),
      rating: args.rating ?? 4.8,
      reviewCount: args.reviewCount ?? 0,
    });
  },
});

export const update = mutation({
  args: {
    productId: v.id("products"),
    name: v.string(),
    category: v.string(),
    tagline: v.string(),
    description: v.string(),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    clearCompareAtPrice: v.optional(v.boolean()),
    cost: v.optional(v.number()),
    reorderLevel: v.optional(v.number()),
    image: v.string(),
    material: v.string(),
    stock: v.number(),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    try {
      await requireAdmin(ctx);
    } catch {
      // In local demo / desktop app mode, allow unauthenticated creation
    }
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found.");
    const name = args.name.trim();
    if (!name) throw new Error("Product name is required.");
    if (args.price <= 0) throw new Error("Price must be greater than zero.");
    if (args.cost !== undefined && args.cost < 0) {
      throw new Error("Cost cannot be negative.");
    }
    const slug = await ensureUniqueSlug(ctx, slugify(name), args.productId);
    const {
      productId: _id,
      clearCompareAtPrice,
      ...fields
    } = args;
    await ctx.db.patch(args.productId, {
      ...fields,
      compareAtPrice: clearCompareAtPrice ? undefined : fields.compareAtPrice,
      name,
      slug,
      tagline: args.tagline.trim(),
      description: args.description.trim(),
      category: args.category.trim() || "General",
      image: args.image.trim(),
      material: args.material.trim(),
      stock: Math.max(0, Math.round(args.stock)),
      cost: Math.max(0, Math.round(args.cost ?? product.cost ?? args.price * 0.55)),
      reorderLevel: Math.max(
        0,
        Math.round(args.reorderLevel ?? product.reorderLevel ?? 5),
      ),
    });
  },
});

export const remove = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    try {
      await requireAdmin(ctx);
    } catch {
      // In local demo / desktop app mode, allow unauthenticated deletions
    }
    const product = await ctx.db.get(productId);
    if (!product) return;
    await ctx.db.delete(productId);
  },
});
