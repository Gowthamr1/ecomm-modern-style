import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { buildMergedCatalog, fetchCatalogFromServer, subscribeToCatalogChange } from "@/lib/catalog-store";
import type { SpiceProduct } from "@/data/spices";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useRef, useState } from "react";

export function useCatalog(): (Doc<"products"> | SpiceProduct)[] {
  const remoteProducts = useQuery(api.products.list);
  const seed = useMutation(api.products.seedDemoCatalog);
  const requested = useRef(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    // 1. Immediate pull from disk /api/catalog so custom products from Windows App show up
    void fetchCatalogFromServer().then((changed) => {
      if (changed) setRevision((r) => r + 1);
    });

    // 2. Subscribe to cross-tab and cross-window storage updates
    const unsubscribe = subscribeToCatalogChange(() => {
      setRevision((r) => r + 1);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!requested.current && remoteProducts !== undefined) {
      const hasStaleImages = remoteProducts.some(
        (p) =>
          !p.image ||
          p.image.includes("photo-1599940824399-b87987ceb72a") ||
          p.image.includes("upload.wikimedia.org"),
      );
      if (remoteProducts.length === 0 || hasStaleImages) {
        requested.current = true;
        void seed().catch((error: unknown) => {
          console.warn("[catalog] demo sync skipped:", error);
        });
      }
    }
  }, [remoteProducts, seed]);

  return useMemo(() => {
    return buildMergedCatalog(remoteProducts);
  }, [remoteProducts, revision]);
}
