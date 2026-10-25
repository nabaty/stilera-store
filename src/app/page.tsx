
import { Suspense } from "react";
import { connection } from "next/server";

import { Catalog } from "@/components/catalog";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";
import { ProductModal } from "@/components/product-modal";
import { ShoppingBag } from "@/components/shopping-bag";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/data/products";

async function HomeContent() {
  await connection();

  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("products")
    .select(
      "id, name, price, category, image_url, gallery_images, graphic, description, material_care, is_new_arrival",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("STILERA public catalog:", error.message);
  }

  const allowedCategories: Product["category"][] = [
    "t-shirts",
    "tops",
    "bottoms",
    "accessories",
  ];

  const products: Product[] = (rows ?? [])
    .filter(
      (item) =>
        typeof item.name === "string" &&
        allowedCategories.includes(
          item.category as Product["category"],
        ),
    )
    .map((item) => ({
      id: String(item.id),
      name: item.name,
      price: Number(item.price ?? 0),
      category: item.category as Product["category"],
      image: item.image_url ?? "",
      galleryImages: Array.isArray(item.gallery_images)
        ? item.gallery_images.filter(
            (url): url is string => typeof url === "string",
          )
        : [],
      graphic: item.graphic ?? "",
      description: item.description ?? "",
      materialCare: item.material_care ?? "",
      isNewArrival: item.is_new_arrival === true,
    }));

  const newArrivalProducts = products.filter(
    (product) => product.isNewArrival === true,
  );

  return (
    <div className="relative isolate min-h-screen bg-[#050505]">
      <div className="relative z-10">
        <Navbar />

        <main>
          <Hero products={newArrivalProducts} />
          <Catalog products={products} />
        </main>

        <SiteFooter />
        <ShoppingBag />
        <ProductModal />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
          Loading STILERA...
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
