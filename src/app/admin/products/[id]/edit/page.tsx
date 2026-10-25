import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateProductAction } from "./actions";
import ProductFormErrorNotice from "../../product-form-error-notice";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

type GalleryImage = string;

const categories = [
  { value: "t-shirts", label: "T-Shirts" },
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "accessories", label: "Accessories" },
];

const fieldClass =
  "w-full min-w-0 rounded-xl border border-white/15 bg-black/70 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#0b2cb1] focus:ring-1 focus:ring-[#0b2cb1]/40";

const fileClass =
  "block w-full min-w-0 text-sm text-white/70 file:mb-2 file:mr-2 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#0b2cb1] file:px-4 file:py-3 file:text-white file:transition-colors hover:file:bg-[#092397]";

const sectionClass =
  "space-y-5 rounded-2xl border border-white/10 bg-gradient-to-br from-[#101216] via-[#08090c] to-[#050505] p-5 sm:p-7";

const imageCardClass =
  "min-w-0 space-y-4 rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5";

async function EditProductContent({
  params,
  searchParams,
}: EditProductPageProps) {
  await connection();

  const { id } = await params;
  const { error: formError } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (
    profileError ||
    !profile ||
    !["owner", "staff"].includes(profile.role)
  ) {
    redirect("/admin/login?error=unauthorized");
  }

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
        id,
        name,
        slug,
        price,
        category,
        description,
        material_care,
        graphic,
        image_url,
        gallery_images,
        is_active,
        is_new_arrival
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-[10px] tracking-[0.3em] text-[#7290ff]">
            STILERA / MANAGEMENT
          </p>

          <h1 className="mt-4 font-display text-3xl tracking-[0.08em]">
            PRODUCT NOT FOUND
          </h1>

          <p className="mt-3 text-sm text-white/50">
            Produk tidak ditemukan atau tidak dapat diakses.
          </p>

          <Link
            href="/admin/products"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 py-3 text-xs tracking-[0.15em] transition-colors hover:border-[#0b2cb1]"
          >
            BACK TO PRODUCTS
          </Link>
        </div>
      </main>
    );
  }

  const errorMessages: Record<string, string> = {
    invalid: "Periksa kembali data produk yang kamu masukkan.",
    "image-type": "Format foto harus JPG, PNG, atau WebP.",
    "image-size": "Ukuran setiap foto maksimal 5 MB.",
    "gallery-limit": "Maksimal dua foto tambahan.",
    "gallery-order":
      "Isi slot foto galeri pertama sebelum slot foto galeri kedua.",
    upload: "Foto gagal diunggah. Periksa pengaturan Supabase Storage.",
    duplicate: "Slug produk sudah digunakan. Gunakan slug yang berbeda.",
    save: "Perubahan gagal disimpan. Periksa policy dan struktur tabel.",
  };

  const galleryImages: GalleryImage[] = Array.isArray(
    product.gallery_images,
  )
    ? product.gallery_images.filter(
        (value: unknown): value is string =>
          typeof value === "string",
      )
    : [];

  const imageSlots = [
    {
      number: "01",
      title: "Main Product Image",
      fieldName: "image",
      inputId: "image",
      currentImage: product.image_url ?? "",
      alt: `${product.name} main image`,
      description: "Foto utama yang ditampilkan pada katalog produk.",
    },
    {
      number: "02",
      title: "Gallery Image 1",
      fieldName: "gallery_image_1",
      inputId: "gallery_image_1",
      currentImage: galleryImages[0] ?? "",
      alt: `${product.name} gallery image 1`,
      description: "Foto tambahan pertama untuk detail produk.",
    },
    {
      number: "03",
      title: "Gallery Image 2",
      fieldName: "gallery_image_2",
      inputId: "gallery_image_2",
      currentImage: galleryImages[1] ?? "",
      alt: `${product.name} gallery image 2`,
      description: "Foto tambahan kedua untuk detail produk.",
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] px-4 py-6 text-white sm:px-8 sm:py-8">
      <ProductFormErrorNotice />
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-[#7290ff]">
              STILERA / MANAGEMENT
            </p>

            <h1 className="mt-3 font-display text-2xl tracking-[0.08em] sm:text-3xl">
              EDIT PRODUCT
            </h1>

            <p className="mt-2 text-sm text-white/45">
              Update product information, materials, and images.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 py-3 text-xs tracking-[0.15em] text-white/75 transition-colors hover:border-[#0b2cb1] hover:bg-[#0b2cb1]/10 hover:text-white"
          >
            CANCEL
          </Link>
        </header>

          <form
            action={updateProductAction}
            className="mt-8 space-y-6"
          >
          <input
            type="hidden"
            name="productId"
            value={product.id}
          />

          {/* Basic information */}
          <section className={sectionClass}>
            <div>
              <p className="text-[10px] tracking-[0.25em] text-[#7290ff]">
                01 / PRODUCT SETUP
              </p>

              <h2 className="mt-2 font-display text-lg tracking-[0.12em]">
                BASIC INFORMATION
              </h2>

              <p className="mt-1 text-sm text-white/45">
                Product name, URL, price, and category.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm">
                Product name *
              </label>

              <input
                id="name"
                name="name"
                required
                maxLength={150}
                defaultValue={product.name ?? ""}
                placeholder="Product name"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="block text-sm">
                URL slug
              </label>

              <input
                id="slug"
                name="slug"
                maxLength={180}
                defaultValue={product.slug ?? ""}
                placeholder="product-name"
                className={fieldClass}
              />

              <p className="text-xs leading-5 text-white/35">
                Harus unik untuk setiap produk.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <label htmlFor="price" className="block text-sm">
                  Price (IDR) *
                </label>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  required
                  defaultValue={product.price ?? 0}
                  className={fieldClass}
                />
              </div>

              <div className="min-w-0 space-y-2">
                <label htmlFor="category" className="block text-sm">
                  Category *
                </label>

                <select
                  id="category"
                  name="category"
                  required
                  defaultValue={product.category ?? "t-shirts"}
                  className={fieldClass}
                >
                  {categories.map((category) => (
                    <option
                      key={category.value}
                      value={category.value}
                    >
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="graphic" className="block text-sm">
                Design theme
              </label>

              <input
                id="graphic"
                name="graphic"
                maxLength={150}
                defaultValue={product.graphic ?? ""}
                placeholder="Gothic, butterfly, angel..."
                className={fieldClass}
              />
            </div>
          </section>

          {/* Product details */}
          <section className={sectionClass}>
            <div>
              <p className="text-[10px] tracking-[0.25em] text-[#7290ff]">
                02 / PRODUCT DETAILS
              </p>

              <h2 className="mt-2 font-display text-lg tracking-[0.12em]">
                PRODUCT DETAILS
              </h2>

              <p className="mt-1 text-sm text-white/45">
                These details appear in the product modal.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                maxLength={5000}
                defaultValue={product.description ?? ""}
                placeholder="Describe the design, silhouette, fit, and inspiration."
                className={`${fieldClass} resize-y`}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="material_care"
                className="block text-sm"
              >
                Material & Care
              </label>

              <textarea
                id="material_care"
                name="material_care"
                rows={5}
                maxLength={5000}
                defaultValue={product.material_care ?? ""}
                placeholder={
                  "Material: 100% cotton\nFabric weight: 240 GSM\nFit: Oversized\nCare: Machine wash cold, wash inside out, do not bleach."
                }
                className={`${fieldClass} resize-y`}
              />

              <p className="text-xs leading-5 text-white/40">
                Enter in English if the storefront uses English.
                Only state material specifications you have verified.
              </p>
            </div>
          </section>

          {/* Product images */}
          <section className={sectionClass}>
            <div>
              <p className="text-[10px] tracking-[0.25em] text-[#7290ff]">
                03 / PRODUCT VISUALS
              </p>

              <h2 className="mt-2 font-display text-lg tracking-[0.12em]">
                PRODUCT IMAGES
              </h2>

              <p className="mt-1 text-sm leading-6 text-white/45">
                Edit each image individually. Select one photo per slot.
                Leave a slot empty to keep its current image.
              </p>
            </div>

            <div className="space-y-4">
              {imageSlots.map((slot) => (
                <article
                  key={slot.inputId}
                  className={imageCardClass}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#0b2cb1]/60 bg-[#0b2cb1]/15 font-display text-xs text-[#9db0ff]">
                      {slot.number}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-white">
                        {slot.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-white/40">
                        {slot.description}
                      </p>
                    </div>
                  </div>

                  {slot.currentImage ? (
                    <div className="flex items-start gap-4">
                      <img
                        src={slot.currentImage}
                        alt={slot.alt}
                        className="aspect-[3/4] w-28 shrink-0 rounded-xl border border-white/10 bg-[#08090c] object-cover sm:w-36"
                      />

                      <div className="min-w-0 pt-1">
                        <p className="text-xs tracking-[0.12em] text-[#7290ff]">
                          CURRENT IMAGE
                        </p>

                        <p className="mt-2 text-xs leading-5 text-white/45">
                          Foto saat ini akan dipertahankan jika kamu tidak
                          memilih foto pengganti.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] max-w-xs items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-xs tracking-[0.15em] text-white/30">
                      NO IMAGE
                    </div>
                  )}

                  <div className="space-y-2">
                    <label
                      htmlFor={slot.inputId}
                      className="block text-sm text-white/75"
                    >
                      {slot.currentImage
                        ? "Replace image"
                        : "Upload image"}
                    </label>

                    <input
                      id={slot.inputId}
                      name={slot.fieldName}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className={fileClass}
                    />

                    <p className="text-xs leading-5 text-white/40">
                      JPG, PNG, or WebP. Maximum 5 MB per image.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Product status */}
          <section className={sectionClass}>
            <div>
              <p className="text-[10px] tracking-[0.25em] text-[#7290ff]">
                04 / VISIBILITY
              </p>

              <h2 className="mt-2 font-display text-lg tracking-[0.12em]">
                PRODUCT STATUS
              </h2>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={Boolean(product.is_active)}
                className="mt-1 size-4 shrink-0 accent-[#0b2cb1]"
              />

              <span>
                <span className="block text-sm text-white">
                  Active product
                </span>

                <span className="mt-1 block text-xs leading-5 text-white/45">
                  Produk dapat ditampilkan pada katalog publik.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
              <input
                type="checkbox"
                name="is_new_arrival"
                defaultChecked={Boolean(product.is_new_arrival)}
                className="mt-1 size-4 shrink-0 accent-[#0b2cb1]"
              />

              <span>
                <span className="block text-sm text-white">
                  New arrival
                </span>

                <span className="mt-1 block text-xs leading-5 text-white/45">
                  Tandai produk sebagai koleksi terbaru.
                </span>
              </span>
            </label>
          </section>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">
            <button
              type="submit"
              className="min-h-12 w-full rounded-full border border-[#0b2cb1] bg-[#0b2cb1] px-5 py-4 font-display text-xs tracking-[0.2em] text-white transition-colors hover:bg-[#092397] sm:flex-1"
            >
              SAVE CHANGES
            </button>

            <Link
              href="/admin/products"
              className="flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 py-4 text-xs tracking-[0.15em] text-white/75 transition-colors hover:border-[#0b2cb1] hover:bg-[#0b2cb1]/10 hover:text-white"
            >
              BACK TO PRODUCTS
            </Link>
          </div>

          <p className="pb-4 text-center text-[9px] tracking-[0.2em] text-white/25">
            STILERA · FEARLESS SOULS ONLY
          </p>
        </form>
      </div>
    </main>
  );
}

export default function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
          <p className="text-xs tracking-[0.2em] text-[#7290ff]">
            LOADING PRODUCT...
          </p>
        </main>
      }
    >
      <EditProductContent
        params={params}
        searchParams={searchParams}
      />
    </Suspense>
  );
}