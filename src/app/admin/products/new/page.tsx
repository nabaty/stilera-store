
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createProductAction } from "./actions";
import ProductFormErrorNotice from "../product-form-error-notice";

async function NewProductForm() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["owner", "staff"].includes(profile.role)) {
    redirect("/admin/login?error=unauthorized");
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-8">
      <ProductFormErrorNotice />
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-7">
          <div>
            <p className="text-[10px] tracking-[0.35em] text-[#8da5ff]">
              STILERA / MANAGEMENT
            </p>
            <h1 className="mt-3 font-display text-3xl tracking-[0.1em] sm:text-4xl">
              ADD PRODUCT
            </h1>
            <p className="mt-3 text-sm text-white/45">
              Create a product for your STILERA collection.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 py-3 text-xs tracking-[0.12em] text-white/75 transition-colors hover:border-[#4169ff] hover:text-white"
          >
            CANCEL
          </Link>
        </header>

        <form
          action={createProductAction}
          className="mt-8 space-y-8"
        >
          {/* 01: Basic information */}
          <section className="rounded-3xl border border-white/10 bg-[#090b10] p-5 sm:p-7">
            <div className="mb-6">
              <p className="text-[10px] tracking-[0.25em] text-[#8da5ff]">
                01 / PRODUCT INFORMATION
              </p>
              <h2 className="mt-2 font-display text-xl tracking-[0.08em]">
                BASIC DETAILS
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm text-white/75">
                  Product name *
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  maxLength={150}
                  placeholder="Butterfly Oversized Tee"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-white/25 focus:border-[#4169ff]"
                />
              </div>

              <div>
                <label htmlFor="slug" className="mb-2 block text-sm text-white/75">
                  URL slug
                </label>
                <input
                  id="slug"
                  name="slug"
                  maxLength={180}
                  placeholder="butterfly-oversized-tee"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-white/25 focus:border-[#4169ff]"
                />
                <p className="mt-2 text-xs text-white/35">
                  Leave blank to generate the slug automatically.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="price" className="mb-2 block text-sm text-white/75">
                    Price (IDR) *
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="230000"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-white/25 focus:border-[#4169ff]"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="mb-2 block text-sm text-white/75">
                    Collection category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    defaultValue=""
                    className="w-full rounded-2xl border border-white/10 bg-[#090b10] px-4 py-3.5 text-sm outline-none focus:border-[#4169ff]"
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    <option value="t-shirts">T-Shirts</option>
                    <option value="tops">Tops</option>
                    <option value="bottoms">Bottoms</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="graphic" className="mb-2 block text-sm text-white/75">
                  Design theme
                </label>
                <input
                  id="graphic"
                  name="graphic"
                  maxLength={150}
                  placeholder="Gothic butterfly"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-white/25 focus:border-[#4169ff]"
                />
              </div>
            </div>
          </section>

          {/* 02: Product gallery */}
          <section className="rounded-3xl border border-white/10 bg-[#090b10] p-5 sm:p-7">
            <div className="mb-6">
              <p className="text-[10px] tracking-[0.25em] text-[#8da5ff]">
                02 / PRODUCT VISUALS
              </p>
              <h2 className="mt-2 font-display text-xl tracking-[0.08em]">
                PRODUCT GALLERY
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/45">
                Upload up to three product photos. Each image has its own
                upload field for easier selection on mobile devices.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="image" className="mb-2 block text-sm text-white/75">
                  Main product image *
                </label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  className="block w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-[#0b2cb1] file:px-4 file:py-2 file:text-xs file:text-white hover:file:bg-[#163cc9]"
                />
                <p className="mt-2 text-xs text-white/35">
                  This will be the main product image.
                </p>
              </div>

              <div>
                <label
                  htmlFor="gallery_image_1"
                  className="mb-2 block text-sm text-white/75"
                >
                  Gallery image 2 (optional)
                </label>
                <input
                  id="gallery_image_1"
                  name="gallery_image_1"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="block w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-[#0b2cb1] file:px-4 file:py-2 file:text-xs file:text-white hover:file:bg-[#163cc9]"
                />
              </div>

              <div>
                <label
                  htmlFor="gallery_image_2"
                  className="mb-2 block text-sm text-white/75"
                >
                  Gallery image 3 (optional)
                </label>
                <input
                  id="gallery_image_2"
                  name="gallery_image_2"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="block w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-[#0b2cb1] file:px-4 file:py-2 file:text-xs file:text-white hover:file:bg-[#163cc9]"
                />
              </div>

              <p className="text-xs leading-5 text-white/40">
                JPG, PNG or WebP. Maximum 5 MB per image. The main image is
                required; the two gallery images are optional.
              </p>
            </div>
          </section>

          {/* 03: Description and materials */}
          <section className="rounded-3xl border border-white/10 bg-[#090b10] p-5 sm:p-7">
            <div className="mb-6">
              <p className="text-[10px] tracking-[0.25em] text-[#8da5ff]">
                03 / PRODUCT DETAILS
              </p>
              <h2 className="mt-2 font-display text-xl tracking-[0.08em]">
                DESCRIPTION & MATERIAL
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm text-white/75"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  maxLength={5000}
                  placeholder="Describe the fit, graphic, silhouette and overall design in English."
                  className="w-full resize-y rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm leading-6 outline-none transition-colors placeholder:text-white/25 focus:border-[#4169ff]"
                />
              </div>

              <div>
                <label
                  htmlFor="material_care"
                  className="mb-2 block text-sm text-white/75"
                >
                  Material & Care
                </label>
                <textarea
                  id="material_care"
                  name="material_care"
                  rows={5}
                  maxLength={5000}
                  placeholder={"Material: 100% cotton\nFit: Oversized\nCare: Machine wash cold, wash inside out, do not bleach."}
                  className="w-full resize-y rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm leading-6 outline-none transition-colors placeholder:text-white/25 focus:border-[#4169ff]"
                />
                <p className="mt-2 text-xs text-white/35">
                  Enter the actual material composition and care instructions.
                  This information appears in the product detail modal.
                </p>
              </div>
            </div>
          </section>

          {/* 04: Publishing settings */}
          <section className="rounded-3xl border border-white/10 bg-[#090b10] p-5 sm:p-7">
            <div className="mb-6">
              <p className="text-[10px] tracking-[0.25em] text-[#8da5ff]">
                04 / PUBLISHING
              </p>
              <h2 className="mt-2 font-display text-xl tracking-[0.08em]">
                PRODUCT STATUS
              </h2>
            </div>

            <div className="space-y-4">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <span>
                  <span className="block text-sm text-white">
                    Active product
                  </span>
                  <span className="mt-1 block text-xs text-white/40">
                    Make this product visible in the store.
                  </span>
                </span>
                <input
                  type="checkbox"
                  name="is_active"
                  value="true"
                  defaultChecked
                  className="h-4 w-4 accent-[#4169ff]"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <span>
                  <span className="block text-sm text-white">
                    New Arrival
                  </span>
                  <span className="mt-1 block text-xs text-white/40">
                    Feature this product in the New Arrivals collection.
                  </span>
                </span>
                <input
                  type="checkbox"
                  name="is_new_arrival"
                  defaultChecked={false}
                  className="h-4 w-4 accent-[#4169ff]"
                />
              </label>
            </div>
          </section>

          {/* Submit */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/products"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 py-3 text-xs tracking-[0.15em] text-white/70 transition-colors hover:border-white/35 hover:text-white"
            >
              CANCEL
            </Link>

            <button
              type="submit"
              className="min-h-12 rounded-full border border-[#0b2cb1] bg-[#0b2cb1] px-8 py-3 font-display text-xs tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#163cc9] hover:shadow-[0_0_24px_rgba(11,44,177,0.25)] active:scale-[0.98]"
            >
              SAVE PRODUCT
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function NewProductPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
          Loading form...
        </main>
      }
    >
      <NewProductForm />
    </Suspense>
  );
}
