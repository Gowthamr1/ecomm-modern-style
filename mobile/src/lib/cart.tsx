import AsyncStorage from "@react-native-async-storage/async-storage";
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
  productId: string;
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
  isReady: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "forma.cart.v1";

function parseCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line) =>
        line &&
        typeof line.productId === "string" &&
        typeof line.price === "number" &&
        typeof line.quantity === "number" &&
        typeof line.slug === "string",
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (active) setLines(parseCart(raw));
      })
      .catch(() => {
        // A missing storage backend still leaves the in-memory cart usable.
      })
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lines)).catch(() => {
      // Persistence is best effort; the cart continues to work this session.
    });
  }, [lines, isReady]);

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
    (productId: string, quantity: number) => {
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

  const remove = useCallback((productId: string) => {
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
    return { lines, count, subtotal, isReady, add, setQuantity, remove, clear };
  }, [lines, add, setQuantity, remove, clear, isReady]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside a CartProvider");
  return context;
}
