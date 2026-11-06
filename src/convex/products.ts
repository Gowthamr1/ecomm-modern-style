import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { requireAdmin } from "./lib/roles";

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

/**
 * Demo catalog for version 1. Seeded once when the products table is empty so
 * the storefront has something to browse on a fresh deployment.
 */
const DEMO_PRODUCTS = [
  {
    name: "Arc Wireless Headphones",
    slug: "arc-wireless-headphones",
    category: "Audio",
    tagline: "Quiet, all day",
    description:
      "Over-ear headphones tuned for long listening sessions. Memory-foam cushions, a machined aluminium frame, and adaptive noise cancelling that reads the room around you.",
    price: 18900,
    compareAtPrice: 22900,
    image: photo("photo-1505740420928-5e560c06d30e"),
    material: "Aluminium · memory foam",
    stock: 24,
    rating: 4.8,
    reviewCount: 412,
    featured: true,
  },
  {
    name: "Meridian Field Watch",
    slug: "meridian-field-watch",
    category: "Wearables",
    tagline: "Time, uncomplicated",
    description:
      "A 38mm brushed-steel case with a sandblasted dial and a vegetable-tanned leather strap. Automatic movement, 72-hour reserve, and sapphire glass that shrugs off the day.",
    price: 24000,
    image: photo("photo-1523275335684-37898b6baf30"),
    material: "Steel · leather",
    stock: 12,
    rating: 4.9,
    reviewCount: 208,
    featured: true,
  },
  {
    name: "Fold Desk Lamp",
    slug: "fold-desk-lamp",
    category: "Home",
    tagline: "Light where you need it",
    description:
      "A compact task lamp with a folded steel arm and stepless dimming. Warm 2700K light that stays easy on the eyes through the last page of the night.",
    price: 12800,
    image: photo("photo-1507473885765-e6ed057f782c"),
    material: "Powder-coated steel",
    stock: 18,
    rating: 4.7,
    reviewCount: 96,
    featured: false,
  },
  {
    name: "Slate Everyday Sneaker",
    slug: "slate-everyday-sneaker",
    category: "Footwear",
    tagline: "The one pair you reach for",
    description:
      "A low-profile sneaker in full-grain leather with a cork-blend footbed. Broken-in from the first wear, resolable at the end of a long life.",
    price: 11000,
    image: photo("photo-1542291026-7eec264c27ff"),
    material: "Full-grain leather · cork",
    stock: 30,
    rating: 4.6,
    reviewCount: 337,
    featured: true,
  },
  {
    name: "Forma Carry Pack",
    slug: "forma-carry-pack",
    category: "Bags",
    tagline: "Everything, in its place",
    description:
      "A 22L daypack in waxed canvas with a padded 16-inch laptop sleeve and a magnetic quick-access lid. Structure without the bulk.",
    price: 14800,
    image: photo("photo-1553062407-98eeb64c6a62"),
    material: "Waxed canvas · brass",
    stock: 16,
    rating: 4.8,
    reviewCount: 154,
    featured: false,
  },
  {
    name: "Stoneware Pour-Over Set",
    slug: "stoneware-pour-over-set",
    category: "Home",
    tagline: "A slower morning",
    description:
      "Hand-thrown stoneware dripper and carafe finished in a matte oat glaze. Each piece varies slightly — as it should.",
    price: 6400,
    image: photo("photo-1514228742587-6b1558fcca3d"),
    material: "Stoneware",
    stock: 40,
    rating: 4.7,
    reviewCount: 88,
    featured: false,
  },
  {
    name: "Insight 35 Camera",
    slug: "insight-35-camera",
    category: "Technology",
    tagline: "Made for the ordinary",
    description:
      "A fixed 35mm lens and a quiet shutter, built into a magnesium body small enough to keep with you. Manual dials, honest colour, no menus to fight.",
    price: 42000,
    compareAtPrice: 48000,
    image: photo("photo-1516035069371-29a1b244cc32"),
    material: "Magnesium alloy",
    stock: 6,
    rating: 4.9,
    reviewCount: 71,
    featured: true,
  },
  {
    name: "Linen Lounge Chair",
    slug: "linen-lounge-chair",
    category: "Home",
    tagline: "A place to land",
    description:
      "Solid ash frame with an upholstered linen seat that softens with use. Low, wide, and built for the corner of the room that gets the afternoon light.",
    price: 56000,
    image: photo("photo-1567538096630-e0c55bd6374c"),
    material: "Ash · washed linen",
    stock: 3,
    rating: 4.8,
    reviewCount: 42,
    featured: false,
  },
  {
    name: "Compact Mechanical Keyboard",
    slug: "compact-mechanical-keyboard",
    category: "Technology",
    tagline: "Type, considered",
    description:
      "A 65% board with lubed tactile switches, an aluminium plate, and a gasket mount that keeps every keystroke low and even. Wired or wireless.",
    price: 13900,
    image: photo("photo-1587829741301-dc798b83add3"),
    material: "Aluminium · PBT",
    stock: 21,
    rating: 4.7,
    reviewCount: 263,
    featured: false,
  },
  {
    name: "Cedar Travel Bottle",
    slug: "cedar-travel-bottle",
    category: "Outdoors",
    tagline: "Cold for hours",
    description:
      "Double-walled stainless steel with a leak-proof cap and a powder-coated finish that holds up in a bag. 600ml, no plastic aftertaste.",
    price: 3800,
    image: photo("photo-1602143407151-7111542de6e8"),
    material: "Stainless steel",
    stock: 48,
    rating: 4.6,
    reviewCount: 189,
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

async function assertSlugAvailable(
  ctx: MutationCtx,
  slug: string,
  ignoreId?: string,
) {
  const existing = await ctx.db
    .query("products")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  if (existing && existing._id !== ignoreId) {
    throw new Error("A product with a similar name already exists.");
  }
}

/** Public demo seed. No-op once the catalog has products. */
export const seedDemoCatalog = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").take(1);
    if (existing.length > 0) return { seeded: 0 };
    for (const product of DEMO_PRODUCTS) {
      await ctx.db.insert("products", product);
    }
    return { seeded: DEMO_PRODUCTS.length };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products.sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  },
});

export const featured = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products.filter((product) => product.featured).slice(0, 4);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
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
    image: v.string(),
    material: v.string(),
    stock: v.number(),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Product name is required.");
    if (args.price < 0) throw new Error("Price must be positive.");
    const slug = slugify(name);
    await assertSlugAvailable(ctx, slug);
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
    image: v.string(),
    material: v.string(),
    stock: v.number(),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found.");
    const name = args.name.trim();
    if (!name) throw new Error("Product name is required.");
    const slug = slugify(name);
    await assertSlugAvailable(ctx, slug, args.productId);
    const { productId: _id, ...fields } = args;
    await ctx.db.patch(args.productId, {
      ...fields,
      name,
      slug,
      tagline: args.tagline.trim(),
      description: args.description.trim(),
      category: args.category.trim() || "General",
      image: args.image.trim(),
      material: args.material.trim(),
      stock: Math.max(0, Math.round(args.stock)),
    });
  },
});

export const remove = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    await requireAdmin(ctx);
    const product = await ctx.db.get(productId);
    if (!product) return;
    await ctx.db.delete(productId);
  },
});
