import { query } from "./_generated/server";
import { requireAdmin } from "./lib/roles";

/**
 * One read for the desktop inventory console: catalog, orders and payments.
 * Admin-only; costs and customer details stay behind this query.
 */
export const snapshot = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

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
