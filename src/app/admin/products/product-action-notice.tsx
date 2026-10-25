
"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function ProductActionNotice() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const success = searchParams.get("success");
  const [dismissed, setDismissed] = useState(false);

  const notices: Record<string, { title: string; message: string }> = {
    created: {
      title: "PRODUCT CREATED",
      message: "Produk berhasil ditambahkan ke katalog STILERA.",
    },
    updated: {
      title: "PRODUCT UPDATED",
      message: "Perubahan produk berhasil disimpan.",
    },
  };

  const notice = success ? notices[success] : undefined;

  function closePopup() {
    setDismissed(true);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("success");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  if (!notice || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="product-notice-title"
        aria-describedby="product-notice-message"
        className="w-full max-w-md rounded-3xl border border-[#4169ff]/30 bg-[#08090c] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.8)] sm:p-8"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#4169ff]/40 bg-[#0b2cb1]/20 text-2xl text-[#a9baff]">
          ✓
        </div>

        <p className="mt-5 text-center text-[10px] tracking-[0.3em] text-[#8da5ff]">
          STILERA / SUCCESS
        </p>

        <h2
          id="product-notice-title"
          className="mt-3 text-center font-display text-2xl tracking-[0.08em] text-white"
        >
          {notice.title}
        </h2>

        <p
          id="product-notice-message"
          className="mt-3 text-center text-sm leading-6 text-white/55"
        >
          {notice.message}
        </p>

        <button
          type="button"
          onClick={closePopup}
          className="mt-7 min-h-12 w-full rounded-full border border-[#4169ff]/60 bg-[#0b2cb1]/30 px-5 py-3 text-xs tracking-[0.18em] text-white transition-colors hover:border-[#7290ff] hover:bg-[#0b2cb1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7290ff]"
        >
          CONTINUE
        </button>
      </section>
    </div>
  );
}
