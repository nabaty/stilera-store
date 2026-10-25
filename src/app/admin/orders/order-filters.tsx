"use client";

import { useMemo, useState } from "react";

import {

  updateOrderStatusAction,

  updateOrderShippingAction,

} from "./actions";

export type AdminOrder = {

  id: string;

  customer_name: string | null;

  phone: string | null;

  province: string | null;

  city: string | null;

  postal_code: string | null;

  address: string | null;

  notes: string | null;

  courier: string | null;

  tracking_number: string | null;

  subtotal: number | string | null;

  shipping_fee: number | string | null;

  total: number | string | null;

  status: string | null;

  created_at: string;

  updated_at: string | null;

};

export type AdminOrderItem = {

  id: string;

  order_id: string;

  product_id: string | null;

  product_name: string | null;

  size: string | null;

  quantity: number;

  unit_price: number | string | null;

  line_total: number | string | null;

};

type Props = {

  orders: AdminOrder[];

  items: AdminOrderItem[];

};

const STATUS_OPTIONS = [

  { value: "pending", label: "Menunggu konfirmasi" },

  { value: "processing", label: "Diproses" },

  { value: "shipped", label: "Dikirim" },

  { value: "completed", label: "Selesai" },

  { value: "cancelled", label: "Dibatalkan" },

] as const;

const STATUS_LABELS: Record<string, string> = {

  pending: "Menunggu konfirmasi",

  pending_confirmation: "Menunggu konfirmasi",

  processing: "Diproses",

  shipped: "Dikirim",

  completed: "Selesai",

  cancelled: "Dibatalkan",

};

const STATUS_STYLES: Record<string, string> = {

  pending: "border-amber-400/30 bg-amber-400/10 text-amber-200",

  pending_confirmation:

    "border-amber-400/30 bg-amber-400/10 text-amber-200",

  processing: "border-blue-400/30 bg-blue-400/10 text-blue-200",

  shipped: "border-violet-400/30 bg-violet-400/10 text-violet-200",

  completed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",

  cancelled: "border-red-400/30 bg-red-400/10 text-red-200",

};

const INPUT_CLASS =

  "w-full min-w-0 rounded-full border border-white/15 bg-[#080808] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#0b2cb1]";

const BUTTON_CLASS =

  "inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-xs tracking-[0.12em] transition-colors hover:border-[#0b2cb1] hover:text-[#0b2cb1]";

function rupiah(value: number | string | null | undefined) {

  const amount = Number(value ?? 0);

  return `Rp${(Number.isFinite(amount) ? amount : 0).toLocaleString(

    "id-ID",

  )}`;

}

function formatDate(value: string) {

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {

    return "-";

  }

  return new Intl.DateTimeFormat("id-ID", {

    dateStyle: "medium",

    timeStyle: "short",

    timeZone: "Asia/Jakarta",

  }).format(date);

}

function normalizeStatus(status: string | null) {

  if (status === "pending_confirmation" || !status) {

    return "pending";

  }

  return STATUS_OPTIONS.some((option) => option.value === status)

    ? status

    : "pending";

}

function courierLabel(courier: string | null) {

  const labels: Record<string, string> = {

    "jne-reg": "JNE REG",

    "jnt-reg": "J&T REG",

    "pos-reg": "POS Indonesia",

  };

  if (!courier) return "Belum dipilih";

  return labels[courier] ?? courier.toUpperCase();

}

function trackingWhatsappLink(phone: string | null, order: AdminOrder) {
  let number = (phone ?? "").replace(/\D/g, "");

  if (number.startsWith("0")) {
    number = `62${number.slice(1)}`;
  }

  if (!number || !order.tracking_number?.trim()) return null;

  // Resi hanya boleh dikirim setelah admin menandai pesanan sebagai dikirim.
  if (order.status !== "shipped") return null;

  const message = [
    `Halo ${order.customer_name ?? "Kak"},`,
    "Pesanan STILERA kamu sudah diserahkan kepada kurir. Berikut informasi pengirimannya:",
    "",
    `Nomor pesanan: ${order.id}`,
    `Kurir: ${courierLabel(order.courier)}`,
    `Nomor resi: ${order.tracking_number.trim()}`,
    "",
    "Silakan gunakan nomor resi tersebut untuk melacak paket melalui situs atau aplikasi resmi kurir yang digunakan.",
    "Terima kasih telah berbelanja di STILERA. STILL ON YOU.",
  ].join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function whatsappLink(
  phone: string | null,
  order: AdminOrder,
  orderItems: AdminOrderItem[],
) {
  let number = (phone ?? "").replace(/\D/g, "");

  if (number.startsWith("0")) {
    number = `62${number.slice(1)}`;
  }

  if (!number) return null;

  // WhatsApp confirmation is available only after shipping has been saved.
  if (order.shipping_fee == null || order.total == null) return null;

  const itemLines = orderItems.map((item, index) => {
    const productName = item.product_name ?? "Produk";
    return `${index + 1}. ${productName} x${item.quantity} = ${rupiah(item.line_total)}`;
  });

  const message = [
    "Halo, " + (order.customer_name ?? "Kak") + ".",
    "Kami dari STILERA ingin mengonfirmasi total pembayaran pesanan Anda.",
    "",
    `Nomor pesanan: ${order.id}`,
    `Tanggal pesanan: ${formatDate(order.created_at)}`,
    "",
    "RINCIAN PESANAN:",
    ...itemLines,
    "",
    `Subtotal produk: ${rupiah(order.subtotal)}`,
    `Ongkos kirim (${courierLabel(order.courier)}): ${rupiah(order.shipping_fee)}`,
    `TOTAL TRANSFER: ${rupiah(order.total)}`,
    "",
    "PEMBAYARAN VIA TRANSFER BANK:",
    "Bank: Mandiri",
    "Nama pemilik rekening: miftaf fadil",
    "Nomor rekening: 089890412",
    "",
    `Silakan transfer sebesar ${rupiah(order.total)} ke rekening di atas.`,
    "Setelah transfer, mohon balas pesan ini dengan bukti pembayaran.",
    "Pesanan akan diproses setelah pembayaran diverifikasi oleh admin STILERA.",
    "",
    "Terima kasih telah berbelanja di STILERA.",
  ].join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function OrderFilters({ orders, items }: Props) {

  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = useMemo(() => {

    const normalized = query.trim().toLowerCase();

    return orders.filter((order) => {

      const matchesQuery =

        !normalized ||

        (order.customer_name ?? "").toLowerCase().includes(normalized) ||

        (order.phone ?? "").toLowerCase().includes(normalized) ||

        order.id.toLowerCase().includes(normalized);

      const currentStatus = normalizeStatus(order.status);

      const matchesStatus =

        statusFilter === "all" || currentStatus === statusFilter;

      return matchesQuery && matchesStatus;

    });

  }, [orders, query, statusFilter]);

  const itemsByOrder = useMemo(() => {

    const grouped = new Map<string, AdminOrderItem[]>();

    for (const item of items) {

      const current = grouped.get(item.order_id) ?? [];

      current.push(item);

      grouped.set(item.order_id, current);

    }

    return grouped;

  }, [items]);

  return (

    <section className="mt-5 space-y-5">

      <div className="grid gap-3 sm:grid-cols-[1fr_230px]">

        <input

          type="search"

          value={query}

          onChange={(event) => setQuery(event.target.value)}

          placeholder="Cari nama, telepon, atau ID pesanan..."

          aria-label="Cari pesanan"

          className={INPUT_CLASS}

        />

        <select

          value={statusFilter}

          onChange={(event) => setStatusFilter(event.target.value)}

          aria-label="Filter status pesanan"

          className={INPUT_CLASS}

        >

          <option value="all">Semua status</option>

          {STATUS_OPTIONS.map((option) => (

            <option key={option.value} value={option.value}>

              {option.label}

            </option>

          ))}

        </select>

      </div>

      <p className="text-sm text-white/50">

        Menampilkan {filteredOrders.length} dari {orders.length} pesanan.

      </p>

      {filteredOrders.length === 0 ? (

        <div className="rounded-2xl border border-dashed border-white/15 px-5 py-12 text-center">

          <p className="font-display text-lg">PESANAN TIDAK DITEMUKAN</p>

          <p className="mt-2 text-sm text-white/50">

            Coba kata kunci atau filter status yang berbeda.

          </p>

        </div>

      ) : (

        filteredOrders.map((order) => {

          const orderItems = itemsByOrder.get(order.id) ?? [];

          const status = normalizeStatus(order.status);

          const waUrl = whatsappLink(order.phone, order, orderItems);
          const trackingWaUrl = trackingWhatsappLink(order.phone, order);

          return (

            <article

              key={order.id}

              className="overflow-hidden rounded-2xl border border-white/10 bg-[#080808]"

            >

              <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">

                <div className="min-w-0 flex-1">

                  <p className="text-[10px] tracking-[0.25em] text-[#0b2cb1]">

                    ORDER ID

                  </p>

                  <p className="mt-2 break-all text-xs text-white/80 sm:text-sm">

                    {order.id}

                  </p>

                  <p className="mt-2 text-xs text-white/45">

                    {formatDate(order.created_at)}

                  </p>

                </div>

                <div className="flex flex-col items-start gap-3 sm:items-end">

                  <span

                    className={`inline-flex rounded-full border px-4 py-2 text-xs ${

                      STATUS_STYLES[order.status ?? "pending"] ??

                      STATUS_STYLES.pending

                    }`}

                  >

                    {STATUS_LABELS[order.status ?? "pending"] ??

                      order.status}

                  </span>

                  {waUrl ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${BUTTON_CLASS} border-emerald-400/40 text-emerald-200 hover:border-emerald-300 hover:text-emerald-100`}
                    >
                      KONFIRMASI ONGKIR & TRANSFER VIA WHATSAPP
                    </a>
                  ) : !order.phone ? (
                    <span className="text-xs text-white/40">
                      Nomor WhatsApp belum tersedia
                    </span>
                  ) : (
                    <span className="max-w-xs text-xs leading-5 text-amber-200/80 sm:text-right">
                      Simpan ongkir terlebih dahulu untuk mengaktifkan konfirmasi pembayaran.
                    </span>
                  )}
                  {trackingWaUrl ? (
                    <a
                      href={trackingWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${BUTTON_CLASS} border-sky-400/40 text-sky-200 hover:border-sky-300 hover:text-sky-100`}
                    >
                      KIRIM RESI VIA WHATSAPP
                    </a>
                  ) : order.status === "shipped" && !order.tracking_number?.trim() ? (
                    <span className="max-w-xs text-xs leading-5 text-amber-200/80 sm:text-right">
                      Masukkan dan simpan nomor resi untuk mengirim informasi pelacakan.
                    </span>
                  ) : order.status !== "shipped" && order.tracking_number?.trim() ? (
                    <span className="max-w-xs text-xs leading-5 text-white/40 sm:text-right">
                      Ubah status menjadi Dikirim setelah paket benar-benar diserahkan ke kurir untuk mengaktifkan pengiriman resi via WhatsApp.
                    </span>
                  ) : null}
                </div>

              </div>

              <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-2">

                <section className="min-w-0">

                  <h2 className="font-display text-lg tracking-wide">

                    DATA PENERIMA

                  </h2>

                  <p className="mt-4 break-words text-base">

                    {order.customer_name ?? "-"}

                  </p>

                  <p className="mt-1 text-sm text-white/60">

                    {order.phone ?? "-"}

                  </p>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">

                    <p className="whitespace-pre-line break-words text-sm leading-6 text-white/70">

                      {order.address ?? "-"}

                      {"\n"}

                      {order.city ?? "-"}, {order.province ?? "-"}

                      {"\n"}

                      Kode pos: {order.postal_code ?? "-"}

                    </p>

                  </div>

                  <p className="mt-4 text-sm text-white/60">

                    Kurir: {courierLabel(order.courier)}

                  </p>

                  <p className="mt-2 break-all text-sm text-white/60">

                    Nomor resi: {order.tracking_number || "Belum tersedia"}

                  </p>

                  {order.notes && (

                    <div className="mt-4 rounded-2xl border border-white/10 p-4">

                      <p className="text-xs tracking-wider text-white/40">

                        CATATAN PELANGGAN

                      </p>

                      <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-white/70">

                        {order.notes}

                      </p>

                    </div>

                  )}

                </section>

                <section className="min-w-0">

                  <h2 className="font-display text-lg tracking-wide">

                    RINGKASAN BIAYA

                  </h2>

                  <div className="mt-4 space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">

                    <div className="flex justify-between gap-4">

                      <span className="text-white/50">Subtotal produk</span>

                      <span className="text-right">

                        {rupiah(order.subtotal)}

                      </span>

                    </div>

                    <div className="flex justify-between gap-4">

                      <span className="text-white/50">Ongkos kirim</span>

                      <span className="text-right">

                        {order.shipping_fee == null

                          ? "Belum dikonfirmasi"

                          : rupiah(order.shipping_fee)}

                      </span>

                    </div>

                    <div className="flex justify-between gap-4 border-t border-white/10 pt-4 font-display text-base">

                      <span>TOTAL</span>

                      <span className="text-right text-[#0b2cb1]">

                        {order.total == null

                          ? "Menunggu konfirmasi"

                          : rupiah(order.total)}

                      </span>

                    </div>

                  </div>

                  <p className="mt-3 text-xs leading-5 text-white/40">

                    Konfirmasikan tarif kurir sebelum meminta pembayaran.

                    Total akan mengikuti ongkir yang disimpan admin.

                  </p>

                </section>

              </div>

              <section className="border-t border-white/10 p-4 sm:p-6">

                <h2 className="font-display text-lg tracking-wide">

                  ITEM PESANAN ({orderItems.length})

                </h2>

                {orderItems.length === 0 ? (

                  <p className="mt-4 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-white/45">

                    Detail item belum tersedia.

                  </p>

                ) : (

                  <div className="mt-4 space-y-3">

                    {orderItems.map((item) => (

                      <div

                        key={item.id}

                        className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"

                      >

                        <div className="min-w-0">

                          <p className="break-words text-sm text-white">

                            {item.product_name ?? "Produk"}

                          </p>

                          <p className="mt-2 text-xs text-white/50">

                            Jumlah: {item.quantity}

                          </p>

                          <p className="mt-1 text-xs text-white/45">

                            {rupiah(item.unit_price)} / item

                          </p>

                        </div>

                        <p className="shrink-0 text-base text-white sm:text-right">

                          {rupiah(item.line_total)}

                        </p>

                      </div>

                    ))}

                  </div>

                )}

              </section>

              <form

                action={updateOrderShippingAction}

                className="space-y-5 border-t border-white/10 p-4 sm:p-6"

              >

                <input type="hidden" name="orderId" value={order.id} />

                <h2 className="font-display text-lg tracking-wide">

                  PENGIRIMAN & NOMOR RESI

                </h2>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="min-w-0">

                    <label

                      htmlFor={`courier-${order.id}`}

                      className="mb-2 block text-xs tracking-wider text-white/50"

                    >

                      JASA PENGIRIMAN

                    </label>

                    <select

                      id={`courier-${order.id}`}

                      name="courier"

                      defaultValue={order.courier ?? "jne-reg"}

                      required

                      className={INPUT_CLASS}

                    >

                      <option value="jne-reg">JNE REG</option>

                      <option value="jnt-reg">J&T REG</option>

                      <option value="pos-reg">Pos Indonesia</option>

                    </select>

                  </div>

                  <div className="min-w-0">

                    <label

                      htmlFor={`shipping-${order.id}`}

                      className="mb-2 block text-xs tracking-wider text-white/50"

                    >

                      ONGKIR TERKONFIRMASI (RP)

                    </label>

                    <input

                      id={`shipping-${order.id}`}

                      name="shippingFee"

                      type="number"

                      min="0"

                      max="100000000"

                      step="1"

                      required

                      defaultValue={

                        order.shipping_fee == null

                          ? ""

                          : Number(order.shipping_fee)

                      }

                      placeholder="Masukkan ongkir"

                      className={INPUT_CLASS}

                    />

                  </div>

                </div>

                <div>

                  <label

                    htmlFor={`tracking-${order.id}`}

                    className="mb-2 block text-xs tracking-wider text-white/50"

                  >

                    NOMOR RESI (OPSIONAL)

                  </label>

                  <input

                    id={`tracking-${order.id}`}

                    name="trackingNumber"

                    type="text"

                    maxLength={100}

                    defaultValue={order.tracking_number ?? ""}

                    placeholder="Masukkan nomor resi"

                    className={INPUT_CLASS}

                  />

                </div>

                <p className="text-xs leading-5 text-white/40">

                  Simpan ongkir setelah tarif dikonfirmasi. Total pesanan

                  dihitung dari subtotal produk ditambah ongkir.

                </p>

                <button

                  type="submit"

                  className="w-full rounded-full bg-[#0b2cb1] px-5 py-3 text-xs tracking-[0.15em] text-white transition-colors hover:bg-blue-800"

                >

                  SIMPAN DATA PENGIRIMAN

                </button>

              </form>

              <form

                action={updateOrderStatusAction}

                className="flex flex-col gap-4 border-t border-white/10 p-4 sm:flex-row sm:items-end sm:p-6"

              >

                <input type="hidden" name="orderId" value={order.id} />

                <div className="min-w-0 flex-1">

                  <label

                    htmlFor={`status-${order.id}`}

                    className="mb-2 block text-xs tracking-wider text-white/50"

                  >

                    STATUS PESANAN

                  </label>

                  <select

                    id={`status-${order.id}`}

                    name="status"

                    defaultValue={status}

                    className={INPUT_CLASS}

                  >

                    {STATUS_OPTIONS.map((option) => (

                      <option key={option.value} value={option.value}>

                        {option.label}

                      </option>

                    ))}

                  </select>

                </div>

                <button

                  type="submit"

                  className="w-full rounded-full bg-[#0b2cb1] px-6 py-3 text-xs tracking-[0.15em] text-white transition-colors hover:bg-blue-800 sm:w-auto"

                >

                  SIMPAN STATUS

                </button>

              </form>

            </article>

          );

        })

      )}

    </section>

  );

}
