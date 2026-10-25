
"use client";

import Image from "next/image";
import { useState } from "react";

type ProductGalleryProps = {
  name: string;
  images: string[];
};

export function ProductGallery({ name, images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const validImages = images.filter(
    (url, index, all) => Boolean(url) && all.indexOf(url) === index,
  );

  function previous() {
    setActiveIndex(
      (current) => (current - 1 + validImages.length) % validImages.length,
    );
  }

  function next() {
    setActiveIndex((current) => (current + 1) % validImages.length);
  }

  if (validImages.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-[#08090c] text-sm text-white/40">
        No product image available
      </div>
    );
  }

  return (
    <div
      className="w-full"
      onTouchStart={(event) => {
        setTouchStartX(event.touches[0].clientX);
      }}
      onTouchEnd={(event) => {
        if (touchStartX === null || validImages.length < 2) return;

        const difference = event.changedTouches[0].clientX - touchStartX;

        if (difference < -50) next();
        if (difference > 50) previous();

        setTouchStartX(null);
      }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#08090c]">
        <Image
          key={validImages[activeIndex]}
          src={validImages[activeIndex]}
          alt={`${name}, image ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
          className="object-contain"
        />

        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={previous}
              aria-label="Previous product image"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/70 text-2xl text-white transition hover:border-[#4169ff] hover:bg-[#0b2cb1]"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next product image"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/70 text-2xl text-white transition hover:border-[#4169ff] hover:bg-[#0b2cb1]"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-xs text-white">
              {activeIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {validImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto bg-black/30 p-3">
          {validImages.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={activeIndex === index}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                activeIndex === index
                  ? "border-[#4169ff]"
                  : "border-white/15 opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
