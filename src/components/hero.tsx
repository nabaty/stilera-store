
"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/data/products";
import { FloatingProducts } from "@/components/floating-products";
import { LiquidBackground } from "@/components/liquid-background";
import { useShop } from "@/lib/shop-context";

type HeroProps = {
  products: Product[];
};

export function Hero({ products }: HeroProps) {
  const { goToCatalog } = useShop();
  const [heroFailed, setHeroFailed] = useState(false);

  return (
    <section
      id="top"
      className="relative isolate min-h-[100svh] overflow-hidden border-b border-white/10 bg-[#050505] pt-20 md:pt-24"
    >
      {/* Cinematic angel background */}
      <div className="absolute inset-0 overflow-hidden bg-[#050505]">
        {heroFailed ? (
          <div
            className="hero-image-motion absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(
                  ellipse at 25% 25%,
                  rgba(190,205,225,.2),
                  transparent 35%
                ),
                radial-gradient(
                  ellipse at 75% 60%,
                  rgba(110,130,155,.15),
                  transparent 40%
                ),
                linear-gradient(
                  145deg,
                  #171a20,
                  #050505 65%
                )
              `,
            }}
          />
        ) : (
          <Image
            src="/images/hero-angel.jpg"
            alt="Winged angel statue in a dramatic dark landscape"
            fill
            priority
            sizes="100vw"
            className="hero-image-motion object-cover object-[center_30%]"
            onError={() => setHeroFailed(true)}
          />
        )}

        {/* Cinematic dark overlays */}
        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-[#050505]" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(5,5,5,0.45)_100%)]" />
      </div>

      {/* Animated liquid background */}
      <LiquidBackground
        intensity={1}
        className="hero-liquid-layer"
      />

      {/* Silver reflection */}
      <div
        className="silver-liquid-reflection"
        aria-hidden="true"
      />

      {/* Floating New Arrival products */}
      {products.length > 0 && (
        <FloatingProducts products={products} />
      )}

      {/* Main hero content */}
      <div className="pointer-events-none relative z-30 mx-auto flex min-h-[calc(100svh-5rem)] max-w-[1440px] flex-col justify-between px-4 pb-10 pt-6 md:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-3 text-[11px] tracking-[0.38em] text-white/70">
              SS/26
            </p>

            <h1 className="max-w-[11ch] font-display text-[18vw] leading-[0.82] tracking-[0.04em] text-white sm:text-[12vw] lg:text-[8.4rem]">
              FEARLESS
              <span className="block">SOUL</span>
            </h1>
          </div>

          <p className="hidden max-w-[10rem] text-right text-[11px] leading-5 tracking-[0.28em] text-white/70 sm:block">
            UNDERGROUND CULTURE
          </p>
        </div>

        <div className="relative z-10 mt-6 flex flex-wrap items-end justify-between gap-6">
          <button
            type="button"
            onClick={() => goToCatalog("all")}
            className="pointer-events-auto rounded-full border border-white/40 px-7 py-3 font-display text-sm tracking-[0.28em] text-white transition-colors duration-300 hover:border-[#0b2cb1] hover:bg-[#0b2cb1] active:bg-[#0b2cb1]"
          >
            EXPLORE COLLECTION
          </button>

          <p className="max-w-sm text-xs leading-6 tracking-[0.16em] text-white/70">
            Oversized black tees from the frozen cathedral.
            Fearless souls only.
          </p>
        </div>
      </div>

      {/* STILERA wordmark */}
      <p className="pointer-events-none absolute left-1/2 top-[65%] z-10 w-[92%] -translate-x-1/2 -translate-y-1/2 text-center font-display text-[16vw] leading-none tracking-[0.08em] text-[#E50914]/90 mix-blend-screen drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)] sm:text-[12vw] lg:text-[9.5rem]">
        STILERA
      </p>
    </section>
  );
}
