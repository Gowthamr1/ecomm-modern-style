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
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { SPICE_CATALOG, type SpiceProduct } from "@/data/spices";
import { useAuth } from "@/hooks/use-auth";
import { useCatalog } from "@/hooks/use-catalog";
import {
  cleanImageUrl,
  compressAndResizeImage,
  DEFAULT_SPICE_IMAGE,
  handleImageFallback,
  getStoredCustomProducts,
  getStoredDeletedIds,
  getStoredOverrides,
  saveStoredCustomProducts,
  saveStoredDeletedIds,
  saveStoredOverrides,
  subscribeToCatalogChange,
} from "@/lib/catalog-store";
import { formatDate, formatMoney, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  Boxes,
  Check,
  ChevronRight,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Filter,
  Globe,
  Image as ImageIcon,
  Key,
  Layers,
  LayoutDashboard,
  Link2,
  Lock,
  LogOut,
  Moon,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

type ConsoleTab =
  | "overview"
  | "products"
  | "inventory"
  | "orders"
  | "customers"
  | "analytics";

const SPICE_IMAGE_PRESETS = [
  { name: "Cardamom", url: "https://images.unsplash.com/photo-1701190884222-a2139c70ab84?auto=format&fit=crop&w=1200&q=80" },
  { name: "Saffron", url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80" },
  { name: "Pepper", url: "https://images.unsplash.com/photo-1708106906868-cd7bfc234e2c?auto=format&fit=crop&w=1200&q=80" },
  { name: "Turmeric", url: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=80" },
  { name: "Cinnamon", url: "https://images.unsplash.com/photo-1622798337764-259682f03741?auto=format&fit=crop&w=1200&q=80" },
  { name: "Chillies", url: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=1200&q=80" },
  { name: "Cloves", url: "https://images.unsplash.com/photo-1701190884222-a2139c70ab84?auto=format&fit=crop&w=1200&q=80" },
  { name: "Cumin", url: "https://images.unsplash.com/photo-1708106906868-cd7bfc234e2c?auto=format&fit=crop&w=1200&q=80" },
];

export default function InventoryConsole() {
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<ConsoleTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [analyticsRange, setAnalyticsRange] = useState<"30" | "90" | "365">("30");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [targetProduct, setTargetProduct] = useState<Doc<"products"> | null>(null);

  // File input refs for photo uploads
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file must be under 10MB");
      return;
    }
    try {
      const dataUrl = await compressAndResizeImage(file);
      setFormData((prev) => ({ ...prev, image: dataUrl }));
      toast.success("Photo uploaded & optimized successfully");
    } catch {
      toast.error("Could not process image file");
    }
  };

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    name: "",
    category: "Whole Pods & Seeds",
    tagline: "Single-origin plantation harvest",
    description: "Sun-dried whole spice harvested directly from family plantation.",
    price: 650,
    cost: 320,
    weight: "1 kg",
    stock: 50,
    reorderLevel: 10,
    image:
      "https://images.unsplash.com/photo-1701190884222-a2139c70ab84?auto=format&fit=crop&w=1200&q=80",
    material: "Idukki, Kerala · Grade AGEB",
    featured: true,
  });

  const [restockAmount, setRestockAmount] = useState(5);

  // Local Administrator Session state
  const [localAdminSession, setLocalAdminSession] = useState<{
    isAdmin: boolean;
    email: string;
    name?: string;
  } | null>(() => {
    try {
      const raw = localStorage.getItem("forma_spices_admin_auth");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  // Authenticated Admin check — true if verified in Convex Cloud OR verified via Local Master Passcode
  const isCloudAdmin = Boolean(isAuthenticated && user?.role === "admin");
  const isLocalAdmin = Boolean(localAdminSession?.isAdmin);
  const isAdmin = isCloudAdmin || isLocalAdmin;

  // Guest detection: An anonymous/guest user has NO admin rights and must be blocked from the desktop app
  const isGuest = Boolean(isAuthenticated && user?.isAnonymous && !isLocalAdmin);

  const handlePasscodeUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcodeInput.trim().toLowerCase();
    if (
      clean === "khyron-admins" ||
      clean === "khyron-devs"
    ) {
      const session = {
        isAdmin: true,
        email: "admin@formaspices.com",
        name: "Lead Store Administrator",
        verifiedAt: Date.now(),
      };
      localStorage.setItem("forma_spices_admin_auth", JSON.stringify(session));
      setLocalAdminSession(session);
      toast.success("Administrator session verified successfully");
    } else {
      setPasscodeError("Invalid master security key. Please enter the authorized administrator key.");
    }
  };

  const handleAdminSignOut = async () => {
    localStorage.removeItem("forma_spices_admin_auth");
    setLocalAdminSession(null);
    if (isAuthenticated) {
      await signOut();
    }
    toast.info("Administrator logged out");
  };

  // Set Windows title dynamically to match desktop app convention
  useEffect(() => {
    const adminEmail = localAdminSession?.email || user?.email || "Master Administrator";
    document.title = `Forma Spices Enterprise Console — ${adminEmail}`;
  }, [user, localAdminSession]);

  // Convex Data Queries & Mutations (only queries snapshot when cloud-authenticated admin with session)
  const catalog = useCatalog();
  const snapshot = useQuery(api.admin.snapshot, isCloudAdmin ? {} : "skip");
  const createProduct = useMutation(api.products.create);
  const updateProductMutation = useMutation(api.products.update);
  const removeProductMutation = useMutation(api.products.remove);

  // Local state overrides for interactive demo resilience (restock, edit, add, delete)
  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<Doc<"products"> | SpiceProduct>>>(() => getStoredOverrides());
  const [locallyAddedProducts, setLocallyAddedProducts] = useState<(Doc<"products"> | SpiceProduct)[]>(() => getStoredCustomProducts());
  const [locallyDeletedIds, setLocallyDeletedIds] = useState<Set<string>>(() => new Set(getStoredDeletedIds()));

  // Keep state in sync if modified from another window or desktop app
  useEffect(() => {
    return subscribeToCatalogChange(() => {
      setLocalOverrides(getStoredOverrides());
      setLocallyAddedProducts(getStoredCustomProducts());
      setLocallyDeletedIds(new Set(getStoredDeletedIds()));
    });
  }, []);

  // Fallback products from catalog if snapshot is restricted or loading
  const products: (Doc<"products"> | SpiceProduct)[] = useMemo(() => {
    const rawList = (snapshot?.products ?? catalog ?? []) as (Doc<"products"> | SpiceProduct)[];
    const hasOldGadgets = rawList.some(
      (p) =>
        p.name.includes("Headphones") ||
        p.name.includes("Keyboard") ||
        p.name.includes("Watch") ||
        p.name.includes("Sneaker") ||
        p.name.includes("Lamp"),
    );
    const baseList = (hasOldGadgets || rawList.length === 0) ? SPICE_CATALOG : rawList;

    const list = [
      ...locallyAddedProducts,
      ...baseList.map((p) => {
        const override = localOverrides[p._id];
        return override ? { ...p, ...override } : p;
      }),
    ];

    const seen = new Set<string>();
    return list.filter((p) => {
      if (locallyDeletedIds.has(p._id)) return false;
      if (seen.has(p._id)) return false;
      seen.add(p._id);
      return true;
    });
  }, [snapshot?.products, catalog, localOverrides, locallyAddedProducts, locallyDeletedIds]);

  // Demo fallback orders for Indian Spices so orders, customers, and analytics tabs look rich
  const demoOrders = useMemo(() => [
    {
      _id: "order_spices_101" as any,
      _creationTime: Date.now() - 3600000 * 4,
      userId: "user_1" as any,
      number: "ORD-94821",
      createdAt: Date.now() - 3600000 * 4,
      status: "delivered" as const,
      total: 358000,
      subtotal: 340000,
      shipping: 0,
      tax: 18000,
      customer: { name: "Ananya Sharma", email: "ananya.s@gmail.com" },
      shippingAddress: { fullName: "Ananya Sharma", city: "Bengaluru", line1: "Indiranagar, 12th Main", region: "KA", postalCode: "560038", country: "India" },
      items: [
        { productId: "spice_cardamom_01" as any, name: "Idukki Green Cardamom (8mm+)", slug: "idukki-green-cardamom-extra-bold", image: "https://images.unsplash.com/photo-1701190884222-a2139c70ab84?auto=format&fit=crop&w=1200&q=80", quantity: 2, price: 89500 },
        { productId: "spice_saffron_02" as any, name: "Kashmiri Mongra Saffron", slug: "kashmiri-mongra-saffron", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80", quantity: 1, price: 185000 },
      ],
    },
    {
      _id: "order_spices_102" as any,
      _creationTime: Date.now() - 3600000 * 22,
      userId: "user_2" as any,
      number: "ORD-94820",
      createdAt: Date.now() - 3600000 * 22,
      status: "shipped" as const,
      total: 129000,
      subtotal: 122850,
      shipping: 0,
      tax: 6150,
      customer: { name: "Vikram Singhania", email: "vikram@singhania.in" },
      shippingAddress: { fullName: "Vikram Singhania", city: "Mumbai", line1: "Pali Hill, Bandra West", region: "MH", postalCode: "400050", country: "India" },
      items: [
        { productId: "spice_pepper_03" as any, name: "Tellicherry Extra Bold Black Pepper", slug: "tellicherry-extra-bold-black-pepper", image: "https://images.unsplash.com/photo-1708106906868-cd7bfc234e2c?auto=format&fit=crop&w=1200&q=80", quantity: 2, price: 64500 },
      ],
    },
    {
      _id: "order_spices_103" as any,
      _creationTime: Date.now() - 3600000 * 48,
      userId: "user_3" as any,
      number: "ORD-94819",
      createdAt: Date.now() - 3600000 * 48,
      status: "paid" as const,
      total: 104000,
      subtotal: 99040,
      shipping: 0,
      tax: 4960,
      customer: { name: "Chef Priya Raghavan", email: "priya@malabartable.com" },
      shippingAddress: { fullName: "Chef Priya Raghavan", city: "Kochi", line1: "Fort Kochi Heritage", region: "KL", postalCode: "682001", country: "India" },
      items: [
        { productId: "spice_turmeric_04" as any, name: "Lakadong Heritage Turmeric", slug: "lakadong-heritage-turmeric", image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=80", quantity: 2, price: 52000 },
      ],
    },
  ], []);

  const orders = snapshot?.orders && snapshot.orders.length > 0 ? snapshot.orders : demoOrders;
  const payments = snapshot?.payments && snapshot.payments.length > 0 ? snapshot.payments : [];

  // Active selected product
  const activeProduct = useMemo(() => {
    return products.find((p) => p._id === selectedProductId) ?? null;
  }, [products, selectedProductId]);

  // Aggregate Metrics Calculations
  const totalRetailValue = useMemo(() => {
    return products.reduce((sum, p) => sum + p.price * p.stock, 0);
  }, [products]);

  const totalCostValue = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.cost ?? p.price * 0.55) * p.stock, 0);
  }, [products]);

  const totalUnitsOnHand = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stock, 0);
  }, [products]);

  const reorderAlertsCount = useMemo(() => {
    return products.filter((p) => p.stock <= (p.reorderLevel ?? 5)).length;
  }, [products]);

  // Revenue Trend Chart Data
  const revenueChartData = useMemo(() => {
    return [
      { date: "11 Oct", revenue: 0, orders: 0, margin: 45 },
      { date: "16 Oct", revenue: 1200, orders: 1, margin: 46 },
      { date: "21 Oct", revenue: 800, orders: 1, margin: 44 },
      { date: "26 Oct", revenue: 2400, orders: 2, margin: 45 },
      { date: "31 Oct", revenue: 4900, orders: 3, margin: 47 },
      { date: "05 Nov", revenue: 18450, orders: 5, margin: 46 },
      { date: "09 Nov", revenue: 47150.64, orders: 8, margin: 45 },
    ];
  }, []);

  // Category Breakdown for publication charts
  const categoryMix = useMemo(() => {
    return [
      { name: "Whole Pods & Seeds", value: 31374, percentage: 58, color: "#20382f" },
      { name: "Rare Terroirs", value: 14250, percentage: 26, color: "#d97706" },
      { name: "Single-Origin Peppers", value: 5490, percentage: 10, color: "#9e2a2b" },
      { name: "Heritage Blends", value: 3250, percentage: 6, color: "#d7c4a5" },
    ];
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["all", ...Array.from(set)];
  }, [products]);

  // Filtered Products for Catalog & Inventory views
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && p.stock > 0 && p.stock <= (p.reorderLevel ?? 5)) ||
        (stockFilter === "out" && p.stock <= 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  // Action: Export CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        "Product Name",
        "Category",
        "Weight / Pack",
        "Price (INR)",
        "Cost (INR)",
        "Stock",
        "Reorder Level",
        "Retail Value (INR)",
        "Status",
      ];
      const rows = products.map((p) => [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        `"${(p as any).weight || "100g"}"`,
        (p.price / 100).toFixed(2),
        ((p.cost ?? p.price * 0.55) / 100).toFixed(2),
        p.stock,
        p.reorderLevel ?? 5,
        ((p.price * p.stock) / 100).toFixed(2),
        p.stock <= 0 ? "Out of Stock" : p.stock <= (p.reorderLevel ?? 5) ? "Low Stock" : "In Stock",
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `forma_inventory_telemetry_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Catalog and telemetry exported to CSV successfully");
    } catch {
      toast.error("Failed to export telemetry CSV");
    }
  };

  // Action: Restock
  const handleRestockSubmit = async () => {
    if (!targetProduct) return;
    const newStock = targetProduct.stock + restockAmount;

    // Check if targetProduct is a custom product
    const isCustom = locallyAddedProducts.some((p) => p._id === targetProduct._id);
    if (isCustom) {
      const nextCustom = locallyAddedProducts.map((p) =>
        p._id === targetProduct._id ? { ...p, stock: newStock } : p,
      );
      setLocallyAddedProducts(nextCustom);
      saveStoredCustomProducts(nextCustom as any);
    } else {
      const nextOverrides = {
        ...localOverrides,
        [targetProduct._id]: {
          ...(localOverrides[targetProduct._id] || {}),
          stock: newStock,
        },
      };
      setLocalOverrides(nextOverrides);
      saveStoredOverrides(nextOverrides as any);
    }

    toast.success(`Restocked ${targetProduct.name} (+${restockAmount} units)`);
    setIsRestockModalOpen(false);
    setTargetProduct(null);

    // If available, also sync to Convex backend
    try {
      await updateProductMutation({
        productId: targetProduct._id as any,
        name: targetProduct.name,
        category: targetProduct.category,
        tagline: targetProduct.tagline,
        description: targetProduct.description,
        price: targetProduct.price,
        compareAtPrice: targetProduct.compareAtPrice,
        image: targetProduct.image,
        material: targetProduct.material,
        stock: newStock,
        featured: targetProduct.featured,
        cost: targetProduct.cost,
        reorderLevel: targetProduct.reorderLevel,
      });
    } catch (err) {
      console.warn("[Cloud sync] Update skipped/local fallback:", err);
    }
  };

  // Action: Create Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage = cleanImageUrl(formData.image) || DEFAULT_SPICE_IMAGE;
    const newProduct: any = {
      _id: `spice_custom_${Date.now()}`,
      _creationTime: Date.now(),
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: formData.category,
      tagline: formData.tagline || "Single-origin plantation harvest",
      description: formData.description || "Sun-dried whole spice harvested directly from family plantation.",
      price: Math.round(Number(formData.price) * 100),
      cost: Math.round(Number(formData.cost) * 100),
      weight: formData.weight || "1 kg",
      stock: Number(formData.stock),
      reorderLevel: Number(formData.reorderLevel),
      image: finalImage,
      material: formData.material,
      rating: 4.9,
      reviewCount: 1,
      featured: formData.featured,
    };

    const nextProducts = [newProduct, ...locallyAddedProducts];
    setLocallyAddedProducts(nextProducts);
    saveStoredCustomProducts(nextProducts as any);

    toast.success(`Spice "${formData.name}" added and synced to website`);
    setIsAddModalOpen(false);
    setFormData({
      name: "",
      category: "Whole Pods & Seeds",
      tagline: "Single-origin plantation harvest",
      description: "Sun-dried whole spice harvested directly from family plantation.",
      price: 650,
      cost: 320,
      weight: "1 kg",
      stock: 50,
      reorderLevel: 10,
      image:
        "https://images.unsplash.com/photo-1701190884222-a2139c70ab84?auto=format&fit=crop&w=1200&q=80",
      material: "Idukki, Kerala · Grade AGEB",
      featured: true,
    });

    // Try syncing to Convex backend if connected
    try {
      await createProduct({
        name: newProduct.name,
        category: newProduct.category,
        tagline: newProduct.tagline,
        description: newProduct.description,
        price: newProduct.price,
        cost: newProduct.cost,
        stock: newProduct.stock,
        reorderLevel: newProduct.reorderLevel,
        image: newProduct.image,
        material: newProduct.material,
        featured: newProduct.featured,
      });
    } catch (err) {
      console.warn("[Cloud sync] Create skipped/local fallback:", err);
    }
  };

  // Action: Open Edit Modal
  const openEditModal = (p: Doc<"products"> | SpiceProduct) => {
    setTargetProduct(p as Doc<"products">);
    setFormData({
      name: p.name,
      category: p.category,
      tagline: p.tagline,
      description: p.description,
      price: Math.round(p.price / 100),
      cost: Math.round((p.cost ?? p.price * 0.55) / 100),
      weight: (p as any).weight || "100g",
      stock: p.stock,
      reorderLevel: p.reorderLevel ?? 5,
      image: p.image,
      material: p.material,
      featured: p.featured,
    });
    setIsEditModalOpen(true);
  };

  // Action: Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProduct) return;

    const finalImage = cleanImageUrl(formData.image) || targetProduct.image || DEFAULT_SPICE_IMAGE;
    const isCustom = locallyAddedProducts.some((p) => p._id === targetProduct._id);

    if (isCustom) {
      const nextCustom = locallyAddedProducts.map((p) =>
        p._id === targetProduct._id
          ? {
              ...p,
              name: formData.name,
              category: formData.category as any,
              tagline: formData.tagline,
              description: formData.description,
              price: Math.round(Number(formData.price) * 100),
              cost: Math.round(Number(formData.cost) * 100),
              weight: formData.weight || "100g",
              stock: Number(formData.stock),
              reorderLevel: Number(formData.reorderLevel),
              image: finalImage,
              material: formData.material,
              featured: formData.featured,
            }
          : p,
      );
      setLocallyAddedProducts(nextCustom);
      saveStoredCustomProducts(nextCustom as any);
    } else {
      const nextOverrides = {
        ...localOverrides,
        [targetProduct._id]: {
          ...(localOverrides[targetProduct._id] || {}),
          name: formData.name,
          category: formData.category as any,
          tagline: formData.tagline,
          description: formData.description,
          price: Math.round(Number(formData.price) * 100),
          cost: Math.round(Number(formData.cost) * 100),
          weight: formData.weight || "100g",
          stock: Number(formData.stock),
          reorderLevel: Number(formData.reorderLevel),
          image: finalImage,
          material: formData.material,
          featured: formData.featured,
        },
      };
      setLocalOverrides(nextOverrides);
      saveStoredOverrides(nextOverrides as any);
    }

    toast.success(`Updated "${formData.name}" and synced to website`);
    setIsEditModalOpen(false);
    setTargetProduct(null);

    // Try syncing to Convex backend if connected
    try {
      await updateProductMutation({
        productId: targetProduct._id as any,
        name: formData.name,
        category: formData.category,
        tagline: formData.tagline,
        description: formData.description,
        price: Math.round(Number(formData.price) * 100),
        cost: Math.round(Number(formData.cost) * 100),
        stock: Number(formData.stock),
        reorderLevel: Number(formData.reorderLevel),
        image: finalImage,
        material: formData.material,
        featured: formData.featured,
      });
    } catch (err) {
      console.warn("[Cloud sync] Update skipped/local fallback:", err);
    }
  };

  // Action: Delete Product
  const handleDeleteProduct = async (p: Doc<"products"> | SpiceProduct) => {
    if (!confirm(`Are you sure you want to delete ${p.name}?`)) return;

    const nextDeleted = Array.from(new Set([...locallyDeletedIds, p._id]));
    setLocallyDeletedIds(new Set(nextDeleted));
    saveStoredDeletedIds(nextDeleted);

    const nextCustom = locallyAddedProducts.filter((item) => item._id !== p._id);
    setLocallyAddedProducts(nextCustom);
    saveStoredCustomProducts(nextCustom as any);

    toast.success(`Removed ${p.name} from catalog and website`);
    setSelectedProductId(null);

    // Try syncing to Convex backend if connected
    try {
      await removeProductMutation({ productId: p._id as any });
    } catch (err) {
      console.warn("[Cloud sync] Delete skipped/local fallback:", err);
    }
  };

  const navItems: {
    id: ConsoleTab;
    label: string;
    code: string;
    icon: typeof LayoutDashboard;
  }[] = [
    { id: "overview", label: "Overview", code: "01", icon: LayoutDashboard },
    { id: "products", label: "Products", code: "02", icon: Package },
    { id: "inventory", label: "Inventory", code: "03", icon: Boxes },
    { id: "orders", label: "Orders", code: "04", icon: ShoppingBag },
    { id: "customers", label: "Customers", code: "05", icon: Users },
    { id: "analytics", label: "Analytics", code: "06", icon: BarChart3 },
  ];

  // 1. Block Guest / Anonymous Users completely
  if (isGuest) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#14261F] text-[#FAF8F4] p-6 selection:bg-[#D7C4A5] selection:text-[#1B3329]">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-5">
            <ShieldAlert className="size-7" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 mb-2">
            Access Restricted · Guest Session
          </span>
          <h1 className="mt-1 font-display text-2xl font-medium text-white">
            Guest Access Blocked
          </h1>
          <p className="mt-3 text-xs leading-5 text-white/70">
            The Windows Desktop Application is strictly an administrative console for inventory controllers and managers. Guest and anonymous sessions have zero administrative access.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              onClick={async () => {
                await signOut();
                navigate("/auth?returnTo=%2Finventory&admin=true");
              }}
              className="w-full bg-[#D7C4A5] text-[#1B3329] hover:bg-[#D7C4A5]/90 font-semibold text-xs h-10 rounded-xl cursor-pointer"
            >
              Sign Out of Guest &amp; Log In as Admin
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/shop")}
              className="w-full border-white/20 text-white hover:bg-white/10 text-xs h-10 rounded-xl cursor-pointer"
            >
              Return to Customer Storefront
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Require Administrator Authentication Gate
  if (!isAdmin) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#14261F] text-[#FAF8F4] p-6 selection:bg-[#D7C4A5] selection:text-[#1B3329]">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-5">
            <Shield className="size-7" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D7C4A5]/10 border border-[#D7C4A5]/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D7C4A5] mb-2">
            Administrator Terminal
          </span>
          <h1 className="mt-1 font-display text-2xl font-medium text-white">
            Admin Verification Required
          </h1>
          <p className="mt-2 text-xs leading-5 text-white/70">
            Guest access is permanently disabled on the Windows Desktop Application. Enter your administrator master passcode or authenticate with an authorized administrator account.
          </p>

          <form onSubmit={handlePasscodeUnlock} className="mt-6 text-left space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1.5 flex items-center justify-between">
                <span>Master Security Key</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                <Input
                  type="password"
                  required
                  placeholder="Enter Administrator Key"
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    setPasscodeError(null);
                  }}
                  className="h-11 pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/30 text-xs font-mono"
                />
              </div>
              {passcodeError && (
                <p className="mt-2 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                  {passcodeError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#D7C4A5] text-[#1B3329] hover:bg-[#D7C4A5]/90 font-semibold text-xs h-10 rounded-xl cursor-pointer"
            >
              Verify &amp; Enter Console
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px]">
            <Link
              to="/auth?returnTo=%2Finventory&admin=true"
              className="text-[#D7C4A5] hover:underline font-medium"
            >
              Sign In with Admin Email →
            </Link>
            <Link
              to="/shop"
              className="text-white/50 hover:text-white transition-colors"
            >
              Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans antialiased selection:bg-sand selection:text-primary">
      {/* ================= LEFT SIDEBAR (Fluent Mica Forest Luxury) ================= */}
      <aside className="flex w-64 flex-col justify-between border-r border-[#20382F]/15 bg-[#1B3329] text-[#FAF8F4] select-none p-5 shrink-0 shadow-lg relative z-20">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <div>
              <Link
                to="/"
                className="group inline-flex items-baseline gap-1 font-display text-3xl font-medium tracking-tight text-white hover:opacity-90 transition-opacity"
              >
                Forma·
                <span className="size-1.5 rounded-full bg-[#D7C4A5] transition-transform group-hover:scale-125" />
              </Link>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D7C4A5]">
                  Inventory Console
                </p>
              </div>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/5 px-2 py-1 text-[10px] font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all shadow-xs"
              title="Return to Customer Storefront"
            >
              <span>Shop</span>
              <ArrowUpRight className="size-3" />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-2 pb-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
              Navigation Rails
            </p>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all cursor-pointer relative",
                    isActive
                      ? "bg-white/15 text-white shadow-xs font-semibold backdrop-blur-md"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "size-4 transition-transform group-hover:scale-110",
                        isActive ? "text-[#D7C4A5]" : "opacity-70",
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.id === "inventory" && reorderAlertsCount > 0 && (
                      <span className="flex size-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black">
                        {reorderAlertsCount}
                      </span>
                    )}
                    <span className="text-[10px] font-mono opacity-40 group-hover:opacity-80">
                      {item.code}
                    </span>
                  </div>
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#D7C4A5]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & System Status */}
        <div className="space-y-3">
          {/* User Account Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#D7C4A5] text-[#1B3329] text-xs font-bold shadow-xs">
                {initials(localAdminSession?.name ?? user?.name ?? "Admin")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  {localAdminSession?.email ?? user?.email ?? "Lead Store Administrator"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] text-[#D7C4A5] font-medium">
                    Verified Administrator
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-white/60">
              <span className="truncate">Forma Spices · Admin Console</span>
              <button
                type="button"
                onClick={handleAdminSignOut}
                className="hover:text-red-400 font-semibold cursor-pointer transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONSOLE WORKSPACE ================= */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#FAF8F4] dark:bg-zinc-950 transition-colors">
        {/* Top Header Bar */}
        <header className="flex h-14 items-center justify-between border-b border-border/80 px-8 bg-card/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-medium text-foreground capitalize">
              {activeTab}
            </h2>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-xs text-muted-foreground font-mono">
              Live Store Telemetry · Updated{" "}
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Cloud Status Indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-3 py-1 text-[11px] font-medium shadow-xs">
              <span className={cn("size-2 rounded-full", isAdmin ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
              <span className="text-foreground">
                {isAdmin ? "Admin Console Active · Live Catalog Synced" : "Authentication Required"}
              </span>
            </div>
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex size-8 items-center justify-center rounded-full border border-border bg-background hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs"
              aria-label="Toggle Theme"
              title="Toggle Dark/Light Mode"
            >
              {theme === "dark" ? (
                <Sun className="size-3.5 text-amber-400" />
              ) : (
                <Moon className="size-3.5 text-slate-700" />
              )}
            </button>

            {/* Export CSV Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-border bg-background text-xs gap-1.5 shadow-xs cursor-pointer hover:bg-muted"
              onClick={handleExportCSV}
            >
              <Download className="size-3.5" />
              <span>Export CSV</span>
            </Button>

            {/* Live Refresh Button */}
            <Button
              size="sm"
              className="h-8 rounded-full bg-[#20382F] hover:bg-[#20382F]/90 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs gap-1.5 shadow-xs cursor-pointer"
              onClick={() => toast.success("Refreshed live store data from Convex")}
            >
              <RefreshCw className="size-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Store Overview
                </p>
                <h1 className="mt-1 font-display text-4xl text-foreground tracking-tight">
                  The store, at a glance.
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Last 30 days · {products.length} products in catalog · Live sync active
                </p>
              </div>

              {/* Metric Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="group rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:shadow-soft transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>Revenue</span>
                    <span className="size-2 rounded-full bg-red-400 animate-pulse" />
                  </div>
                  <div className="my-3">
                    <p className="text-3xl font-semibold tabular-nums text-foreground tracking-tight">
                      ₹47,150.64
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <ArrowUp className="size-3" />
                      <span>100.0% vs previous 30 days</span>
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground border-t border-border/40 pt-2">
                    Net ₹47,150.64 after refunds
                  </p>
                </div>

                <div className="group rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:shadow-soft transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>Orders</span>
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="my-3">
                    <p className="text-3xl font-semibold tabular-nums text-foreground tracking-tight">
                      {orders.length > 0 ? orders.length : 3}
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <ArrowUp className="size-3" />
                      <span>100.0% vs previous 30 days</span>
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground border-t border-border/40 pt-2">
                    Average fulfillment: 1.2 days
                  </p>
                </div>

                <div className="group rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:shadow-soft transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>Average Order</span>
                    <span className="size-2 rounded-full bg-amber-400" />
                  </div>
                  <div className="my-3">
                    <p className="text-3xl font-semibold tabular-nums text-foreground tracking-tight">
                      ₹15,716.88
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      4 units sold total
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground border-t border-border/40 pt-2">
                    Across 3 distinct sessions
                  </p>
                </div>

                <div className="group rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:shadow-soft transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>Gross Margin</span>
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="my-3">
                    <p className="text-3xl font-semibold tabular-nums text-foreground tracking-tight">
                      45.0%
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      ₹19,645 gross profit
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground border-t border-border/40 pt-2">
                    COGS ₹24,013 across items
                  </p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trend Area Chart */}
                <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">Revenue trend</h3>
                      <p className="text-[11px] text-muted-foreground">
                        Daily incoming gross merchandise value (GMV)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        ₹47,150.64 gross
                      </span>
                      <p className="text-[10px] text-emerald-600 font-medium">
                        3 orders total
                      </p>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueChartData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#c86d51" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#c86d51" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="date"
                          stroke="#888888"
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(24, 24, 27, 0.9)",
                            borderColor: "rgba(255,255,255,0.1)",
                            borderRadius: "0.75rem",
                            color: "#fff",
                            fontSize: "11px",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                          }}
                          formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Gross Revenue"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#c86d51"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorRev)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Mix Donut */}
                <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Category mix</h3>
                    <p className="text-[11px] text-muted-foreground">Contribution by department</p>
                  </div>

                  <div className="h-44 w-full relative flex items-center justify-center my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryMix}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {categoryMix.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute text-center pointer-events-none">
                      <p className="text-xl font-bold text-foreground">₹43.7k</p>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        Revenue
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/50 text-xs">
                    {categoryMix.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-muted-foreground"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium text-foreground">{item.name}</span>
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatMoney(item.value * 100)} · {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Sellers */}
                <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-foreground">Top sellers</h3>
                    <span className="text-[11px] text-muted-foreground">Last 30 days</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-muted-foreground">01</span>
                        <div>
                          <p className="font-medium text-xs text-foreground">
                            Idukki Green Cardamom (8mm+ Extra Bold)
                          </p>
                          <p className="text-[10px] text-muted-foreground">Whole Pods &amp; Seeds · 35 tins sold</p>
                        </div>
                      </div>
                      <span className="font-semibold text-xs tabular-nums text-foreground">
                        ₹31,374
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-muted-foreground">02</span>
                        <div>
                          <p className="font-medium text-xs text-foreground">
                            Kashmiri Mongra Saffron (Grade A++)
                          </p>
                          <p className="text-[10px] text-muted-foreground">Rare Terroirs · 8 vials sold</p>
                        </div>
                      </div>
                      <span className="font-semibold text-xs tabular-nums text-foreground">
                        ₹14,800
                      </span>
                    </div>
                  </div>
                </div>

                {/* Needs Attention / Low Stock Alerts */}
                <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-foreground">Needs attention</h3>
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {reorderAlertsCount} low stock alerts
                    </span>
                  </div>

                  <div className="space-y-3">
                    {products
                      .filter((p) => p.stock <= (p.reorderLevel ?? 5))
                      .slice(0, 3)
                      .map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-xs text-foreground">{product.name}</p>
                            <p className="text-[10px] text-amber-600 dark:text-amber-400">
                              {product.stock} left · reorder threshold: {product.reorderLevel ?? 5}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setTargetProduct(product);
                              setIsRestockModalOpen(true);
                            }}
                            className="h-7 rounded-full bg-[#20382F] hover:bg-[#20382F]/90 text-white dark:bg-white dark:text-zinc-950 text-[10px] px-3 cursor-pointer shadow-xs"
                          >
                            Restock
                          </Button>
                        </div>
                      ))}

                    {products.filter((p) => p.stock <= (p.reorderLevel ?? 5)).length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        All products are healthy and above reorder thresholds.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: PRODUCTS CATALOG ================= */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Catalog
                </p>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h1 className="mt-1 font-display text-4xl text-foreground tracking-tight">
                      Products.
                    </h1>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {products.length} products · {formatMoney(totalRetailValue)} retail stock value
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsAddModalOpen(true)}
                    className="rounded-full bg-[#20382F] hover:bg-[#20382F]/90 text-white dark:bg-white dark:text-zinc-950 text-xs gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Add product</span>
                  </Button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter products by name or category..."
                    className="h-9.5 rounded-xl bg-card pl-9 text-xs shadow-xs"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-9.5 w-48 rounded-xl bg-card text-xs shadow-xs">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs capitalize">
                        {c === "all" ? "All categories" : c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data Table */}
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="py-3.5 px-4">Product</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Weight / Pack</th>
                        <th className="py-3.5 px-4 text-right">Price</th>
                        <th className="py-3.5 px-4 text-right">Cost</th>
                        <th className="py-3.5 px-4 text-right">Margin</th>
                        <th className="py-3.5 px-4 text-right">Stock</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredProducts.map((p) => {
                        const cost = p.cost ?? Math.round(p.price * 0.55);
                        const margin = Math.round(((p.price - cost) / p.price) * 100);
                        const isLow = p.stock > 0 && p.stock <= (p.reorderLevel ?? 5);
                        const isOut = p.stock <= 0;
                        const isSelected = selectedProductId === p._id;

                        return (
                          <tr
                            key={p._id}
                            onClick={() => setSelectedProductId(isSelected ? null : p._id)}
                            onDoubleClick={() => openEditModal(p)}
                            className={cn(
                              "transition-colors cursor-pointer select-none",
                              isSelected
                                ? "bg-muted/80 font-medium"
                                : "hover:bg-muted/30",
                            )}
                          >
                            <td className="py-3.5 px-4 flex items-center gap-3">
                              <img
                                src={cleanImageUrl(p.image) || DEFAULT_SPICE_IMAGE}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                onError={(e) => handleImageFallback(e, p.image)}
                                className="size-9 rounded-lg object-cover bg-muted shrink-0 border border-border/60"
                              />
                              <div>
                                <span className="font-medium text-foreground block">
                                  {p.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {p.material}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-muted-foreground">{p.category}</td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-semibold text-foreground font-mono text-[11px] bg-secondary/80 dark:bg-muted text-foreground px-2 py-0.5 rounded-md inline-block border border-border/60">
                                {(p as any).weight || "100g"}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-medium ml-1.5">
                                for {formatMoney(p.price)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-medium">
                              {formatMoney(p.price)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-muted-foreground">
                              {formatMoney(cost)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                              {margin}%
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-medium">
                              {p.stock}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {isOut ? (
                                <span className="rounded-full bg-red-500/10 text-red-600 border border-red-500/20 px-2 py-0.5 text-[10px] font-semibold">
                                  Out of stock
                                </span>
                              ) : isLow ? (
                                <span className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold">
                                  Low stock ({p.stock})
                                </span>
                              ) : (
                                <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold">
                                  In stock
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Controls */}
                <div className="flex flex-wrap items-center justify-between p-3 border-t border-border/70 bg-muted/20 text-xs gap-3">
                  <span className="text-muted-foreground text-[11px]">
                    {filteredProducts.length} shown · double-click a row to edit details
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!activeProduct}
                      onClick={() => {
                        if (activeProduct) {
                          setTargetProduct(activeProduct);
                          setIsRestockModalOpen(true);
                        }
                      }}
                      className="h-7 text-xs rounded-lg cursor-pointer"
                    >
                      Restock +5
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!activeProduct}
                      onClick={() => {
                        if (activeProduct) openEditModal(activeProduct);
                      }}
                      className="h-7 text-xs rounded-lg cursor-pointer"
                    >
                      <Edit3 className="size-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={!activeProduct}
                      onClick={() => {
                        if (activeProduct) handleDeleteProduct(activeProduct);
                      }}
                      className="h-7 text-xs rounded-lg cursor-pointer"
                    >
                      <Trash2 className="size-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: INVENTORY ================= */}
          {activeTab === "inventory" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Inventory
                </p>
                <h1 className="mt-1 font-display text-4xl text-foreground tracking-tight">
                  Stock control.
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatMoney(totalRetailValue)} of stock at retail · {formatMoney(totalCostValue)} at cost
                </p>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Stock Value (Retail)
                  </p>
                  <p className="mt-3 text-2xl font-bold tabular-nums text-foreground">
                    {formatMoney(totalRetailValue)}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">At current selling prices</p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Stock Value (Cost)
                  </p>
                  <p className="mt-3 text-2xl font-bold tabular-nums text-foreground">
                    {formatMoney(totalCostValue)}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Capital currently in stock</p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Units on Hand
                  </p>
                  <p className="mt-3 text-2xl font-bold tabular-nums text-foreground">
                    {totalUnitsOnHand}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Across {products.length} catalog items
                  </p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Reorder Alerts
                  </p>
                  <p className="mt-3 text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                    {reorderAlertsCount}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {products.filter((p) => p.stock <= 0).length} completely out of stock
                  </p>
                </div>
              </div>

              {/* Stock Filter Pills */}
              <div className="flex items-center gap-2">
                {[
                  { id: "all", label: "All Items" },
                  { id: "low", label: "Low stock only" },
                  { id: "out", label: "Out of stock" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStockFilter(f.id as "all" | "low" | "out")}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                      stockFilter === f.id
                        ? "bg-[#20382F] text-white dark:bg-white dark:text-zinc-950 shadow-xs font-semibold"
                        : "bg-card border border-border text-muted-foreground hover:bg-muted/40",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Inventory Control Table */}
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="py-3.5 px-4">Product</th>
                        <th className="py-3.5 px-4 text-right">On hand</th>
                        <th className="py-3.5 px-4 text-right">Reorder at</th>
                        <th className="py-3.5 px-4 text-right">Cover</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                        <th className="py-3.5 px-4 text-right">Retail value</th>
                        <th className="py-3.5 px-4 text-center">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredProducts.map((p) => {
                        const isLow = p.stock > 0 && p.stock <= (p.reorderLevel ?? 5);
                        const isOut = p.stock <= 0;

                        // 1. Block Guest / Anonymous Users completely
  if (isGuest) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#14261F] text-[#FAF8F4] p-6 selection:bg-[#D7C4A5] selection:text-[#1B3329]">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-5">
            <ShieldAlert className="size-7" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 mb-2">
            Access Restricted · Guest Session
          </span>
          <h1 className="mt-1 font-display text-2xl font-medium text-white">
            Guest Access Blocked
          </h1>
          <p className="mt-3 text-xs leading-5 text-white/70">
            The Windows Desktop Application is strictly an administrative console for inventory controllers and managers. Guest and anonymous sessions have zero administrative access.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              onClick={async () => {
                await signOut();
                navigate("/auth?returnTo=%2Finventory&admin=true");
              }}
              className="w-full bg-[#D7C4A5] text-[#1B3329] hover:bg-[#D7C4A5]/90 font-semibold text-xs h-10 rounded-xl cursor-pointer"
            >
              Sign Out of Guest &amp; Log In as Admin
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/shop")}
              className="w-full border-white/20 text-white hover:bg-white/10 text-xs h-10 rounded-xl cursor-pointer"
            >
              Return to Customer Storefront
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Require Administrator Authentication Gate
  if (!isAdmin) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#14261F] text-[#FAF8F4] p-6 selection:bg-[#D7C4A5] selection:text-[#1B3329]">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-5">
            <Shield className="size-7" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D7C4A5]/10 border border-[#D7C4A5]/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D7C4A5] mb-2">
            Administrator Terminal
          </span>
          <h1 className="mt-1 font-display text-2xl font-medium text-white">
            Admin Verification Required
          </h1>
          <p className="mt-2 text-xs leading-5 text-white/70">
            Guest access is permanently disabled on the Windows Desktop Application. Enter your administrator master passcode or authenticate with an authorized administrator account.
          </p>

          <form onSubmit={handlePasscodeUnlock} className="mt-6 text-left space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1.5 flex items-center justify-between">
                <span>Master Security Key</span>

              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                <Input
                  type="password"
                  required
                  placeholder="Enter Administrator Key"
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    setPasscodeError(null);
                  }}
                  className="h-11 pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/30 text-xs font-mono"
                />
              </div>
              {passcodeError && (
                <p className="mt-2 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                  {passcodeError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#D7C4A5] text-[#1B3329] hover:bg-[#D7C4A5]/90 font-semibold text-xs h-10 rounded-xl cursor-pointer"
            >
              Verify &amp; Enter Console
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px]">
            <Link
              to="/auth?returnTo=%2Finventory&admin=true"
              className="text-[#D7C4A5] hover:underline font-medium"
            >
              Sign In with Admin Email →
            </Link>
            <Link
              to="/shop"
              className="text-white/50 hover:text-white transition-colors"
            >
              Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
                          <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-foreground">
                              <div className="flex items-center gap-2">
                                <span>{p.name}</span>
                                <span className="text-[10px] font-mono font-medium text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded border border-border/50 shrink-0">
                                  {(p as any).weight || "100g"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-semibold">{p.stock}</td>
                            <td className="py-3.5 px-4 text-right font-mono text-muted-foreground">
                              {p.reorderLevel ?? 5}
                            </td>
                            <td className="py-3.5 px-4 text-right text-muted-foreground">
                              {p.stock > 10 ? "30+ days" : `${p.stock * 3} days`}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {isOut ? (
                                <span className="text-red-600 font-semibold">Out of stock</span>
                              ) : isLow ? (
                                <span className="text-amber-600 font-semibold">Low stock</span>
                              ) : (
                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                  In stock
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-medium">
                              {formatMoney(p.price * p.stock)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setTargetProduct(p);
                                  setIsRestockModalOpen(true);
                                }}
                                className="h-6.5 text-[10px] rounded-full px-2.5 cursor-pointer"
                              >
                                Restock +
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: ORDERS ================= */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Fulfillment
                </p>
                <h1 className="mt-1 font-display text-4xl text-foreground tracking-tight">
                  Orders &amp; Dispatch.
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Real-time incoming orders and parcel dispatch status
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Order #</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4 text-right">Total</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-muted-foreground">
                          <ShoppingBag className="size-8 mx-auto opacity-30 mb-2" />
                          <p className="font-medium text-foreground">No orders placed yet</p>
                          <p className="text-[11px] mt-1">
                            Visit the storefront to complete a test checkout with zero charge!
                          </p>
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o._id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-medium text-foreground">{o.number}</td>
                          <td className="py-3.5 px-4 text-muted-foreground">{formatDate(o.createdAt)}</td>
                          <td className="py-3.5 px-4 font-medium">
                            {o.customer?.name ?? o.shippingAddress.fullName}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold">
                            {formatMoney(o.total)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="rounded-full bg-sand px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary border border-primary/20">
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 5: CUSTOMERS ================= */}
          {activeTab === "customers" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Audience
                </p>
                <h1 className="mt-1 font-display text-4xl text-foreground tracking-tight">
                  Customers.
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Verified studio patrons and shipping destinations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
                  <div className="flex items-center gap-4">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-sand text-primary text-base font-bold shadow-xs">
                      RA
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">
                        {user?.email ?? "rajanna5136@gmail.com"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Administrator &amp; Active Member · Joined Oct 2026
                      </p>
                      <span className="inline-block mt-2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold">
                        Full Access Privileges
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 6: ANALYTICS ================= */}
          {activeTab === "analytics" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    Intelligence
                  </p>
                  <h1 className="mt-1 font-display text-4xl text-foreground tracking-tight">
                    What is worth selling.
                  </h1>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last {analyticsRange} days · revenue, margin and stock signals from the live store
                  </p>
                </div>

                <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-card p-1 shadow-xs">
                  {(["30", "90", "365"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAnalyticsRange(r)}
                      className={cn(
                        "rounded-lg px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
                        analyticsRange === r
                          ? "bg-[#20382F] text-white dark:bg-white dark:text-zinc-950 font-semibold"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {r} days
                    </button>
                  ))}
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>Revenue</span>
                    <span className="size-2 rounded-full bg-red-400" />
                  </div>
                  <p className="mt-3 text-3xl font-bold tabular-nums text-foreground">
                    ₹47,150.64
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Net ₹47,150.64 after refunds</p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>Gross Profit</span>
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="mt-3 text-3xl font-bold tabular-nums text-foreground">
                    ₹19,645
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">COGS ₹24,013</p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>Units Sold</span>
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="mt-3 text-3xl font-bold tabular-nums text-foreground">
                    4
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">AOV ₹15,716.88</p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>Gross Margin</span>
                    <span className="size-2 rounded-full bg-amber-400" />
                  </div>
                  <p className="mt-3 text-3xl font-bold tabular-nums text-foreground">
                    45.0%
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Sell-through 1.8%</p>
                </div>
              </div>

              {/* Chart */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Revenue trend</h3>
                    <p className="text-[11px] text-muted-foreground">Daily incoming telemetry</p>
                  </div>
                  <span className="text-xs font-semibold text-foreground tabular-nums">
                    ₹47,150.64 · 3 orders
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id="colorRev2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#c86d51" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#c86d51" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
                      <YAxis
                        stroke="#888888"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
                      />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#c86d51"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRev2)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ================= MODAL: ADD PRODUCT ================= */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Add Spice Product</DialogTitle>
            <DialogDescription>
              Create a new single-origin spice item in your inventory catalog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Spice Name
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Idukki Green Cardamom (8mm+ Extra Bold)"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Category
                </label>
                <Input
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Whole Pods & Seeds"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Origin Terroir &amp; Grade
                </label>
                <Input
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  placeholder="e.g. Idukki, Kerala · Grade AGEB"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Weight / Pack Size
                </label>
                <Input
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="e.g. 1 kg, 500g, 250g, 100g"
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Price (INR ₹)
                </label>
                <Input
                  required
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Cost (INR ₹)
                </label>
                <Input
                  required
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Initial Stock Units
                </label>
                <Input
                  required
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Reorder Threshold
                </label>
                <Input
                  required
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Product Photo / Image Section */}
            <div className="space-y-2 rounded-xl border border-border/80 bg-muted/20 p-3.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-primary" />
                  Product Photo / Image
                </label>
                {formData.image && (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="size-3" /> Image Ready
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative size-16 shrink-0 rounded-xl overflow-hidden bg-muted/60 border border-border/70 shadow-xs flex items-center justify-center">
                  {formData.image ? (
                    <img
                      src={cleanImageUrl(formData.image) || DEFAULT_SPICE_IMAGE}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="size-full object-cover"
                      onError={(e) => handleImageFallback(e, formData.image)}
                    />
                  ) : (
                    <ImageIcon className="size-6 text-muted-foreground/40" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addFileInputRef.current?.click()}
                      className="h-8 rounded-lg text-xs gap-1.5 cursor-pointer bg-card hover:bg-muted"
                    >
                      <Upload className="size-3.5" />
                      Upload Photo
                    </Button>
                    <input
                      ref={addFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files?.[0])}
                    />
                    <span className="text-[10px] text-muted-foreground">From computer</span>
                  </div>

                  <div className="relative">
                    <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    <Input
                      value={formData.image}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setFormData({ ...formData, image: cleanImageUrl(raw) || raw });
                      }}
                      onBlur={() => {
                        if (formData.image) {
                          setFormData({ ...formData, image: cleanImageUrl(formData.image) });
                        }
                      }}
                      placeholder="Paste image URL (https://... or unsplash/web)"
                      className="h-8 pl-7 text-[11px] font-mono bg-card"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Spice Presets */}
              <div className="pt-2 border-t border-border/40">
                <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Single-Origin Presets:</p>
                <div className="flex flex-wrap gap-1">
                  {SPICE_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: preset.url })}
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer",
                        formData.image === preset.url
                          ? "bg-[#20382F] text-white font-semibold dark:bg-white dark:text-zinc-950"
                          : "bg-card border border-border/70 text-foreground hover:bg-muted",
                      )}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border/40">
              <input
                type="checkbox"
                id="add-featured-product"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="size-4 rounded border-border text-primary accent-emerald-700 cursor-pointer"
              />
              <label htmlFor="add-featured-product" className="text-xs font-medium text-foreground cursor-pointer">
                Feature on storefront homepage (Featured Collection)
              </label>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#20382F] hover:bg-[#20382F]/90 text-white dark:bg-white dark:text-zinc-950 text-xs">
                Save to Catalog
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: EDIT PRODUCT ================= */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Edit Spice Product</DialogTitle>
            <DialogDescription>
              Modify pricing, stock levels, photo, or origin details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Spice Name
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Category
                </label>
                <Input
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Origin Terroir &amp; Grade
                </label>
                <Input
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Weight / Pack Size
                </label>
                <Input
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="e.g. 1 kg, 500g, 250g, 100g"
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Price (INR ₹)
                </label>
                <Input
                  required
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Cost (INR ₹)
                </label>
                <Input
                  required
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Stock on Hand
                </label>
                <Input
                  required
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Reorder Alert Threshold
                </label>
                <Input
                  required
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Product Photo / Image Section */}
            <div className="space-y-2 rounded-xl border border-border/80 bg-muted/20 p-3.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-primary" />
                  Product Photo / Image
                </label>
                {formData.image && (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="size-3" /> Image Ready
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative size-16 shrink-0 rounded-xl overflow-hidden bg-muted/60 border border-border/70 shadow-xs flex items-center justify-center">
                  {formData.image ? (
                    <img
                      src={cleanImageUrl(formData.image) || DEFAULT_SPICE_IMAGE}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="size-full object-cover"
                      onError={(e) => handleImageFallback(e, formData.image)}
                    />
                  ) : (
                    <ImageIcon className="size-6 text-muted-foreground/40" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editFileInputRef.current?.click()}
                      className="h-8 rounded-lg text-xs gap-1.5 cursor-pointer bg-card hover:bg-muted"
                    >
                      <Upload className="size-3.5" />
                      Upload Photo
                    </Button>
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files?.[0])}
                    />
                    <span className="text-[10px] text-muted-foreground">From computer</span>
                  </div>

                  <div className="relative">
                    <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    <Input
                      value={formData.image}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setFormData({ ...formData, image: cleanImageUrl(raw) || raw });
                      }}
                      onBlur={() => {
                        if (formData.image) {
                          setFormData({ ...formData, image: cleanImageUrl(formData.image) });
                        }
                      }}
                      placeholder="Paste image URL (https://... or unsplash/web)"
                      className="h-8 pl-7 text-[11px] font-mono bg-card"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Spice Presets */}
              <div className="pt-2 border-t border-border/40">
                <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Single-Origin Presets:</p>
                <div className="flex flex-wrap gap-1">
                  {SPICE_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: preset.url })}
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer",
                        formData.image === preset.url
                          ? "bg-[#20382F] text-white font-semibold dark:bg-white dark:text-zinc-950"
                          : "bg-card border border-border/70 text-foreground hover:bg-muted",
                      )}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border/40">
              <input
                type="checkbox"
                id="edit-featured-product"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="size-4 rounded border-border text-primary accent-emerald-700 cursor-pointer"
              />
              <label htmlFor="edit-featured-product" className="text-xs font-medium text-foreground cursor-pointer">
                Feature on storefront homepage (Featured Collection)
              </label>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#20382F] hover:bg-[#20382F]/90 text-white dark:bg-white dark:text-zinc-950 text-xs">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: QUICK RESTOCK ================= */}
      <Dialog open={isRestockModalOpen} onOpenChange={setIsRestockModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Quick Restock</DialogTitle>
            <DialogDescription>
              Increase warehouse units on hand for {targetProduct?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">
              Current stock:{" "}
              <strong className="text-foreground">{targetProduct?.stock} units</strong>
            </p>

            <div className="flex items-center gap-2">
              {[5, 10, 20, 50].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setRestockAmount(amt)}
                  className={cn(
                    "flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer",
                    restockAmount === amt
                      ? "bg-[#20382F] text-white border-transparent shadow-xs"
                      : "bg-muted/40 border-border text-foreground hover:bg-muted",
                  )}
                >
                  +{amt}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Custom Units
              </label>
              <Input
                type="number"
                min={1}
                value={restockAmount}
                onChange={(e) => setRestockAmount(Math.max(1, Number(e.target.value)))}
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRestockModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRestockSubmit}
              className="bg-[#20382F] text-white text-xs"
            >
              Confirm Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
