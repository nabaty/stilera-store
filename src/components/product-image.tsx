
"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/data/products";

type ProductImageProps = {
  product: Product;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function GraphicFallback({ product }: { product: Product }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0a0a0a]">
      <svg
        viewBox="0 0 240 300"
        className="h-[88%] w-auto text-white"
        aria-hidden="true"
      >
        <path
          d="M78 78c-18 8-28 32-24 68 3 28 16 54 28 70h76c12-16 25-42 28-70 4-36-6-60-24-68-8-28-28-46-42-46s-34 18-42 46Z"
          fill="#111"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M86 86h68v96H86Z" fill="#0b0b0b" />

        {product.graphic === "butterfly" && (
          <g fill="none" stroke="#E50914" strokeWidth="2">
            <path d="M120 128c-18-22-38-18-40-4 8 18 28 22 40 12 12 10 32 6 40-12-2-14-22-18-40 4Z" />
            <path d="M120 118v28" stroke="#fff" />
          </g>
        )}

        {product.graphic === "angel" && (
          <g fill="none" stroke="#fff" strokeWidth="1.6">
            <circle cx="120" cy="122" r="8" />
            <path d="M120 130v22M112 140h16" />
            <path
              d="M92 136c12-18 22-10 28 2 6-12 16-20 28-2"
              stroke="#E50914"
            />
          </g>
        )}

        {product.graphic === "silhouette" && (
          <path
            d="M120 118c6 0 10 6 10 12s-4 10-8 12v22h-4v-22c-4-2-8-6-8-12s4-12 10-12Z"
            fill="#E50914"
          />
        )}

        {product.graphic === "gothic" && (
          <g fill="none" stroke="#fff" strokeWidth="1.8">
            <path d="M120 118v40M108 132h24" />
            <path d="M112 150h16" stroke="#E50914" />
          </g>
        )}

        {product.graphic === "night" && (
          <g fill="none" stroke="#fff" strokeWidth="1.6">
            <path d="M132 124a16 16 0 1 1-18 18 12 12 0 0 0 18-18Z" />
            <path d="M104 142c8-10 22-8 28 4" stroke="#E50914" />
          </g>
        )}

        {product.graphic === "wings" && (
          <path
            d="M120 136c-16-18-34-12-40 2 14 8 28 6 40-4 12 10 26 12 40 4-6-14-24-20-40-2Z"
            fill="none"
            stroke="#E50914"
            strokeWidth="2"
          />
        )}
      </svg>
    </div>
  );
}

export function ProductImage({
  product,
  className = "",
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority = false,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="product-image-shell relative h-full w-full overflow-hidden bg-[#08090c]">
      {failed || !product.image ? (
        <GraphicFallback product={product} />
      ) : (
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          priority={priority}
          className={`pointer-events-none object-cover brightness-[0.84] contrast-[1.06] saturate-[0.92] !transform-none !transition-none ${className}`}
          onError={() => setFailed(true)}
        />
      )}

      {/* Subtle silver reflection without blur or image distortion */}
      <span
        aria-hidden="true"
        className="product-liquid-gloss"
      />
    </div>
  );
}
