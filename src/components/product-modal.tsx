
"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { LiquidBackground } from "@/components/liquid-background";
import { ProductImage } from "@/components/product-image";
import type { Product } from "@/data/products";
import { formatRupiah } from "@/lib/format";
import { useShop } from "@/lib/shop-context";

type ProductModalProps = {
  product: Product;
  onClose: () => void;
  onAdd: () => void;
};

export function ProductModal() {
  const { selectedProduct, setSelectedProduct, addToBag } = useShop();

  const closeProduct = useCallback(() => {
    setSelectedProduct(null);
  }, [setSelectedProduct]);

  const handleAdd = useCallback(() => {
    if (!selectedProduct) return;

    addToBag(selectedProduct);
    setSelectedProduct(null);
  }, [selectedProduct, addToBag, setSelectedProduct]);

  if (!selectedProduct) return null;

  return (
    <ProductModalPanel
      key={selectedProduct.id}
      product={selectedProduct}
      onClose={closeProduct}
      onAdd={handleAdd}
    />
  );
}

type ProductModalPanelProps = {
  product: Product;
  onClose: () => void;
  onAdd: () => void;
};

function ProductModalPanel({
  product,
  onClose,
  onAdd,
}: ProductModalPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const galleryImages = Array.from(
    new Set(
      [product.image, ...(product.galleryImages ?? [])].filter(
        (src): src is string =>
          typeof src === "string" && src.trim().length > 0,
      ),
    ),
  ).slice(0, 3);

  const currentImage = galleryImages[activeImage] ?? product.image;
  const hasMultipleImages = galleryImages.length > 1;

  const showPreviousImage = useCallback(() => {
    setActiveImage((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1,
    );
  }, [galleryImages.length]);

  const showNextImage = useCallback(() => {
    setActiveImage((current) =>
      current === galleryImages.length - 1 ? 0 : current + 1,
    );
  }, [galleryImages.length]);

  useEffect(() => {
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasMultipleImages) {
        showPreviousImage();
      }
      if (event.key === "ArrowRight" && hasMultipleImages) {
        showNextImage();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, hasMultipleImages, showPreviousImage, showNextImage]);

  function handleTouchStart(
    event: React.TouchEvent<HTMLDivElement>,
  ) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(
    event: React.TouchEvent<HTMLDivElement>,
  ) {
    if (touchStartX.current === null || !hasMultipleImages) return;

    const endX =
      event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = endX - touchStartX.current;

    if (Math.abs(distance) > 45) {
      if (distance > 0) {
        showPreviousImage();
      } else {
        showNextImage();
      }
    }

    touchStartX.current = null;
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/85 p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <button
        type="button"
        className="fixed inset-0 h-full w-full cursor-default"
        aria-label="Close product details"
        onClick={onClose}
      />

      <div className="liquid-chrome-surface relative isolate z-10 my-3 grid w-full max-w-md grid-cols-1 overflow-hidden rounded-3xl border border-white/15 bg-[#08090c] shadow-[0_24px_100px_rgba(0,0,0,0.75)] sm:my-0 sm:max-h-[85dvh] sm:max-w-5xl sm:grid-cols-2">
        <LiquidBackground intensity={0.12} />

        <div className="relative z-10 flex min-w-0 flex-col bg-[#08090c] sm:min-h-0">
          <div
            className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-[#08090c] sm:aspect-auto sm:min-h-[420px] sm:flex-1"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {currentImage ? (
              activeImage === 0 ? (
                <ProductImage
                  product={product}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                  className="transition-transform duration-500"
                />
              ) : (
                <Image
                  key={currentImage}
                  src={currentImage}
                  alt={`${product.name}, image ${activeImage + 1}`}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                  className="object-cover"
                />
              )
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/40">
                Product image unavailable
              </div>
            )}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-black/[0.10]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-black/25"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />

            <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/70 px-3 py-1.5">
              <p className="font-display text-[10px] tracking-[0.2em] text-white">
                {product.category.toUpperCase()} / SS26
              </p>
            </div>

            {product.isNewArrival === true && (
              <div className="absolute right-4 top-4 rounded-full border border-[#0b2cb1]/70 bg-[#0b2cb1] px-3 py-1.5">
                <p className="font-display text-[10px] tracking-[0.16em] text-white">
                  NEW ARRIVAL
                </p>
              </div>
            )}

            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  aria-label="Previous product image"
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm transition-colors hover:border-[#0b2cb1] hover:bg-[#0b2cb1]"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                    <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={showNextImage}
                  aria-label="Next product image"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm transition-colors hover:border-[#0b2cb1] hover:bg-[#0b2cb1]"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div className="absolute bottom-4 right-4 rounded-full border border-white/15 bg-black/70 px-3 py-1.5 font-display text-[10px] tracking-[0.15em] text-white">
                  {String(activeImage + 1).padStart(2, "0")} /{" "}
                  {String(galleryImages.length).padStart(2, "0")}
                </div>
              </>
            )}
          </div>

          {hasMultipleImages && (
            <div className="border-t border-white/10 bg-black/30 p-3 sm:p-4">
              <div className="grid grid-cols-3 gap-3" aria-label="Product image thumbnails">
                {galleryImages.map((src, index) => (
                  <button
                    key={`${src}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={activeImage === index}
                    className={`relative aspect-[4/3] overflow-hidden rounded-xl border bg-[#101216] transition-colors duration-200 ${
                      activeImage === index
                        ? "border-[#4169ff] ring-1 ring-[#4169ff]/50"
                        : "border-white/10 hover:border-white/40"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 30vw, 180px"
                      className="object-cover"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-4 text-left font-display text-[9px] tracking-[0.12em] text-white/80">
                      {["01 / FRONT", "02 / BACK", "03 / DETAIL"][index]}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center text-[9px] tracking-[0.16em] text-white/35">
                SELECT AN IMAGE OR SWIPE TO EXPLORE
              </p>
            </div>
          )}
        </div>

        <div className="relative z-10 flex min-h-0 min-w-0 flex-col bg-gradient-to-br from-[#101216] via-[#08090c] to-[#050505] sm:overflow-y-auto">
          <div className="flex-1 p-5 sm:p-7 lg:p-9">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-[#0b2cb1]" />
              <p className="text-[10px] tracking-[0.3em] text-white/50">
                THE COLLECTION / 2026
              </p>
            </div>

            <h2
              id="product-modal-title"
              className="break-words font-display text-3xl leading-tight tracking-[0.07em] text-white sm:text-4xl lg:text-5xl"
            >
              {product.name}
            </h2>

            <p className="mt-4 font-display text-xl tracking-[0.05em] text-[#8da5ff]">
              {formatRupiah(product.price)}
            </p>

            <div className="my-6 h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent" />

            <section aria-labelledby="product-description-heading">
              <h3
                id="product-description-heading"
                className="text-[10px] tracking-[0.25em] text-white/45"
              >
                DESCRIPTION
              </h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/70">
                {product.description || "Product description coming soon."}
              </p>
            </section>

            <section className="mt-6" aria-labelledby="material-care-heading">
              <h3
                id="material-care-heading"
                className="text-[10px] tracking-[0.25em] text-white/45"
              >
                MATERIAL & CARE
              </h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/70">
                {product.materialCare ||
                  "Material and care information coming soon."}
              </p>
            </section>
          </div>

          <div className="relative border-t border-white/10 bg-black/20 p-5 sm:p-7 lg:p-9">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onAdd}
                className="group relative min-h-12 flex-1 overflow-hidden rounded-full border border-[#0b2cb1] bg-[#0b2cb1] px-3 py-3 font-display text-xs tracking-[0.18em] text-white transition-colors duration-300 hover:bg-[#092397] active:scale-[0.98] sm:text-sm sm:tracking-[0.22em]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[450%]"
                />
                <span className="relative">ADD TO BAG</span>
              </button>

              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="min-h-12 rounded-full border border-white/20 bg-white/[0.02] px-5 py-3 font-display text-xs tracking-[0.12em] text-white/75 transition-colors duration-300 hover:border-[#0b2cb1] hover:bg-[#0b2cb1]/10 hover:text-white sm:text-sm"
              >
                CLOSE
              </button>
            </div>

            <p className="mt-4 text-center text-[9px] tracking-[0.15em] text-white/30">
              STILERA · FEARLESS SOULS ONLY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
