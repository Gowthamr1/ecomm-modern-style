import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "./api";

export function useCatalog() {
  const products = useQuery(api.products.list);
  const seed = useMutation(api.products.seedDemoCatalog);
  const requested = useRef(false);

  useEffect(() => {
    if (products === undefined || products.length > 0) return;
    if (requested.current) return;
    requested.current = true;
    seed({}).catch(() => {
      // A later catalog load will retry if the demo seed could not run.
      requested.current = false;
    });
  }, [products, seed]);

  return {
    products,
    isLoading: products === undefined,
    featured: (products ?? []).filter((product) => product.featured).slice(0, 4),
  };
}
