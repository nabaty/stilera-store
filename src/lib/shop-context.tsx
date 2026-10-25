"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product, ProductFilter } from "@/data/products";

export type BagItem = {
  key: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
};

type ShopContextValue = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchOpen: boolean;
  setSearchOpen: (value: boolean) => void;
  filter: ProductFilter;
  setFilter: (value: ProductFilter) => void;
  bagOpen: boolean;
  setBagOpen: (value: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  items: BagItem[];
  itemCount: number;
  subtotal: number;
  addToBag: (product: Product) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeFromBag: (key: string) => void;
  goToCatalog: (nextFilter?: ProductFilter) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

const STORAGE_KEY = "stilera-shopping-bag";

function normalizeBagItem(item: unknown): BagItem | null {
  if (!item || typeof item !== "object") return null;

  const value = item as Record<string, unknown>;

  if (
    typeof value.productId !== "string" ||
    typeof value.name !== "string" ||
    typeof value.quantity !== "number" ||
    !Number.isInteger(value.quantity) ||
    value.quantity <= 0 ||
    typeof value.price !== "number" ||
    !Number.isFinite(value.price) ||
    value.price < 0 ||
    typeof value.image !== "string"
  ) {
    return null;
  }

  // Abaikan properti size dari data keranjang versi lama.
  return {
    key: value.productId,
    productId: value.productId,
    name: value.name,
    quantity: value.quantity,
    price: value.price,
    image: value.image,
  };
}

function mergeBagItems(items: BagItem[]): BagItem[] {
  const merged = new Map<string, BagItem>();

  for (const item of items) {
    const existing = merged.get(item.productId);

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      merged.set(item.productId, { ...item });
    }
  }

  return Array.from(merged.values());
}

export function ShopProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState<ProductFilter>("all");
  const [bagOpen, setBagOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);
  const [items, setItems] = useState<BagItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedBag = localStorage.getItem(STORAGE_KEY);

      if (savedBag) {
        const parsed: unknown = JSON.parse(savedBag);

        if (Array.isArray(parsed)) {
          const validItems = parsed
            .map(normalizeBagItem)
            .filter((item): item is BagItem => item !== null);

          setItems(mergeBagItems(validItems));
        }
      }
    } catch (error) {
      console.error("Gagal memuat keranjang STILERA:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      // Data keranjang yang disimpan tidak lagi memiliki properti size.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Gagal menyimpan keranjang STILERA:", error);
    }
  }, [items, isHydrated]);

  const addToBag = useCallback((product: Product) => {
    setItems((current) => {
      const existing = current.find(
        (item) => item.productId === product.id,
      );

      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...current,
        {
          key: product.id,
          productId: product.id,
          name: product.name,
          quantity: 1,
          price: product.price,
          image: product.image,
        },
      ];
    });

    setBagOpen(true);
  }, []);

  const updateQuantity = useCallback(
    (key: string, quantity: number) => {
      setItems((current) => {
        if (quantity < 1) {
          return current.filter((item) => item.key !== key);
        }

        return current.map((item) =>
          item.key === key ? { ...item, quantity } : item,
        );
      });
    },
    [],
  );

  const removeFromBag = useCallback((key: string) => {
    setItems((current) =>
      current.filter((item) => item.key !== key),
    );
  }, []);

  const goToCatalog = useCallback(
    (nextFilter?: ProductFilter) => {
      if (nextFilter) {
        setFilter(nextFilter);
      }

      const catalog = document.getElementById("new-arrivals");
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      catalog?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [],
  );

  useEffect(() => {
    const locked = bagOpen || selectedProduct !== null;
    document.body.style.overflow = locked ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [bagOpen, selectedProduct]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      if (selectedProduct) {
        setSelectedProduct(null);
        return;
      }

      if (bagOpen) {
        setBagOpen(false);
        return;
      }

      if (searchOpen) {
        setSearchOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedProduct, bagOpen, searchOpen]);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    [items],
  );

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      searchOpen,
      setSearchOpen,
      filter,
      setFilter,
      bagOpen,
      setBagOpen,
      selectedProduct,
      setSelectedProduct,
      items,
      itemCount,
      subtotal,
      addToBag,
      updateQuantity,
      removeFromBag,
      goToCatalog,
    }),
    [
      searchQuery,
      searchOpen,
      filter,
      bagOpen,
      selectedProduct,
      items,
      itemCount,
      subtotal,
      addToBag,
      updateQuantity,
      removeFromBag,
      goToCatalog,
    ],
  );

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used within ShopProvider");
  }

  return context;
}