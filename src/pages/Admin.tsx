import { SiteShell } from "@/components/site/SiteShell";
import { StatusBadge } from "@/components/site/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  CreditCard,
  Loader2,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Star,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ProductForm = {
  name: string;
  category: string;
  tagline: string;
  description: string;
  price: string;
  compareAtPrice: string;
  image: string;
  material: string;
  stock: string;
  featured: boolean;
};

const EMPTY_FORM: ProductForm = {
  name: "",
  category: "Home",
  tagline: "",
  description: "",
  price: "",
  compareAtPrice: "",
  image: "",
  material: "",
  stock: "10",
  featured: false,
};

const STATUS_OPTIONS = ["paid", "shipped", "delivered"] as const;

export default function Admin() {
  const { user } = useAuth();
  const products = useQuery(api.products.list);
  const orders = useQuery(api.orders.listAll);
  const payments = useQuery(api.payments.listAll);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);
  const updateStatus = useMutation(api.orders.updateStatus);
  const refundPayment = useMutation(api.payments.refund);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Id<"products"> | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const succeeded = (payments ?? []).filter(
    (payment) => payment.status === "succeeded",
  );
  const revenue = succeeded.reduce((sum, payment) => sum + payment.amount, 0);
  const refunded = (payments ?? [])
    .filter((payment) => payment.status === "refunded")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const liveOrders = (orders ?? []).filter(
    (order) => order.status !== "cancelled",
  );
  const customerCount = new Set(
    (orders ?? []).map((order) => order.userId),
  ).size;
  const lowStock = (products ?? []).filter((product) => product.stock <= 5);

  // Last 7 days of demo revenue for the overview bars.
  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const total = succeeded
      .filter(
        (payment) => new Date(payment.createdAt).toISOString().slice(0, 10) === key,
      )
      .reduce((sum, payment) => sum + payment.amount, 0);
    return {
      key,
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      total,
    };
  });
  const peak = Math.max(...days.map((day) => day.total), 1);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    });
    setDialogOpen(true);
  };

  const openEdit = (product: Doc<"products">) => {
    setEditing(product._id);
    setForm({
      name: product.name,
      category: product.category,
      tagline: product.tagline,
      description: product.description,
      price: (product.price / 100).toFixed(2),
      compareAtPrice:
        product.compareAtPrice !== undefined
          ? (product.compareAtPrice / 100).toFixed(2)
          : "",
      image: product.image,
      material: product.material,
      stock: String(product.stock),
      featured: product.featured,
    });
    setDialogOpen(true);
  };

  const saveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = Math.round(Number.parseFloat(form.price) * 100);
    const compareAt = form.compareAtPrice.trim()
      ? Math.round(Number.parseFloat(form.compareAtPrice) * 100)
      : undefined;
    const stock = Number.parseInt(form.stock, 10);

    if (!form.name.trim()) return toast.error("Give the product a name.");
    if (!Number.isFinite(price) || price <= 0) {
      return toast.error("Enter a price greater than zero.");
    }
    if (compareAt !== undefined && (!Number.isFinite(compareAt) || compareAt <= price)) {
      return toast.error("Compare-at price must be higher than the price.");
    }
    if (!Number.isFinite(stock) || stock < 0) {
      return toast.error("Stock must be zero or more.");
    }
    if (!form.image.trim()) return toast.error("Add an image URL.");

    const payload = {
      name: form.name,
      category: form.category,
      tagline: form.tagline,
      description: form.description || form.tagline,
      price,
      compareAtPrice: compareAt,
      image: form.image,
      material: form.material || "Studio materials",
      stock,
      featured: form.featured,
    };

    setIsSaving(true);
    try {
      if (editing) {
        await updateProduct({ productId: editing, ...payload });
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product added to the catalog");
      }
      setDialogOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the product",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (product: Doc<"products">) => {
    try {
      await removeProduct({ productId: product._id });
      toast.success(`${product.name} removed`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not remove the product",
      );
    }
  };

  const handleStatus = async (
    orderId: Id<"orders">,
    status: "paid" | "shipped" | "delivered" | "cancelled",
  ) => {
    try {
      await updateStatus({ orderId, status });
      toast.success(
        status === "cancelled"
          ? "Order cancelled, stock restored and payment refunded"
          : `Order marked ${status}`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update");
    }
  };

  const handleRefund = async (paymentId: Id<"payments">) => {
    try {
      await refundPayment({ paymentId });
      toast.success("Demo payment refunded and order cancelled");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not refund");
    }
  };

  const update = <K extends keyof ProductForm,>(
    key: K,
    value: ProductForm[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-6xl px-5 pt-12 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Back room · Admin only
            </p>
            <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-[2.75rem]">
              Admin dashboard
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
              Signed in as {user?.name ?? user?.email ?? "admin"}. Manage the
              catalog, fulfil orders and refund demo payments.
            </p>
          </div>
          <Button onClick={openCreate} className="rounded-full">
            <Plus className="mr-1.5 size-4" />
            New product
          </Button>
        </div>

        {!products || !orders || !payments ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-2xl border hairline bg-card"
              />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="overview" className="mt-9">
            <TabsList className="h-auto flex-wrap gap-1 rounded-full bg-muted p-1">
              {[
                ["overview", "Overview"],
                ["products", `Products · ${products.length}`],
                ["orders", `Orders · ${orders.length}`],
                ["payments", `Payments · ${payments.length}`],
              ].map(([value, label]) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="rounded-full px-3.5 py-1.5 text-[12px] data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "Demo revenue",
                    value: formatMoney(revenue),
                    icon: TrendingUp,
                    hint: `${succeeded.length} approved`,
                  },
                  {
                    label: "Live orders",
                    value: String(liveOrders.length),
                    icon: Package,
                    hint: `${orders.length} total`,
                  },
                  {
                    label: "Customers",
                    value: String(customerCount),
                    icon: Users,
                    hint: "unique purchasers",
                  },
                  {
                    label: "Refunded",
                    value: formatMoney(refunded),
                    icon: RotateCcw,
                    hint: "demo refunds",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border hairline bg-card p-5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {stat.label}
                      </p>
                      <stat.icon className="size-4 text-muted-foreground" />
                    </div>
                    <p className="mt-2 text-2xl font-medium tabular-nums">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {stat.hint}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-2xl border hairline bg-card p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium">Last 7 days</h2>
                    <p className="text-[11px] text-muted-foreground">
                      Demo payments, approved
                    </p>
                  </div>
                  <div className="mt-6 flex h-40 items-end gap-2.5">
                    {days.map((day) => (
                      <div
                        key={day.key}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                        title={`${day.label}: ${formatMoney(day.total)}`}
                      >
                        <div className="relative flex w-full flex-1 items-end">
                          <div
                            className={cn(
                              "w-full rounded-t-md transition-all",
                              day.total > 0 ? "bg-primary/80" : "bg-muted",
                            )}
                            style={{
                              height: `${Math.max(
                                day.total > 0 ? 8 : 3,
                                (day.total / peak) * 100,
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {day.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border hairline bg-card p-6">
                  <h2 className="text-sm font-medium">Low stock</h2>
                  {lowStock.length === 0 ? (
                    <p className="mt-4 text-[12px] text-muted-foreground">
                      Everything is comfortably stocked.
                    </p>
                  ) : (
                    <ul className="mt-3 divide-y hairline">
                      {lowStock.map((product) => (
                        <li
                          key={product._id}
                          className="flex items-center justify-between gap-3 py-2.5"
                        >
                          <span className="truncate text-[12px]">
                            {product.name}
                          </span>
                          <StatusBadge
                            status={product.stock === 0 ? "sold out" : "low stock"}
                          />
                        </li>
                      ))}
                    </ul>
                  )}

                  <h2 className="mt-6 text-sm font-medium">Recent orders</h2>
                  <ul className="mt-3 space-y-2">
                    {orders.slice(0, 3).map((order) => (
                      <li
                        key={order._id}
                        className="flex items-center justify-between gap-2 text-[11px]"
                      >
                        <span className="truncate font-mono text-foreground/70">
                          {order.number}
                        </span>
                        <span className="tabular-nums">
                          {formatMoney(order.total)}
                        </span>
                      </li>
                    ))}
                    {orders.length === 0 && (
                      <li className="text-[12px] text-muted-foreground">
                        No orders yet.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Products */}
            <TabsContent value="products" className="mt-6">
              <div className="overflow-hidden rounded-2xl border hairline bg-card">
                <div className="hidden grid-cols-[2.2fr_0.9fr_0.7fr_0.7fr_0.6fr] gap-4 border-b hairline bg-muted/40 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:grid">
                  <span>Product</span>
                  <span>Category</span>
                  <span>Price</span>
                  <span>Stock</span>
                  <span className="text-right">Actions</span>
                </div>
                <div className="divide-y hairline">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="grid gap-3 px-4 py-3.5 md:grid-cols-[2.2fr_0.9fr_0.7fr_0.7fr_0.6fr] md:items-center md:gap-4 md:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="size-11 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate text-[12px] font-medium">
                            {product.name}
                            {product.featured && (
                              <Star className="size-3 shrink-0 fill-sand-deep text-sand-deep" />
                            )}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {product.tagline}
                          </p>
                        </div>
                      </div>
                      <p className="text-[12px] text-muted-foreground">
                        {product.category}
                      </p>
                      <p className="text-[12px] font-medium tabular-nums">
                        {formatMoney(product.price)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] tabular-nums">
                          {product.stock}
                        </span>
                        <StatusBadge
                          status={
                            product.stock === 0
                              ? "sold out"
                              : product.stock <= 5
                                ? "low stock"
                                : "in stock"
                          }
                        />
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg"
                          onClick={() => openEdit(product)}
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
                              aria-label={`Delete ${product.name}`}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remove {product.name}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This deletes the product from the catalog. Past
                                orders keep their record of the item.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep it</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemove(product)}
                                className="bg-destructive text-white hover:bg-destructive/90"
                              >
                                Remove product
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Orders */}
            <TabsContent value="orders" className="mt-6">
              {orders.length === 0 ? (
                <div className="rounded-2xl border hairline bg-card px-6 py-16 text-center">
                  <p className="font-display text-2xl">No orders yet.</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Orders will appear here as soon as customers check out.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="rounded-2xl border hairline bg-card p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <p className="text-[12px] font-medium tabular-nums">
                              {order.number}
                            </p>
                            <StatusBadge status={order.status} />
                            <span className="text-[11px] text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1.5 text-[12px] text-muted-foreground">
                            {order.customer?.name ??
                              order.customer?.email ??
                              "Customer"}{" "}
                            · {order.items.length} line
                            {order.items.length === 1 ? "" : "s"} ·{" "}
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.region}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-base font-medium tabular-nums">
                            {formatMoney(order.total)}
                          </p>
                          {order.status !== "cancelled" && (
                            <Select
                              value={order.status}
                              onValueChange={(value) =>
                                handleStatus(
                                  order._id,
                                  value as "paid" | "shipped" | "delivered",
                                )
                              }
                            >
                              <SelectTrigger className="h-8 w-[120px] rounded-lg text-[11px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent align="end">
                                {STATUS_OPTIONS.map((status) => (
                                  <SelectItem
                                    key={status}
                                    value={status}
                                    disabled={order.status === "delivered"}
                                  >
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {order.status !== "cancelled" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
                                  aria-label="Cancel order"
                                >
                                  <X className="size-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Cancel {order.number}?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Stock will be returned and the demo payment
                                    refunded. This cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep order</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleStatus(order._id, "cancelled")
                                    }
                                    className="bg-destructive text-white hover:bg-destructive/90"
                                  >
                                    Cancel &amp; refund
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {order.items.map((item) => (
                          <span
                            key={item.productId}
                            className="inline-flex items-center gap-2 rounded-full bg-muted py-1 pl-1 pr-3 text-[11px]"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="size-6 rounded-full object-cover"
                            />
                            {item.name} ×{item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Payments */}
            <TabsContent value="payments" className="mt-6">
              <div className="overflow-hidden rounded-2xl border hairline bg-card">
                <div className="hidden grid-cols-[1.3fr_1.2fr_0.7fr_0.7fr_0.7fr] gap-4 border-b hairline bg-muted/40 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:grid">
                  <span>Reference</span>
                  <span>Customer</span>
                  <span>Method</span>
                  <span>Amount</span>
                  <span className="text-right">Status</span>
                </div>
                <div className="divide-y hairline">
                  {payments.length === 0 && (
                    <p className="px-5 py-12 text-center text-[12px] text-muted-foreground">
                      No demo payments yet.
                    </p>
                  )}
                  {payments.map((payment) => (
                    <div
                      key={payment._id}
                      className="grid gap-2 px-4 py-3.5 sm:grid-cols-[1.3fr_1.2fr_0.7fr_0.7fr_0.7fr] sm:items-center sm:gap-4 sm:px-5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-mono text-[11px]">
                          {payment.reference}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {payment.customer?.name ??
                          payment.customer?.email ??
                          "Customer"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {payment.brand} ··· {payment.last4}
                      </p>
                      <p className="text-[12px] font-medium tabular-nums">
                        {formatMoney(payment.amount)}
                      </p>
                      <div className="flex items-center justify-between gap-2 sm:justify-end">
                        {payment.status === "succeeded" ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 rounded-full border-foreground/15 px-3 text-[10px]"
                              >
                                <CreditCard className="mr-1 size-3" />
                                Refund
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Refund {formatMoney(payment.amount)}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  The demo payment is marked refunded and the
                                  linked order is cancelled with stock restored.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep payment</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRefund(payment._id)}
                                >
                                  Refund payment
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <StatusBadge status={payment.status} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Product editor */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-normal">
              {editing ? "Edit product" : "New product"}
            </DialogTitle>
            <DialogDescription>
              Changes go live immediately for every shopper.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={saveProduct} className="mt-2 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2 block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Name
                </span>
                <Input
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="Arc Wireless Headphones"
                  className="rounded-xl"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Category
                </span>
                <Input
                  value={form.category}
                  onChange={(event) => update("category", event.target.value)}
                  placeholder="Audio"
                  className="rounded-xl"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Material
                </span>
                <Input
                  value={form.material}
                  onChange={(event) => update("material", event.target.value)}
                  placeholder="Aluminium · foam"
                  className="rounded-xl"
                />
              </label>
              <label className="col-span-2 block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Tagline
                </span>
                <Input
                  value={form.tagline}
                  onChange={(event) => update("tagline", event.target.value)}
                  placeholder="Quiet, all day"
                  className="rounded-xl"
                />
              </label>
              <label className="col-span-2 block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Description
                </span>
                <Textarea
                  value={form.description}
                  onChange={(event) => update("description", event.target.value)}
                  placeholder="What makes this object worth living with?"
                  className="min-h-24 rounded-xl"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Price (USD)
                </span>
                <Input
                  value={form.price}
                  onChange={(event) => update("price", event.target.value)}
                  inputMode="decimal"
                  placeholder="189.00"
                  className="rounded-xl"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Compare at (optional)
                </span>
                <Input
                  value={form.compareAtPrice}
                  onChange={(event) =>
                    update("compareAtPrice", event.target.value)
                  }
                  inputMode="decimal"
                  placeholder="229.00"
                  className="rounded-xl"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Stock
                </span>
                <Input
                  value={form.stock}
                  onChange={(event) => update("stock", event.target.value)}
                  inputMode="numeric"
                  className="rounded-xl"
                  required
                />
              </label>
              <label className="flex items-end gap-2 pb-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => update("featured", event.target.checked)}
                  className="size-4 rounded border-input accent-primary"
                />
                <span className="text-[12px]">Feature on the landing page</span>
              </label>
              <label className="col-span-2 block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Image URL
                </span>
                <Input
                  value={form.image}
                  onChange={(event) => update("image", event.target.value)}
                  placeholder="https://…"
                  className="rounded-xl"
                  required
                />
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-full"
              >
                {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editing ? "Save changes" : "Add product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SiteShell>
  );
}
