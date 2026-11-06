import type { Id } from "@/convex/_generated/dataModel";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLine = {
  productId: Id<"products">;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: Id<"products">, quantity: number) => void;
  remove: (productId: Id<"products">) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "forma.cart.v1";

function readCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line) =>
        line &&
        typeof line.productId === "string" &&
        typeof line.price === "number" &&
        typeof line.quantity === "number",
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() =>
    typeof window === "undefined" ? [] : readCart(),
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage may be unavailable in private contexts — the cart still works
      // for the current session.
    }
  }, [lines]);

  const add = useCallback(
    (line: Omit<CartLine, "quantity">, quantity = 1) => {
      setLines((current) => {
        const existing = current.find(
          (item) => item.productId === line.productId,
        );
        if (existing) {
          return current.map((item) =>
            item.productId === line.productId
              ? { ...item, quantity: Math.min(10, item.quantity + quantity) }
              : item,
          );
        }
        return [
          ...current,
          { ...line, quantity: Math.max(1, Math.min(10, quantity)) },
        ];
      });
    },
    [],
  );

  const setQuantity = useCallback(
    (productId: Id<"products">, quantity: number) => {
      setLines((current) =>
        current
          .map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.max(0, Math.min(10, quantity)) }
              : item,
          )
          .filter((item) => item.quantity > 0),
      );
    },
    [],
  );

  const remove = useCallback((productId: Id<"products">) => {
    setLines((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = lines.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    return { lines, count, subtotal, add, setQuantity, remove, clear };
  }, [lines, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return context;
}
