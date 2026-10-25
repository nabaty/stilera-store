
"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const ALLOWED_CATEGORIES = [
  "t-shirts",
  "tops",
  "bottoms",
  "accessories",
] as const;

function editUrl(id: string, error: string) {
  return `/admin/products/${encodeURIComponent(id)}/edit?error=${error}`;
}

function normalizeSlug(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getFilePathFromPublicUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const marker = "/storage/v1/object/public/product-images/";
    const index = parsed.pathname.indexOf(marker);

    if (index === -1) return null;

    return decodeURIComponent(
      parsed.pathname.slice(index + marker.length),
    );
  } catch {
    return null;
  }
}

function getSelectedFile(formData: FormData, name: string): File | null {
  const entry = formData.get(name);

  return entry instanceof File && entry.size > 0
    ? entry
    : null;
}

export async function updateProductAction(formData: FormData) {
  const supabase = await createClient();

  // 1. Authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  const userId = user.id;

  // 2. Authorization
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (
    profileError ||
    !profile ||
    !["owner", "staff"].includes(profile.role)
  ) {
    redirect("/admin/login?error=unauthorized");
  }

  // 3. Read product fields
  const productId = String(formData.get("productId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const rawPrice = String(formData.get("price") ?? "");
  const category = String(formData.get("category") ?? "");
  const description = String(
    formData.get("description") ?? "",
  ).trim();
  const materialCare = String(
    formData.get("material_care") ?? "",
  ).trim();
  const graphic = String(formData.get("graphic") ?? "").trim();

  const isActive = formData.get("is_active") === "on";
  const isNewArrival = formData.get("is_new_arrival") === "on";
  const price = Number(rawPrice);
  const slug = normalizeSlug(rawSlug || name);

  if (
    !productId ||
    productId.length > 100 ||
    !name ||
    name.length > 150 ||
    !slug ||
    slug.length > 180 ||
    !ALLOWED_CATEGORIES.includes(
      category as (typeof ALLOWED_CATEGORIES)[number],
    ) ||
    rawPrice.trim() === "" ||
    !Number.isSafeInteger(price) ||
    price < 0 ||
    description.length > 5000 ||
    materialCare.length > 5000 ||
    graphic.length > 150
  ) {
    redirect(editUrl(productId, "invalid"));
  }

  // 4. Load the existing product
  const { data: existingProduct, error: existingError } =
    await supabase
      .from("products")
      .select("id, image_url, gallery_images")
      .eq("id", productId)
      .maybeSingle();

  if (existingError || !existingProduct) {
    redirect("/admin/products?error=not-found");
  }

  // 5. Read each image input independently
  const mainFile = getSelectedFile(formData, "image");
  const gallery1File = getSelectedFile(
    formData,
    "gallery_image_1",
  );
  const gallery2File = getSelectedFile(
    formData,
    "gallery_image_2",
  );

  const selectedFiles = [
    mainFile,
    gallery1File,
    gallery2File,
  ].filter((file): file is File => file !== null);

  // Validate all selected files before uploading
  for (const file of selectedFiles) {
    if (
      !Object.prototype.hasOwnProperty.call(
        ALLOWED_IMAGE_TYPES,
        file.type,
      )
    ) {
      redirect(editUrl(productId, "image-type"));
    }

    if (file.size > MAX_IMAGE_SIZE) {
      redirect(editUrl(productId, "image-size"));
    }
  }

  const oldImageUrl = existingProduct.image_url ?? "";

  const oldGalleryImages: string[] = Array.isArray(
    existingProduct.gallery_images,
  )
    ? existingProduct.gallery_images.filter(
        (value: unknown): value is string =>
          typeof value === "string" && value.length > 0,
      )
    : [];

  // Do not allow gallery slot 2 to exist without slot 1.
  if (
    gallery2File &&
    !gallery1File &&
    !oldGalleryImages[0]
  ) {
    redirect(editUrl(productId, "gallery-order"));
  }

  let imageUrl = oldImageUrl;
  const galleryImages = [...oldGalleryImages];

  const uploadedPaths: string[] = [];
  const replacedUrls: string[] = [];

  // 6. Upload an individual image to Supabase Storage
  async function uploadImage(file: File): Promise<string> {
    const extension = ALLOWED_IMAGE_TYPES[file.type];
    const filePath = `${userId}/${randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    uploadedPaths.push(filePath);

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // 7. Replace only the images selected by the admin
  try {
    if (mainFile) {
      imageUrl = await uploadImage(mainFile);

      if (oldImageUrl) {
        replacedUrls.push(oldImageUrl);
      }
    }

    if (gallery1File) {
      const oldUrl = oldGalleryImages[0];

      galleryImages[0] = await uploadImage(gallery1File);

      if (oldUrl) {
        replacedUrls.push(oldUrl);
      }
    }

    if (gallery2File) {
      const oldUrl = oldGalleryImages[1];

      galleryImages[1] = await uploadImage(gallery2File);

      if (oldUrl) {
        replacedUrls.push(oldUrl);
      }
    }
  } catch (error) {
    console.error("STILERA edit image upload:", error);

    if (uploadedPaths.length > 0) {
      const { error: cleanupError } = await supabase.storage
        .from("product-images")
        .remove(uploadedPaths);

      if (cleanupError) {
        console.error(
          "STILERA upload cleanup:",
          cleanupError.message,
        );
      }
    }

    redirect(editUrl(productId, "upload"));
  }

  // 8. Save product data
  const { error: updateError } = await supabase
    .from("products")
    .update({
      name,
      slug,
      price,
      category,
      description,
      material_care: materialCare,
      graphic,
      image_url: imageUrl,
      gallery_images: galleryImages,
      is_active: isActive,
      is_new_arrival: isNewArrival,
    })
    .eq("id", productId);

  if (updateError) {
    console.error(
      "STILERA update product:",
      updateError.code,
      updateError.message,
    );

    // Remove newly uploaded files if saving the record fails.
    if (uploadedPaths.length > 0) {
      const { error: cleanupError } = await supabase.storage
        .from("product-images")
        .remove(uploadedPaths);

      if (cleanupError) {
        console.error(
          "STILERA update cleanup:",
          cleanupError.message,
        );
      }
    }

    redirect(
      updateError.code === "23505"
        ? editUrl(productId, "duplicate")
        : editUrl(productId, "save"),
    );
  }

  // 9. Delete replaced images only after a successful database update.
  const pathsToRemove = [
    ...new Set(
      replacedUrls
        .map(getFilePathFromPublicUrl)
        .filter((path): path is string => Boolean(path)),
    ),
  ];

  if (pathsToRemove.length > 0) {
    const { error: removeError } = await supabase.storage
      .from("product-images")
      .remove(pathsToRemove);

    if (removeError) {
      console.error(
        "STILERA replaced-image cleanup:",
        removeError.message,
      );
    }
  }

  // 10. Refresh pages and return to the catalog
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath(`/admin/products/${productId}/edit`);

  redirect("/admin/products?success=updated");
}
