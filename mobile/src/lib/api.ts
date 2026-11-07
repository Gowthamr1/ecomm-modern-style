import { anyApi } from "convex/server";
import type { FunctionReference } from "convex/server";

/**
 * Mobile-only view of the shared Convex API. The deployment and function
 * signatures are shared with the web store, but keeping the contract explicit
 * avoids pulling server-only modules into the React Native typecheck/bundle.
 */

export type User = {
  _id: string;
  _creationTime: number;
  name?: string;
  email?: string;
  image?: string;
  isAnonymous?: boolean;
  role?: "admin" | "user" | "member";
};

export type Product = {
  _id: string;
  _creationTime: number;
  name: string;
  slug: string;
  category: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  material: string;
  stock: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
};

export type OrderStatus = "paid" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
};

export type ShippingAddress = {
  fullName: string;
  line1: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

export type Payment = {
  _id: string;
  _creationTime: number;
  userId: string;
  orderId?: string;
  reference: string;
  amount: number;
  currency: string;
  method: string;
  brand: string;
  last4: string;
  status: "succeeded" | "refunded";
  createdAt: number;
};

export type Order = {
  _id: string;
  _creationTime: number;
  userId: string;
  number: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentId?: string;
  createdAt: number;
};

export type OrderWithPayment = Order & { payment: Payment | null };

export type Customer = { name?: string; email?: string } | null;

export type AdminOrder = OrderWithPayment & { customer: Customer };

export type AdminPayment = Payment & { customer: Customer };

export type ProductUpdateArgs = {
  productId: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  material: string;
  stock: number;
  featured: boolean;
};

export type CheckoutArgs = {
  items: { productId: string; quantity: number }[];
  cardName: string;
  brand: string;
  last4: string;
  address: ShippingAddress;
};

type Query<Args extends Record<string, unknown>, Result> = FunctionReference<
  "query",
  "public",
  Args,
  Result
>;

type Mutation<Args extends Record<string, unknown>, Result> = FunctionReference<
  "mutation",
  "public",
  Args,
  Result
>;

type MobileApi = {
  users: {
    currentUser: Query<Record<string, never>, User | null>;
  };
  profile: {
    adminExists: Query<Record<string, never>, boolean>;
    claimAdmin: Mutation<Record<string, never>, { role: "admin" }>;
    updateProfile: Mutation<{ name: string }, null>;
  };
  products: {
    list: Query<Record<string, never>, Product[]>;
    seedDemoCatalog: Mutation<Record<string, never>, { seeded: number }>;
    update: Mutation<ProductUpdateArgs, null>;
  };
  orders: {
    listMine: Query<Record<string, never>, OrderWithPayment[]>;
    listAll: Query<Record<string, never>, AdminOrder[]>;
    checkout: Mutation<CheckoutArgs, { orderId: string; number: string; total: number }>;
    updateStatus: Mutation<
      { orderId: string; status: OrderStatus },
      null
    >;
  };
  payments: {
    listMine: Query<Record<string, never>, Payment[]>;
    listAll: Query<Record<string, never>, AdminPayment[]>;
    refund: Mutation<{ paymentId: string }, null>;
  };
};

export const api = anyApi as unknown as MobileApi;
