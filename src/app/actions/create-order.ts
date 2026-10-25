
"use server";

import { createAdminClient } from "@/lib/supabase/admin";

type CheckoutItem = {
  productId: string;
  size: string;
  quantity: number;
};

type CheckoutPayload = {
  name: string;
  phone: string;
  province: string;
  city: string;
  postal: string;
  address: string;
  notes?: string;
  courier: string;
  items: CheckoutItem[];
};

type SavedOrderItem = {
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type CreateOrderResult =
  | {
      success: true;
      orderId: string;
      subtotal: number;
      items: SavedOrderItem[];
    }
  | {
      success: false;
      error: string;
    };

export async function createOrderAction(
  input: CheckoutPayload,
): Promise<CreateOrderResult> {
  try {
    if (!input || typeof input !== "object") {
      return {
        success: false,
        error: "Data checkout tidak valid.",
      };
    }

    const name = input.name?.trim();
    const phone = input.phone?.trim();
    const province = input.province?.trim();
    const city = input.city?.trim();
    const postal = input.postal?.trim();
    const address = input.address?.trim();
    const notes = input.notes?.trim() ?? "";
    const courier = input.courier;

    const normalizedPhone = phone?.replace(/[\s()-]/g, "") ?? "";

    if (
      !name ||
      name.length > 100 ||
      !/^\+?[0-9]{9,16}$/.test(normalizedPhone) ||
      !province ||
      province.length > 100 ||
      !city ||
      city.length > 100 ||
      !/^[0-9]{5}$/.test(postal ?? "") ||
      !address ||
      address.length < 10 ||
      address.length > 1000 ||
      notes.length > 500 ||
      !["jne-reg", "jnt-reg", "pos-reg"].includes(courier)
    ) {
      return {
        success: false,
        error: "Periksa kembali data penerima dan pengiriman.",
      };
    }

    if (
      !Array.isArray(input.items) ||
      input.items.length < 1 ||
      input.items.length > 50
    ) {
      return {
        success: false,
        error: "Item pesanan tidak valid.",
      };
    }

    const items = input.items.map((item) => {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !item.productId.trim() ||
        item.productId.length > 100 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100
      ) {
        throw new Error("INVALID_ITEMS");
      }

      return {
        product_id: item.productId.trim(),
        size: "ALL SIZE",
        quantity: item.quantity,
      };
    });

    const supabase = createAdminClient();

    // Harga dan nama produk ditentukan oleh database.
    // Pesanan beserta item disimpan melalui satu fungsi SQL.
    const { data: orderId, error: createError } =
      await supabase.rpc("create_stilera_order", {
        p_customer_name: name,
        p_phone: normalizedPhone,
        p_province: province,
        p_city: city,
        p_postal_code: postal,
        p_address: address,
        p_notes: notes,
        p_courier: courier,
        p_items: items,
      });

    if (createError || !orderId) {
      console.error(
        "STILERA order creation failed:",
        createError?.code ?? "NO_ORDER_ID",
        createError?.message ?? "No order ID returned",
      );

      return {
        success: false,
        error:
          "Pesanan gagal disimpan. Periksa konfigurasi database atau hubungi admin sebelum mencoba lagi.",
      };
    }

    // Ambil subtotal dari pesanan yang tersimpan.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("subtotal")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error(
        "STILERA order summary read failed:",
        orderError?.code ?? "NO_ORDER_SUMMARY",
        orderError?.message ?? "",
      );

      return {
        success: false,
        error:
          "Pesanan mungkin sudah tersimpan, tetapi ringkasannya gagal dibaca. Hubungi admin sebelum checkout ulang.",
      };
    }

    // Ambil snapshot nama, ukuran, dan harga item.
    const { data: savedItems, error: itemsError } = await supabase
      .from("order_items")
      .select(
        "product_name, size, quantity, unit_price, line_total",
      )
      .eq("order_id", orderId);

    if (itemsError || !savedItems || savedItems.length === 0) {
      console.error(
        "STILERA order items read failed:",
        itemsError?.code ?? "NO_ORDER_ITEMS",
        itemsError?.message ?? "",
      );

      return {
        success: false,
        error:
          "Pesanan mungkin sudah tersimpan, tetapi detailnya gagal dibaca. Hubungi admin sebelum checkout ulang.",
      };
    }

    return {
      success: true,
      orderId: String(orderId),
      subtotal: Number(order.subtotal),
      items: savedItems.map((item) => ({
        product_name: item.product_name,
        size: item.size,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        line_total: Number(item.line_total),
      })),
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ITEMS"
    ) {
      return {
        success: false,
        error: "Periksa kembali produk dan jumlah pesanan.",
      };
    }

    console.error("STILERA checkout failed:", error);

    return {
      success: false,
      error: "Terjadi kesalahan saat menyimpan pesanan.",
    };
  }
}
