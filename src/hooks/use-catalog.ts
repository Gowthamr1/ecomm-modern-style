import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef } from "react";

/**
 * The demo catalog is seeded on first load so a fresh deployment has products
 * to browse. Safe to call from more than one page — the mutation is a no-op
 * once products exist.
 */
export function useCatalog() {
  const products = useQuery(api.products.list);
  const seed = useMutation(api.products.seedDemoCatalog);
  const requested = useRef(false);

  useEffect(() => {
    if (products && products.length === 0 && !requested.current) {
      requested.current = true;
      void seed().catch((error: unknown) => {
        console.warn("[catalog] demo seed skipped:", error);
      });
    }
  }, [products, seed]);

  return products;
}
