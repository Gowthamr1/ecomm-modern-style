import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

export const orderStatusValidator = v.union(
  v.literal("paid"),
  v.literal("shipped"),
  v.literal("delivered"),
  v.literal("cancelled"),
);
export type OrderStatus = Infer<typeof orderStatusValidator>;

export const paymentStatusValidator = v.union(
  v.literal("succeeded"),
  v.literal("refunded"),
);

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    products: defineTable({
      name: v.string(),
      slug: v.string(),
      category: v.string(),
      tagline: v.string(),
      description: v.string(),
      /** price in cents */
      price: v.number(),
      compareAtPrice: v.optional(v.number()),
      image: v.string(),
      material: v.string(),
      stock: v.number(),
      rating: v.number(),
      reviewCount: v.number(),
      featured: v.boolean(),
    })
      .index("by_slug", ["slug"])
      .index("by_category", ["category"]),

    orders: defineTable({
      userId: v.id("users"),
      number: v.string(),
      status: orderStatusValidator,
      items: v.array(
        v.object({
          productId: v.id("products"),
          name: v.string(),
          slug: v.string(),
          image: v.string(),
          price: v.number(),
          quantity: v.number(),
        }),
      ),
      subtotal: v.number(),
      shipping: v.number(),
      tax: v.number(),
      total: v.number(),
      shippingAddress: v.object({
        fullName: v.string(),
        line1: v.string(),
        city: v.string(),
        region: v.string(),
        postalCode: v.string(),
        country: v.string(),
      }),
      paymentId: v.optional(v.id("payments")),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"])
      .index("by_number", ["number"]),

    payments: defineTable({
      userId: v.id("users"),
      orderId: v.optional(v.id("orders")),
      reference: v.string(),
      amount: v.number(),
      currency: v.string(),
      method: v.string(),
      brand: v.string(),
      last4: v.string(),
      status: paymentStatusValidator,
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_order", ["orderId"])
      .index("by_reference", ["reference"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
