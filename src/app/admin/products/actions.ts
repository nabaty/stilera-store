
"use server";


import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type DeleteProductState = {
  success: boolean;
  message: string;
  deletedProductId?: string;
};

export async function deleteProductAction(
  _previousState: DeleteProductState,
  formData: FormData,
): Promise<DeleteProductState> {
  const productId = String(formData.get("productId") ?? "").trim();

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      productId,
    )
  ) {
    return {
      success: false,
      message: "ID produk tidak valid.",
    };
  }

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

  const { data: deletedProduct, error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    console.error("STILERA delete product:", {
      code: deleteError.code,
      message: deleteError.message,
    });

    return {
      success: false,
      message: "Produk gagal dihapus. Silakan coba kembali.",
    };
  }

  if (!deletedProduct) {
    return {
      success: false,
      message:
        "Produk tidak ditemukan atau tidak dapat dihapus. Periksa izin database.",
    };
  }

  // Refresh storefront. Daftar admin akan diperbarui
  // Jangan refresh halaman sebelum popup sukses tampil.
return {
  success: true,
  message: "Produk berhasil dihapus dari katalog.",
  deletedProductId: deletedProduct.id,
};
}
