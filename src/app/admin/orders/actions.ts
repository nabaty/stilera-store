
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_STATUSES = [
  "pending",
  "pending_confirmation",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;

const ALLOWED_COURIERS = ["jne-reg", "jnt-reg", "pos-reg"] as const;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getAuthorizedSupabase() {
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

  return supabase;
}

export async function updateOrderStatusAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!UUID_PATTERN.test(orderId)) {
    throw new Error("ID pesanan tidak valid.");
  }

  if (
    !ALLOWED_STATUSES.includes(
      status as (typeof ALLOWED_STATUSES)[number],
    )
  ) {
    throw new Error("Status pesanan tidak valid.");
  }

  const supabase = await getAuthorizedSupabase();

  const { data: updatedOrder, error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select("id, status")
    .maybeSingle();

  if (error) {
    console.error("STILERA update order status:", {
      code: error.code,
      message: error.message,
    });

    throw new Error(
      "Status gagal disimpan. Periksa policy UPDATE pada tabel orders.",
    );
  }

  if (!updatedOrder) {
    throw new Error(
      "Pesanan tidak diperbarui. Periksa ID pesanan dan policy RLS Supabase.",
    );
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function updateOrderShippingAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "").trim();
  const courier = String(formData.get("courier") ?? "").trim();
  const shippingFeeText = String(
    formData.get("shippingFee") ?? "",
  ).trim();
  const trackingNumber = String(
    formData.get("trackingNumber") ?? "",
  ).trim();

  if (!UUID_PATTERN.test(orderId)) {
    throw new Error("ID pesanan tidak valid.");
  }

  if (
    !ALLOWED_COURIERS.includes(
      courier as (typeof ALLOWED_COURIERS)[number],
    )
  ) {
    throw new Error("Pilihan kurir tidak valid.");
  }

  if (
    shippingFeeText === "" ||
    !/^\d+$/.test(shippingFeeText)
  ) {
    throw new Error("Ongkir wajib diisi dengan angka rupiah yang valid.");
  }

  const shippingFee = Number(shippingFeeText);

  if (
    !Number.isSafeInteger(shippingFee) ||
    shippingFee < 0 ||
    shippingFee > 100_000_000
  ) {
    throw new Error("Ongkir harus antara Rp0 dan Rp100.000.000.");
  }

  if (
    trackingNumber.length > 100 ||
    /[\r\n<>]/.test(trackingNumber)
  ) {
    throw new Error("Nomor resi tidak valid.");
  }

  const supabase = await getAuthorizedSupabase();

  // Ambil subtotal langsung dari database.
  // Jangan mempercayai harga yang dikirim browser.
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, subtotal")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchError) {
    console.error("STILERA fetch order:", {
      code: fetchError.code,
      message: fetchError.message,
    });

    throw new Error("Gagal membaca data pesanan.");
  }

  if (!order) {
    throw new Error(
      "Pesanan tidak ditemukan atau tidak dapat diakses.",
    );
  }

  const subtotal = Number(order.subtotal);

  if (
    !Number.isSafeInteger(subtotal) ||
    subtotal < 0
  ) {
    throw new Error("Subtotal pesanan tidak valid.");
  }

  const total = subtotal + shippingFee;

  if (!Number.isSafeInteger(total)) {
    throw new Error("Total pesanan melebihi batas yang diizinkan.");
  }

  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      courier,
      shipping_fee: shippingFee,
      total,
      tracking_number: trackingNumber || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select("id, courier, shipping_fee, total, tracking_number")
    .maybeSingle();

  if (updateError) {
    console.error("STILERA update order shipping:", {
      code: updateError.code,
      message: updateError.message,
    });

    throw new Error(
      "Pengiriman gagal disimpan. Periksa struktur kolom dan policy UPDATE Supabase.",
    );
  }

  if (!updatedOrder) {
    throw new Error(
      "Data pengiriman tidak diperbarui. Periksa ID pesanan dan policy RLS Supabase.",
    );
  }

  console.info("STILERA shipping updated:", {
    orderId: updatedOrder.id,
    courier: updatedOrder.courier,
    shippingFee: updatedOrder.shipping_fee,
    total: updatedOrder.total,
    hasTrackingNumber: Boolean(updatedOrder.tracking_number),
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
