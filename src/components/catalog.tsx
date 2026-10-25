
"use client";

import { LiquidBackground } from "@/components/liquid-background";
import { ProductCard } from "@/components/product-card";
import {
  filterProducts,
  type Product,
  type ProductFilter,
} from "@/data/products";
import { useShop } from "@/lib/shop-context";

const filters: { label: string; value: ProductFilter }[] = [
  { label: "COLLECTION", value: "all" },
  { label: "T-SHIRTS", value: "t-shirts" },
  { label: "TOPS", value: "tops" },
  { label: "BOTTOMS", value: "bottoms" },
  { label: "ACCESSORIES", value: "accessories" },
  { label: "NEW ARRIVALS", value: "new-arrivals" },
];

type CatalogProps = {
  products: Product[];
};

export function Catalog({ products }: CatalogProps) {
  const { filter, setFilter, searchQuery, setSearchQuery } = useShop();

  const visibleProducts = filterProducts(
    products,
    filter,
    searchQuery,
  );

  return (
    <section
      id="new-arrivals"
      className="liquid-section relative isolate w-full max-w-none scroll-mt-24 overflow-hidden bg-[#050505] py-16 md:py-24"
    >
      <LiquidBackground intensity={0.55} />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 md:px-8">
        <div className="mb-10 border-b border-white/10 pb-8">
          <p className="text-[11px] tracking-[0.38em] text-[#0b2cb1]">
            STILERA / SS26
          </p>

          <h2 className="mt-3 font-display text-5xl tracking-[0.08em] text-white md:text-7xl">
            {filter === "all"
              ? "COLLECTION"
              : filter === "new-arrivals"
                ? "NEW ARRIVALS"
                : filters.find((item) => item.value === filter)?.label}
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">
            Underground essentials. Dark silhouettes, oversized
            cotton, and fearless expression.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <nav
              aria-label="Product collections"
              className="flex gap-2 overflow-x-auto pb-2"
            >
              {filters.map((item) => {
                const active = filter === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    aria-pressed={active}
                    className={`shrink-0 rounded-full border px-4 py-2.5 font-display text-xs tracking-[0.14em] transition-colors duration-200 ${
                      active
                        ? "border-[#0b2cb1] bg-[#0b2cb1] text-white"
                        : "border-white/15 bg-black/30 text-white/70 hover:border-[#0b2cb1] hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <label className="sr-only" htmlFor="catalog-search">
              Search products
            </label>

            <input
              id="catalog-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-white/15 bg-black/40 px-5 py-3 text-sm text-white outline-none placeholder:text-white/35 transition-colors focus:border-[#0b2cb1] sm:max-w-sm"
            />
          </div>
        </div>

        {visibleProducts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center text-sm tracking-[0.12em] text-white/50">
            No products available for this collection.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
