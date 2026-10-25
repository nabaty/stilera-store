
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  invalid: {
    title: "INVALID PRODUCT DATA",
    message: "Periksa kembali nama, harga, kategori, slug, dan detail produk.",
  },
  "main-image-required": {
    title: "IMAGE REQUIRED",
    message: "Pilih gambar utama produk sebelum menyimpan.",
  },
  "image-type": {
    title: "UNSUPPORTED IMAGE",
    message: "Format gambar harus JPG, PNG, atau WebP.",
  },
  "image-size": {
    title: "IMAGE TOO LARGE",
    message: "Ukuran setiap gambar maksimal 5 MB.",
  },
  upload: {
    title: "UPLOAD FAILED",
    message: "Gambar gagal diunggah. Periksa koneksi dan coba kembali.",
  },
  duplicate: {
    title: "PRODUCT ALREADY EXISTS",
    message: "Slug produk sudah digunakan. Gunakan slug yang berbeda.",
  },
  save: {
    title: "SAVE FAILED",
    message: "Produk gagal disimpan ke database. Silakan coba kembali.",
  },
};

export default function ProductFormErrorNotice() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const error = searchParams.get("error");

  if (!error) return null;

  const notice = ERROR_MESSAGES[error] ?? {
    title: "ACTION FAILED",
    message: "Terjadi kesalahan. Periksa data dan coba kembali.",
  };

  function closePopup() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="product-error-title"
        aria-describedby="product-error-message"
        className="w-full max-w-md rounded-3xl border border-red-500/25 bg-[#08090c] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.8)] sm:p-8"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-2xl text-red-300">
          !
        </div>

        <p className="mt-5 text-center text-[10px] tracking-[0.3em] text-red-300">
          STILERA / ERROR
        </p>

        <h2
          id="product-error-title"
          className="mt-3 text-center font-display text-2xl tracking-[0.08em] text-white"
        >
          {notice.title}
        </h2>

        <p
          id="product-error-message"
          className="mt-3 text-center text-sm leading-6 text-white/55"
        >
          {notice.message}
        </p>

        <button
          type="button"
          onClick={closePopup}
          className="mt-7 min-h-12 w-full rounded-full border border-red-500/50 bg-red-500/10 px-5 py-3 text-xs tracking-[0.18em] text-white transition-colors hover:border-red-400 hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          CLOSE
        </button>
      </section>
    </div>
  );
}
