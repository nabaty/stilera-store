
"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/data/products";
import { ProductImage } from "@/components/product-image";
import { useShop } from "@/lib/shop-context";

type FloatingProductsProps = {
  products: Product[];
};

const floatPositions = [
  {
    className:
      "left-[3%] top-[40%] w-[26%] max-w-[190px] sm:w-[15%] lg:left-[4%] lg:w-[12%]",
    depth: 18,
    delay: "0s",
  },
  {
    className:
      "right-[3%] top-[34%] w-[24%] max-w-[180px] sm:w-[14%] lg:right-[5%] lg:w-[12%]",
    depth: 24,
    delay: "0.8s",
  },
  {
    className:
      "bottom-[12%] left-[18%] hidden w-[14%] max-w-[160px] lg:block lg:w-[11%]",
    depth: 14,
    delay: "1.4s",
  },
  {
    className:
      "bottom-[12%] right-[18%] hidden w-[14%] max-w-[170px] lg:block lg:w-[11%]",
    depth: 20,
    delay: "0.4s",
  },
];

export function FloatingProducts({
  products,
}: FloatingProductsProps) {
  const { setSelectedProduct } = useShop();
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pointer = useRef({ x: 0, y: 0 });
  const frame = useRef(0);
  const reducedMotion = useRef(false);

  // Hanya produk yang ditandai New Arrival di database.
  // Tidak mengisi slot dengan produk lain.
  const featuredProducts = products
    .filter((product) => product.isNewArrival === true)
    .slice(0, floatPositions.length);

  useEffect(() => {
    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const syncMotion = () => {
      reducedMotion.current = motionQuery.matches;
    };

    syncMotion();
    motionQuery.addEventListener("change", syncMotion);

    const applyParallax = () => {
      frame.current = 0;

      itemRefs.current.forEach((node, index) => {
        if (!node) return;

        const depth = floatPositions[index]?.depth ?? 16;

        node.style.setProperty(
          "--shift-x",
          `${pointer.current.x * depth}px`,
        );

        node.style.setProperty(
          "--shift-y",
          `${pointer.current.y * depth}px`,
        );
      });
    };

    const schedule = () => {
      if (!frame.current) {
        frame.current = requestAnimationFrame(applyParallax);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (
        reducedMotion.current ||
        event.pointerType !== "mouse"
      ) {
        return;
      }

      const bounds = stageRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const inside =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      pointer.current = inside
        ? {
            x: (event.clientX - bounds.left) / bounds.width - 0.5,
            y: (event.clientY - bounds.top) / bounds.height - 0.5,
          }
        : { x: 0, y: 0 };

      schedule();
    };

    window.addEventListener("pointermove", onPointerMove, {
      passive: true,
    });

    return () => {
      motionQuery.removeEventListener("change", syncMotion);
      window.removeEventListener("pointermove", onPointerMove);

      if (frame.current) {
        cancelAnimationFrame(frame.current);
      }
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="pointer-events-none absolute inset-0 z-20"
    >
      {featuredProducts.map((product, index) => {
        const position = floatPositions[index];

        if (!position) return null;

        return (
          <button
            key={product.id}
            type="button"
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            onClick={() => setSelectedProduct(product)}
            style={{ animationDelay: position.delay }}
            className={`product-float pointer-events-auto absolute overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-[0_20px_60px_rgba(0,0,0,0.55)] transition-[border-color,box-shadow] hover:border-[#0b2cb1] hover:shadow-[0_16px_40px_rgba(11,44,177,0.25)] ${position.className}`}
            aria-label={`View ${product.name}`}
          >
            <span className="pointer-events-none relative block aspect-[3/4] w-full">
              <ProductImage
                product={product}
                className="pointer-events-none"
                sizes="(max-width: 768px) 30vw, 16vw"
              />
            </span>

            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-2 py-2 text-left">
              <span className="block font-display text-[11px] tracking-[0.12em] text-white sm:text-xs">
                {product.name}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
