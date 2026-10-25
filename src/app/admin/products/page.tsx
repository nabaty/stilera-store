
import DeleteProductButton from "./DeleteProductButton";
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductActionNotice from "./product-action-notice";

async function AdminProductsContent() {
  await connection();

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

  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, price, category, is_active, image_url, gallery_images, is_new_arrival",
    )
    .order("created_at", { ascending: false });

  const productList = products ?? [];
  const activeCount = productList.filter(
    (product) => product.is_active,
  ).length;
  const newArrivalCount = productList.filter(
    (product) => product.is_new_arrival,
  ).length;

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] tracking-[0.35em] text-[#8da5ff]">
              STILERA / MANAGEMENT
            </p>

            <h1 className="mt-3 font-display text-3xl tracking-[0.1em] sm:text-4xl">
              PRODUCT CATALOG
            </h1>

            <p className="mt-3 text-sm text-white/45">
              Manage products, gallery images and collections.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 py-3 text-center text-[10px] tracking-[0.12em] text-white/75 transition-colors hover:border-[#4169ff] hover:text-white"
            >
              BACK TO DASHBOARD
            </Link>

            <Link
              href="/admin/products/new"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#0b2cb1] bg-[#0b2cb1] px-5 py-3 text-center text-[10px] tracking-[0.12em] text-white transition-colors hover:bg-[#163cc9]"
            >
              + ADD PRODUCT
            </Link>
          </div>
        </header>

        {/* Summary */}
        {!error && (
          <section
            aria-label="Product statistics"
            className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            <div className="rounded-2xl border border-white/10 bg-[#090b10] p-5">
              <p className="text-[10px] tracking-[0.2em] text-white/45">
                TOTAL PRODUCTS
              </p>
              <p className="mt-3 font-display text-3xl text-white">
                {productList.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#090b10] p-5">
              <p className="text-[10px] tracking-[0.2em] text-white/45">
                ACTIVE PRODUCTS
              </p>
              <p className="mt-3 font-display text-3xl text-[#8da5ff]">
                {activeCount}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#090b10] p-5">
              <p className="text-[10px] tracking-[0.2em] text-white/45">
                NEW ARRIVALS
              </p>
              <p className="mt-3 font-display text-3xl text-[#8da5ff]">
                {newArrivalCount}
              </p>
            </div>
          </section>
        )}

        {/* Product list */}
        <section className="mt-8">
          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-5">
              <p className="text-sm text-red-200">
                Failed to load products.
              </p>
              <p className="mt-2 text-xs leading-6 text-white/50">
                Check the products table columns and the SELECT
                permissions for the current admin.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg tracking-[0.12em]">
                  ALL PRODUCTS
                </h2>

                <p className="text-xs text-white/45">
                  {productList.length} products found
                </p>
              </div>

              {productList.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
                  <p className="font-display text-lg tracking-[0.12em]">
                    NO PRODUCTS YET
                  </p>

                  <p className="mt-3 text-sm text-white/45">
                    Add your first product to start building the
                    STILERA catalog.
                  </p>

                  <Link
                    href="/admin/products/new"
                    className="mt-6 inline-flex rounded-full border border-[#0b2cb1] bg-[#0b2cb1] px-6 py-3 text-xs tracking-[0.12em] transition-colors hover:bg-[#163cc9]"
                  >
                    CREATE PRODUCT
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {productList.map((product) => {
                    const galleryCount = Array.isArray(
                      product.gallery_images,
                    )
                      ? new Set(
                          [
                            product.image_url,
                            ...product.gallery_images,
                          ].filter(
                            (image): image is string =>
                              typeof image === "string" &&
                              image.trim().length > 0,
                          ),
                        ).size
                      : product.image_url
                        ? 1
                        : 0;

                    return (
                      <article
                        key={product.id}
                        className="group overflow-hidden rounded-3xl border border-white/10 bg-[#08090c] transition-colors duration-300 hover:border-[#4169ff]/50"
                      >
                        {/* Product image */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-[#101216]">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name ?? "STILERA product"}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs tracking-[0.2em] text-white/35">
                              NO IMAGE
                            </div>
                          )}

                          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

                          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                            <span
                              className={`rounded-full border px-3 py-1 text-[9px] tracking-[0.12em] ${
                                product.is_active
                                  ? "border-[#4169ff]/40 bg-[#0b2cb1]/80 text-white"
                                  : "border-white/15 bg-black/70 text-white/60"
                              }`}
                            >
                              {product.is_active ? "ACTIVE" : "INACTIVE"}
                            </span>

                            {product.is_new_arrival && (
                              <span className="rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[9px] tracking-[0.12em] text-white">
                                NEW
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                            <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[9px] uppercase tracking-[0.12em] text-white/80">
                              {product.category ?? "Uncategorized"}
                            </span>

                            <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[9px] text-white/75">
                              {galleryCount}/3 IMAGES
                            </span>
                          </div>
                        </div>

                        {/* Product information */}
                        <div className="p-4">
                          <h3 className="line-clamp-2 min-h-12 font-display text-base leading-6 tracking-[0.04em] text-white">
                            {product.name ?? "Untitled product"}
                          </h3>

                          <p className="mt-2 font-display text-sm text-[#8da5ff]">
                            Rp
                            {Number(product.price ?? 0).toLocaleString(
                              "id-ID",
                            )}
                          </p>

                          <p className="mt-2 truncate text-[10px] text-white/35">
                            SLUG: {product.slug || "Not set"}
                          </p>

                          {/* Actions */}
                          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 px-3 py-2 text-[10px] tracking-[0.12em] transition-colors hover:border-[#4169ff] hover:bg-[#0b2cb1]/15"
                            >
                              EDIT PRODUCT
                            </Link>

                            <DeleteProductButton
                              productId={product.id}
                            />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
          Loading products...
        </main>
      }
    >
      <ProductActionNotice />
      <AdminProductsContent />
    </Suspense>
  );
}
