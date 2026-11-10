import type { Doc } from "@/convex/_generated/dataModel";
import { SPICE_CATALOG, type SpiceProduct } from "@/data/spices";

// Authentic, verified Indian spices flat-lay (curated whole spices, saffron, turmeric, peppercorns)
export const DEFAULT_SPICE_IMAGE =
  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80";

const KEY_CUSTOM_PRODUCTS = "forma_spices_custom_v2";
const KEY_OVERRIDES = "forma_spices_overrides_v2";
const KEY_DELETED = "forma_spices_deleted_v2";
const EVENT_NAME = "forma:catalog-sync";

/**
 * Cleans, sanitizes, and normalizes image URLs:
 * - Fixes protocol-relative or missing https://
 * - Decodes Google Images redirect links (imgurl=...)
 * - Converts Imgur page links into direct image URLs
 * - Heals obsolete/broken demo images
 * - Trims whitespace
 */
export function cleanImageUrl(input?: string | null): string {
  if (!input) return "";
  let url = input.trim();
  if (!url) return "";

  // Map known broken or Wikimedia URLs to authentic high-resolution Unsplash spice images
  if (url.includes("Elettaria_cardamomum") || url.includes("cardamom")) {
    return "https://images.unsplash.com/photo-1701190884222-a2139c70ab84?auto=format&fit=crop&w=1200&q=80";
  }
  if (url.includes("peppercorn") || url.includes("Four_colors_of_peppercorn")) {
    return "https://images.unsplash.com/photo-1708106906868-cd7bfc234e2c?auto=format&fit=crop&w=1200&q=80";
  }
  if (url.includes("Cinnamomum") || url.includes("cinnamon")) {
    return "https://images.unsplash.com/photo-1622798337764-259682f03741?auto=format&fit=crop&w=1200&q=80";
  }
  if (url.includes("Cloves") || url.includes("cloves")) {
    return "https://images.unsplash.com/photo-1701190884222-a2139c70ab84?auto=format&fit=crop&w=1200&q=80";
  }
  if (url.includes("Cumin") || url.includes("cumin")) {
    return "https://images.unsplash.com/photo-1708106906868-cd7bfc234e2c?auto=format&fit=crop&w=1200&q=80";
  }

  // Heal stale pine forest or obsolete broken Unsplash IDs from previous sessions
  if (
    url.includes("photo-1599940824399-b87987ceb72a") ||
    url.includes("photo-1596040033282-1402325324e9") ||
    url.includes("photo-1509358271058-acd22cc93898") ||
    url.includes("photo-1615485290382-441e4d049cb5") ||
    url.includes("upload.wikimedia.org")
  ) {
    return DEFAULT_SPICE_IMAGE;
  }

  // Protocol normalization
  if (url.startsWith("//")) {
    url = "https:" + url;
  } else if (
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("data:") &&
    !url.startsWith("blob:")
  ) {
    if (url.includes(".") && !url.startsWith("/")) {
      url = "https://" + url;
    }
  }

  // Google Images redirection URL extraction
  if (url.includes("google.") && url.includes("imgurl=")) {
    try {
      const parsed = new URL(url);
      const actual = parsed.searchParams.get("imgurl");
      if (actual) return decodeURIComponent(actual);
    } catch {}
  }

  // Imgur page URL to direct image URL:
  const imgurMatch = url.match(/imgur\.com\/([a-zA-Z0-9]{5,8})(?:\.[a-z]+)?$/);
  if (imgurMatch && imgurMatch[1] && !url.includes("i.imgur.com")) {
    return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
  }

  return url;
}

/**
 * Handles image loading failures gracefully:
 * 1. If direct loading failed (e.g. CORS, hotlink block by host website), tries loading through wsrv.nl proxy
 * 2. If proxy also fails or URL is completely dead, falls back to authentic Indian spices flat-lay
 */
export function handleImageFallback(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  originalUrl?: string | null,
): void {
  const target = e.currentTarget;
  if (target.src === DEFAULT_SPICE_IMAGE) return;

  const clean = cleanImageUrl(originalUrl) || target.src;

  // If already proxied, or dead Wikimedia / pine forest, fallback immediately to authentic spices flat-lay
  if (target.dataset.proxied || clean.includes("wsrv.nl") || clean.includes("wikimedia.org") || clean.includes("photo-1599940824399")) {
    target.src = DEFAULT_SPICE_IMAGE;
    return;
  }

  target.dataset.proxied = "true";
  target.src = `https://wsrv.nl/?url=${encodeURIComponent(clean)}&default=${encodeURIComponent(DEFAULT_SPICE_IMAGE)}`;
}

/**
 * Compresses and resizes an uploaded image via Canvas to keep base64 storage tiny (~40-80KB)
 * so it fits effortlessly in localStorage without hitting storage limits.
 */
export function compressAndResizeImage(
  file: File,
  maxDimension = 900,
  quality = 0.82,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Storage Accessors & Real-Time Local Server Synchronizer
let isSyncing = false;
let lastServerJson = "";
let broadcastChannel: BroadcastChannel | null = null;

try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    broadcastChannel = new BroadcastChannel("forma_spices_catalog_sync");
    broadcastChannel.onmessage = () => {
      notifyCatalogChange();
    };
  }
} catch {}

export async function syncToServer(data: {
  customProducts?: SpiceProduct[];
  overrides?: Record<string, Partial<SpiceProduct>>;
  deletedIds?: string[];
}): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    isSyncing = true;
    const body: Record<string, any> = {};
    if (data.customProducts !== undefined) {
      body.customProducts = data.customProducts;
    } else {
      body.customProducts = getStoredCustomProducts();
    }
    if (data.overrides !== undefined) {
      body.overrides = data.overrides;
    } else {
      body.overrides = getStoredOverrides();
    }
    if (data.deletedIds !== undefined) {
      body.deletedIds = data.deletedIds;
    } else {
      body.deletedIds = getStoredDeletedIds();
    }

    const res = await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const resp = await res.json();
      lastServerJson = JSON.stringify(resp.data || body);
    }
  } catch (err) {
    console.warn("[catalog-store] Sync to Vite dev server failed:", err);
  } finally {
    isSyncing = false;
  }
}

export async function fetchCatalogFromServer(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch("/api/catalog", { cache: "no-store" });
    if (!res.ok) return false;
    const jsonText = await res.text();
    if (jsonText === lastServerJson) return false;
    lastServerJson = jsonText;

    const data = JSON.parse(jsonText);
    let changed = false;

    const localCustom = getStoredCustomProducts();
    const localOverrides = getStoredOverrides();
    const localDeleted = getStoredDeletedIds();

    const serverCustom = Array.isArray(data.customProducts) ? data.customProducts : [];
    const serverOverrides = data.overrides && typeof data.overrides === "object" ? data.overrides : {};
    const serverDeleted = Array.isArray(data.deletedIds) ? data.deletedIds : [];

    // Merge custom products bidirectionally so neither client loses items
    const mergedMap = new Map<string, SpiceProduct>();
    for (const p of serverCustom) {
      if (p && p._id) mergedMap.set(p._id, p);
    }
    for (const p of localCustom) {
      if (p && p._id && !mergedMap.has(p._id)) {
        mergedMap.set(p._id, p);
      }
    }
    const finalCustom = Array.from(mergedMap.values());
    const finalOverrides = { ...localOverrides, ...serverOverrides };
    const finalDeleted = Array.from(new Set([...serverDeleted, ...localDeleted]));

    // If local had unsynced products not yet on server, push the merged set to server
    if (finalCustom.length > serverCustom.length) {
      void syncToServer({
        customProducts: finalCustom,
        overrides: finalOverrides,
        deletedIds: finalDeleted,
      });
    }

    const finalCustomJson = JSON.stringify(finalCustom);
    if (localStorage.getItem(KEY_CUSTOM_PRODUCTS) !== finalCustomJson) {
      localStorage.setItem(KEY_CUSTOM_PRODUCTS, finalCustomJson);
      changed = true;
    }

    const finalOverridesJson = JSON.stringify(finalOverrides);
    if (localStorage.getItem(KEY_OVERRIDES) !== finalOverridesJson) {
      localStorage.setItem(KEY_OVERRIDES, finalOverridesJson);
      changed = true;
    }

    const finalDeletedJson = JSON.stringify(finalDeleted);
    if (localStorage.getItem(KEY_DELETED) !== finalDeletedJson) {
      localStorage.setItem(KEY_DELETED, finalDeletedJson);
      changed = true;
    }

    if (changed) {
      notifyCatalogChange();
    }
    return changed;
  } catch {
    return false;
  }
}

// Background auto-sync initialization across browser instances and app windows
if (typeof window !== "undefined") {
  // 1. Initial immediate pull
  void fetchCatalogFromServer();

  // 2. Continuous 1.2s polling so changes in Windows App reflect in Chrome Website without refreshing
  setInterval(() => {
    if (!isSyncing) {
      void fetchCatalogFromServer();
    }
  }, 1200);

  // 3. Instant sync whenever user switches window / focuses tab
  window.addEventListener("focus", () => {
    void fetchCatalogFromServer();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void fetchCatalogFromServer();
    }
  });
}

// Storage Accessors
export function getStoredCustomProducts(): SpiceProduct[] {
  try {
    const raw = localStorage.getItem(KEY_CUSTOM_PRODUCTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredCustomProducts(products: SpiceProduct[]): void {
  try {
    localStorage.setItem(KEY_CUSTOM_PRODUCTS, JSON.stringify(products));
    notifyCatalogChange();
    void syncToServer({ customProducts: products });
  } catch (err) {
    console.warn("[catalog-store] Failed to save custom products:", err);
  }
}

export function getStoredOverrides(): Record<string, Partial<SpiceProduct>> {
  try {
    const raw = localStorage.getItem(KEY_OVERRIDES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredOverrides(overrides: Record<string, Partial<SpiceProduct>>): void {
  try {
    localStorage.setItem(KEY_OVERRIDES, JSON.stringify(overrides));
    notifyCatalogChange();
    void syncToServer({ overrides });
  } catch (err) {
    console.warn("[catalog-store] Failed to save product overrides:", err);
  }
}

export function getStoredDeletedIds(): string[] {
  try {
    const raw = localStorage.getItem(KEY_DELETED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredDeletedIds(ids: string[]): void {
  try {
    localStorage.setItem(KEY_DELETED, JSON.stringify(ids));
    notifyCatalogChange();
    void syncToServer({ deletedIds: ids });
  } catch (err) {
    console.warn("[catalog-store] Failed to save deleted IDs:", err);
  }
}

export function notifyCatalogChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
    try {
      broadcastChannel?.postMessage("sync");
    } catch {}
  }
}

export function subscribeToCatalogChange(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleCustom = () => callback();
  const handleStorage = (e: StorageEvent) => {
    if (
      e.key === KEY_CUSTOM_PRODUCTS ||
      e.key === KEY_OVERRIDES ||
      e.key === KEY_DELETED
    ) {
      callback();
    }
  };

  window.addEventListener(EVENT_NAME, handleCustom);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustom);
    window.removeEventListener("storage", handleStorage);
  };
}

/**
 * Combines base products (SPICE_CATALOG or remote) with locally added custom spices,
 * applies edits/overrides, heals stale forest images, and excludes deleted items.
 */
export function buildMergedCatalog(
  rawRemoteProducts?: (Doc<"products"> | SpiceProduct)[] | null,
): (Doc<"products"> | SpiceProduct)[] {
  const customList = getStoredCustomProducts();
  const overrides = getStoredOverrides();
  const deletedSet = new Set(getStoredDeletedIds());

  const hasOldGadgets = (rawRemoteProducts ?? []).some(
    (p) =>
      p.name.includes("Headphones") ||
      p.name.includes("Keyboard") ||
      p.name.includes("Watch") ||
      p.name.includes("Sneaker") ||
      p.name.includes("Lamp"),
  );

  const baseList: (Doc<"products"> | SpiceProduct)[] =
    hasOldGadgets || !rawRemoteProducts || rawRemoteProducts.length === 0
      ? SPICE_CATALOG
      : rawRemoteProducts.map((p) => {
          const catalogItem = SPICE_CATALOG.find(
            (c) => c.slug === p.slug || c.name.toLowerCase() === p.name.toLowerCase(),
          );
          if (catalogItem) {
            return {
              ...catalogItem,
              ...p,
              image:
                !p.image ||
                p.image.includes("photo-1599940824399-b87987ceb72a") ||
                p.image.includes("photo-1596040033282-1402325324e9") ||
                p.image.includes("photo-1509358271058-acd22cc93898") ||
                p.image.includes("photo-1615485290382-441e4d049cb5") ||
                p.image.includes("upload.wikimedia.org")
                  ? catalogItem.image
                  : cleanImageUrl(p.image),
              weight: (p as any).weight || catalogItem.weight || "100g",
            };
          }
          return {
            ...p,
            image: cleanImageUrl(p.image) || DEFAULT_SPICE_IMAGE,
            weight: (p as any).weight || "100g",
          };
        });

  // Combine custom products first (newest on top), followed by base catalog
  const combined = [...customList, ...baseList];

  // De-duplicate by _id and slug
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const result: (Doc<"products"> | SpiceProduct)[] = [];

  for (const item of combined) {
    if (deletedSet.has(item._id)) continue;
    if (seenIds.has(item._id)) continue;
    if (item.slug && seenSlugs.has(item.slug)) continue;
    seenIds.add(item._id);
    if (item.slug) seenSlugs.add(item.slug);

    const override = overrides[item._id];
    let merged = override ? { ...item, ...override } : item;

    // Sanitize any stale pine forest images
    if (
      !merged.image ||
      merged.image.includes("photo-1599940824399-b87987ceb72a") ||
      merged.image.includes("photo-1596040033282-1402325324e9") ||
      merged.image.includes("photo-1509358271058-acd22cc93898") ||
      merged.image.includes("photo-1615485290382-441e4d049cb5") ||
      merged.image.includes("upload.wikimedia.org")
    ) {
      const matched = SPICE_CATALOG.find((s) => s.slug === merged.slug || s.name === merged.name);
      merged = { ...merged, image: matched ? matched.image : DEFAULT_SPICE_IMAGE };
    }

    if (!(merged as any).weight) {
      const matched = SPICE_CATALOG.find((s) => s.slug === merged.slug || s.name === merged.name);
      merged = { ...merged, weight: matched?.weight || "100g" } as any;
    }

    result.push(merged);
  }

  return result;
}
