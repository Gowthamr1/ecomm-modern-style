import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./lib/roles";

/** Cancels an order, returns its items to stock, and refunds the demo payment. */
export async function cancelAndRestock(
  ctx: MutationCtx,
  order: Doc<"orders">,
): Promise<void> {
  if (order.status === "cancelled") return;
  for (const item of order.items) {
    const product = await ctx.db.get(item.productId);
    if (product) {
      await ctx.db.patch(product._id, { stock: product.stock + item.quantity });
    }
  }
  if (order.paymentId) {
    const payment = await ctx.db.get(order.paymentId);
    if (payment && payment.status !== "refunded") {
      await ctx.db.patch(payment._id, { status: "refunded" });
    }
  }
  await ctx.db.patch(order._id, { status: "cancelled" });
}

export function orderNumber(): string {
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  const salt = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `FRM-${stamp}${salt}`;
}

export function paymentReference(): string {
  return `pay_demo_${Math.random().toString(36).slice(2, 12)}`;
}

export const checkout = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      }),
    ),
    cardName: v.string(),
    brand: v.string(),
    last4: v.string(),
    address: v.object({
      fullName: v.string(),
      line1: v.string(),
      city: v.string(),
      region: v.string(),
      postalCode: v.string(),
      country: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (args.items.length === 0) throw new Error("Your bag is empty.");
    if (args.items.length > 20) throw new Error("Too many items in one order.");

    const address = {
      fullName: args.address.fullName.trim(),
      line1: args.address.line1.trim(),
      city: args.address.city.trim(),
      region: args.address.region.trim(),
      postalCode: args.address.postalCode.trim(),
      country: args.address.country.trim() || "United States",
    };
    if (!address.fullName || !address.line1 || !address.city || !address.postalCode) {
      throw new Error("Please complete the shipping address.");
    }
    if (!/^\d{4}$/.test(args.last4)) {
      throw new Error("Use a demo card ending in 4 digits.");
    }
    if (!args.cardName.trim()) {
      throw new Error("Add the name on the card.");
    }

    const seen = new Set<Id<"products">>();
    const items: Doc<"orders">["items"] = [];
    let subtotal = 0;

    for (const line of args.items) {
      if (seen.has(line.productId)) {
        throw new Error("The same product appears twice in your bag.");
      }
      seen.add(line.productId);
      const quantity = Math.floor(line.quantity);
      if (quantity < 1 || quantity > 10) {
        throw new Error("Quantities must be between 1 and 10.");
      }
      const product = await ctx.db.get(line.productId);
      if (!product) throw new Error("An item in your bag is no longer available.");
      if (product.stock < quantity) {
        throw new Error(`Only ${product.stock} of ${product.name} left in stock.`);
      }
      subtotal += product.price * quantity;
      items.push({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: product.price,
        quantity,
      });
    }

    const shipping = subtotal >= 7500 ? 0 : 900;
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + shipping + tax;
    const createdAt = Date.now();

    const paymentId = await ctx.db.insert("payments", {
      userId: user._id,
      reference: paymentReference(),
      amount: total,
      currency: "usd",
      method: "Demo card",
      brand: args.brand.trim() || "Visa",
      last4: args.last4,
      status: "succeeded",
      createdAt,
    });

    const number = orderNumber();
    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      number,
      status: "paid",
      items,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress: address,
      paymentId,
      createdAt,
    });

    await ctx.db.patch(paymentId, { orderId });

    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(product._id, {
          stock: Math.max(0, product.stock - item.quantity),
        });
      }
    }

    return { orderId, number, total };
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
    return await Promise.all(
      orders.map(async (order) => ({
        ...order,
        payment: order.paymentId ? await ctx.db.get(order.paymentId) : null,
      })),
    );
  },
});

export const get = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const user = await requireUser(ctx);
    const order = await ctx.db.get(orderId);
    if (!order) return null;
    if (order.userId !== user._id && user.role !== "admin") {
      throw new Error("You do not have access to this order.");
    }
    return {
      ...order,
      payment: order.paymentId ? await ctx.db.get(order.paymentId) : null,
    };
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const orders = await ctx.db.query("orders").order("desc").take(200);
    return await Promise.all(
      orders.map(async (order) => {
        const customer = await ctx.db.get(order.userId);
        return {
          ...order,
          payment: order.paymentId ? await ctx.db.get(order.paymentId) : null,
          customer: customer
            ? { name: customer.name, email: customer.email }
            : null,
        };
      }),
    );
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, { orderId, status }) => {
    await requireAdmin(ctx);
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found.");
    if (order.status === "cancelled" && status !== "cancelled") {
      throw new Error("Cancelled orders cannot be reopened.");
    }
    if (status === "cancelled") {
      await cancelAndRestock(ctx, order);
      return;
    }
    await ctx.db.patch(orderId, { status });
  },
});
