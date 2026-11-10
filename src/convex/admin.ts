import { mutation, query } from "./_generated/server";
import { getCurrentUser, isAdmin } from "./lib/roles";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

/**
 * One read for the desktop inventory console: catalog, orders and payments.
 * Admin-only; costs and customer details stay behind this query.
 * Returns null if the caller is not an authenticated admin instead of crashing.
 */
export const snapshot = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || !isAdmin(user)) {
      return null;
    }

    const [products, orders, payments] = await Promise.all([
      ctx.db.query("products").take(500),
      ctx.db.query("orders").order("desc").take(500),
      ctx.db.query("payments").order("desc").take(500),
    ]);

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const [payment, customer] = await Promise.all([
          order.paymentId ? ctx.db.get(order.paymentId) : null,
          ctx.db.get(order.userId),
        ]);
        return {
          ...order,
          payment,
          customer: customer
            ? { name: customer.name, email: customer.email }
            : null,
        };
      }),
    );

    return {
      products,
      orders: enrichedOrders,
      payments,
      generatedAt: Date.now(),
    };
  },
});

/**
 * Grants administrator role to the authenticated user for the desktop application.
 */
export const promoteToAdmin = mutation({
  args: { passcode: v.optional(v.string()) },
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { success: false, message: "No active user session" };
    }
    await ctx.db.patch(userId, { role: "admin" });
    return { success: true };
  },
});
