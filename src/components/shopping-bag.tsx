
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import type { Product } from "@/data/products";
import { formatRupiah } from "@/lib/format";
import { useShop } from "@/lib/shop-context";
import { LiquidBackground } from "@/components/liquid-background";

export function ShoppingBag() {
  const {
    bagOpen,
    setBagOpen,
    items,
    subtotal,
    updateQuantity,
    removeFromBag,
  } = useShop();

  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (bagOpen) closeRef.current?.focus();
  }, [bagOpen]);

  return (
    <>
      {bagOpen && (
        <button
          type="button"
          aria-label="Close shopping bag overlay"
          className="fixed inset-0 z-[60] bg-black/70"
          onClick={() => setBagOpen(false)}
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col overflow-hidden border-l border-white/15 bg-[#050505]/90 shadow-[-20px_0_80px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-transform duration-300 ${
          bagOpen
            ? "translate-x-0"
            : "pointer-events-none translate-x-full"
        }`}
        role="dialog"
        aria-modal={bagOpen}
        aria-hidden={!bagOpen}
        aria-labelledby="shopping-bag-title"
      >
        <LiquidBackground intensity={0.31} />

        <div
          aria-hidden="true"
          className="shopping-bag-liquid pointer-events-none absolute inset-0"
        />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-black/20 px-5 py-5">
          <div>
            <p className="text-[10px] tracking-[0.32em] text-white/60">
              STILERA / BAG
            </p>

            <h2
              id="shopping-bag-title"
              className="mt-1 font-display text-3xl tracking-[0.12em] text-white"
            >
              YOUR CART
            </h2>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={() => setBagOpen(false)}
            className="liquid-control rounded-full border border-white/15 px-5 py-2 font-display text-xs tracking-[0.2em] text-white transition-colors hover:border-[#0b2cb1] hover:text-[#0b2cb1]"
          >
            CLOSE
          </button>
        </div>

        {/* Cart items */}
        <div className="relative z-10 flex-1 overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <div className="liquid-cart-empty rounded-2xl border border-white/10 px-5 py-8">
              <p className="font-display text-xl tracking-[0.12em] text-white/80">
                YOUR BAG IS EMPTY
              </p>

              <p className="mt-2 text-sm leading-7 text-white/50">
                Keranjang masih kosong. Tambahkan produk dari katalog
                untuk melanjutkan.
              </p>

              <button
                type="button"
                onClick={() => setBagOpen(false)}
                className="mt-6 rounded-full border border-white/20 px-5 py-3 font-display text-xs tracking-[0.15em] text-white transition-colors hover:border-[#0b2cb1]"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => {
                const cartProduct: Product = {
                  id: item.productId,
                  name: item.name,
                  price: item.price,
                  category: "t-shirts",
                  image: item.image,
                  graphic: "",
                  description: "",
                  materialCare: "",
                  galleryImages: [],
                };

                return (
                  <li
                    key={item.key}
                    className="flex gap-4 border-b border-white/10 pb-5"
                  >
                    <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                      {item.image ? (
                        <ProductImage
                          product={cartProduct}
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#111] text-[9px] text-white/40">
                          NO IMAGE
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                        <div className="min-w-0">
                          <p className="break-words font-display text-base leading-snug tracking-[0.06em] text-white">
                            {item.name}
                          </p>

                          <p className="mt-2 text-xs text-white/40">
                            {formatRupiah(item.price)} / item
                          </p>
                        </div>

                        <p className="shrink-0 whitespace-nowrap text-sm text-white">
                          {formatRupiah(item.price * item.quantity)}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-center overflow-hidden rounded-full border border-white/15 bg-black/30">
                          <button
                            type="button"
                            className="px-4 py-2 text-white transition-colors hover:text-[#0b2cb1]"
                            onClick={() =>
                              updateQuantity(
                                item.key,
                                item.quantity - 1,
                              )
                            }
                            aria-label={`Decrease ${item.name}`}
                          >
                            −
                          </button>

                          <span className="min-w-8 text-center text-sm">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            className="px-4 py-2 text-white transition-colors hover:text-[#0b2cb1]"
                            onClick={() =>
                              updateQuantity(
                                item.key,
                                item.quantity + 1,
                              )
                            }
                            aria-label={`Increase ${item.name}`}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromBag(item.key)}
                          className="rounded-full border border-transparent px-3 py-2 text-xs tracking-[0.16em] text-white/50 transition-colors hover:border-white/15 hover:text-[#0b2cb1]"
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Subtotal and checkout */}
        <div className="relative z-10 border-t border-white/10 bg-black/50 px-5 py-5 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.22em] text-white/50">
                SUBTOTAL
              </p>
              <p className="mt-1 text-[10px] text-white/35">
                {items.reduce((total, item) => total + item.quantity, 0)}{" "}
                item(s)
              </p>
            </div>

            <span className="font-display text-xl text-white">
              {formatRupiah(subtotal)}
            </span>
          </div>

          <p className="mb-4 text-xs leading-5 text-white/40">
            Ongkir akan dikonfirmasi admin setelah alamat dan pilihan
            kurir diperiksa.
          </p>

          <Link
            href="/checkout"
            onClick={() => setBagOpen(false)}
            aria-disabled={items.length === 0}
            tabIndex={items.length === 0 ? -1 : undefined}
            className={`block w-full rounded-full border py-3.5 text-center font-display text-sm tracking-[0.2em] transition-colors ${
              items.length === 0
                ? "pointer-events-none border-white/10 bg-white/5 text-white/30"
                : "border-[#0b2cb1] bg-[#0b2cb1] text-white hover:bg-[#092397]"
            }`}
          >
            PROCEED TO CHECKOUT
          </Link>

          <p className="mt-3 text-center text-[9px] tracking-[0.15em] text-white/30">
            SECURE CHECKOUT · STILERA
          </p>
        </div>
      </aside>
    </>
  );
}
