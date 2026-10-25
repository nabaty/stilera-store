
"use client";

import { useEffect, useRef, useState } from "react";
import { LiquidBackground } from "@/components/liquid-background";
import { ProductImage } from "@/components/product-image";
import type { Product } from "@/data/products";
import { formatRupiah } from "@/lib/format";
import { useShop } from "@/lib/shop-context";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToBag, setSelectedProduct } = useShop();
  const [adding, setAdding] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleAddToBag() {
    addToBag(product);
    setAdding(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setAdding(false);
      timeoutRef.current = null;
    }, 800);
  }

  return (
    <article className="liquid-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#08090c] transition-colors duration-300 hover:border-[#0b2cb1]/60">
      <LiquidBackground intensity={0.12} />

      {/* Product image */}
      <button
        type="button"
        onClick={() => setSelectedProduct(product)}
        className="relative z-10 block aspect-[3/4] w-full shrink-0 overflow-hidden rounded-t-2xl"
        aria-label={`Open ${product.name}`}
      >
        <ProductImage
          product={product}
          className="pointer-events-none transition-transform duration-700 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/75 px-3 py-1 font-display text-[9px] tracking-[0.14em] text-white sm:text-[10px]">
          {product.category.toUpperCase()}
        </span>

        {product.isNewArrival && (
          <span className="absolute right-3 top-3 rounded-full border border-[#0b2cb1]/70 bg-[#0b2cb1] px-3 py-1 font-display text-[9px] tracking-[0.12em] text-white sm:text-[10px]">
            NEW
          </span>
        )}
      </button>

      {/* Product information */}
      <div className="relative z-10 flex flex-1 flex-col gap-4 p-3 sm:p-4">
        <div className="flex-1">
          <h3 className="font-display text-base leading-6 tracking-[0.06em] text-white transition-colors group-hover:text-[#8da5ff] sm:text-lg">
            {product.name}
          </h3>

          {product.graphic && (
            <p className="mt-1 text-[10px] tracking-[0.14em] text-white/45">
              {product.graphic.toUpperCase()}
            </p>
          )}

          <p className="mt-3 font-display text-sm tracking-[0.04em] text-[#8da5ff]">
            {formatRupiah(product.price)}
          </p>
        </div>

        {/* Add to bag */}
        <button
          type="button"
          onClick={handleAddToBag}
          className="min-h-11 w-full rounded-full border border-white/20 bg-black/20 px-3 py-3 font-display text-[10px] tracking-[0.14em] text-white transition-colors duration-300 hover:border-[#0b2cb1] hover:bg-[#0b2cb1] active:scale-[0.98] sm:text-xs"
        >
          {adding ? "ADDED TO BAG" : "ADD TO BAG"}
        </button>
      </div>
    </article>
  );
}
