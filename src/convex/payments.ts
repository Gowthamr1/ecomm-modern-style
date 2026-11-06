import { v } from "convex/values";
import { cancelAndRestock } from "./orders";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./lib/roles";

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const payments = await ctx.db.query("payments").order("desc").take(200);
    return await Promise.all(
      payments.map(async (payment) => {
        const customer = await ctx.db.get(payment.userId);
        return {
          ...payment,
          customer: customer
            ? { name: customer.name, email: customer.email }
            : null,
        };
      }),
    );
  },
});

export const refund = mutation({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, { paymentId }) => {
    await requireAdmin(ctx);
    const payment = await ctx.db.get(paymentId);
    if (!payment) throw new Error("Payment not found.");
    if (payment.status === "refunded") {
      throw new Error("This payment was already refunded.");
    }
    if (payment.orderId) {
      const order = await ctx.db.get(payment.orderId);
      if (order) {
        await cancelAndRestock(ctx, order);
        return;
      }
    }
    await ctx.db.patch(paymentId, { status: "refunded" });
  },
});
