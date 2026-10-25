
"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type UploadedImage = {
  path: string;
  publicUrl: string;
};

async function uploadImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
): Promise<UploadedImage> {
  const extension = ALLOWED_IMAGE_TYPES[file.type];

  if (!extension) {
    throw new Error("INVALID_IMAGE_TYPE");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("IMAGE_TOO_LARGE");
  }

  const path = `${userId}/${randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("STILERA image upload:", error.message);
    throw new Error("UPLOAD_FAILED");
  }

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
  };
}

async function removeUploadedImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paths: string[],
) {
  if (paths.length === 0) return;

  const { error } = await supabase.storage
    .from("product-images")
    .remove(paths);

  if (error) {
    console.error("STILERA image cleanup:", error.message);
  }
}

export async function createProductAction(formData: FormData) {
  const supabase = await createClient();

  // 1. Verify authentication.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // 2. Verify admin role.
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

  // 3. Read product information.
  const name = String(formData.get("name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const rawPrice = String(formData.get("price") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(
    formData.get("description") ?? "",
  ).trim();
  const materialCare = String(
    formData.get("material_care") ?? "",
  ).trim();
  const graphic = String(formData.get("graphic") ?? "").trim();

  const isActive = formData.get("is_active") === "true";
  const isNewArrival =
  formData.get("is_new_arrival") === "on";

  const price = Number(rawPrice);

  const slug = (rawSlug || name)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const allowedCategories = [
    "t-shirts",
    "tops",
    "bottoms",
    "accessories",
  ];

  if (
    !name ||
    name.length > 150 ||
    !slug ||
    slug.length > 180 ||
    !allowedCategories.includes(category) ||
    rawPrice === "" ||
    !Number.isSafeInteger(price) ||
    price < 0 ||
    description.length > 5000 ||
    materialCare.length > 5000 ||
    graphic.length > 150
  ) {
    redirect("/admin/products/new?error=invalid");
  }

  // 4. Read the three independent image inputs.
  const mainImageEntry = formData.get("image");
  const galleryImage1Entry = formData.get("gallery_image_1");
  const galleryImage2Entry = formData.get("gallery_image_2");

  if (
    !(mainImageEntry instanceof File) ||
    mainImageEntry.size === 0
  ) {
    redirect("/admin/products/new?error=main-image-required");
  }

  const imageEntries = [
    mainImageEntry,
    galleryImage1Entry,
    galleryImage2Entry,
  ];

  // Validate every selected image before uploading anything.
  for (const entry of imageEntries) {
    if (!(entry instanceof File) || entry.size === 0) {
      continue;
    }

    if (!Object.hasOwn(ALLOWED_IMAGE_TYPES, entry.type)) {
      redirect("/admin/products/new?error=image-type");
    }

    if (entry.size > MAX_IMAGE_SIZE) {
      redirect("/admin/products/new?error=image-size");
    }
  }

  // 5. Upload images. The first image is the main image.
  const uploadedPaths: string[] = [];

  let mainImage: UploadedImage;
  const galleryImages: string[] = [];

  try {
    mainImage = await uploadImage(
      supabase,
      user.id,
      mainImageEntry,
    );

    uploadedPaths.push(mainImage.path);

    if (
      galleryImage1Entry instanceof File &&
      galleryImage1Entry.size > 0
    ) {
      const image = await uploadImage(
        supabase,
        user.id,
        galleryImage1Entry,
      );

      uploadedPaths.push(image.path);
      galleryImages.push(image.publicUrl);
    }

    if (
      galleryImage2Entry instanceof File &&
      galleryImage2Entry.size > 0
    ) {
      const image = await uploadImage(
        supabase,
        user.id,
        galleryImage2Entry,
      );

      uploadedPaths.push(image.path);
      galleryImages.push(image.publicUrl);
    }
  } catch (error) {
    await removeUploadedImages(supabase, uploadedPaths);

    const reason =
      error instanceof Error ? error.message : "UPLOAD_FAILED";

    if (reason === "INVALID_IMAGE_TYPE") {
      redirect("/admin/products/new?error=image-type");
    }

    if (reason === "IMAGE_TOO_LARGE") {
      redirect("/admin/products/new?error=image-size");
    }

    redirect("/admin/products/new?error=upload");
  }

  // 6. Save product data to Supabase.
  // gallery_images contains only the additional image URLs.
  const { error: insertError } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      price,
      category,
      description,
      material_care: materialCare,
      graphic,
      image_url: mainImage.publicUrl,
      gallery_images: galleryImages,
      is_active: isActive,
      is_new_arrival: isNewArrival,
    });

  if (insertError) {
    console.error(
      "STILERA create product:",
      insertError.code,
      insertError.message,
    );

    await removeUploadedImages(supabase, uploadedPaths);

    if (insertError.code === "23505") {
      redirect("/admin/products/new?error=duplicate");
    }

    redirect("/admin/products/new?error=save");
  }

  // 7. Refresh admin and storefront data.
  revalidatePath("/admin/products");
  revalidatePath("/");

  redirect("/admin/products?success=created");
}
