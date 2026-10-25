"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { useShop } from "@/lib/shop-context";
import { createOrderAction } from "@/app/actions/create-order";

const WHATSAPP_NUMBER = "6287877972766";

const inputClass =
  "w-full min-w-0 rounded-full border border-white/15 bg-[#0b0b0f] px-5 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#2448ff] focus:ring-2 focus:ring-[#2448ff]/20";

const textareaClass =
  "w-full min-w-0 rounded-2xl border border-white/15 bg-[#0b0b0f] px-5 py-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#2448ff] focus:ring-2 focus:ring-[#2448ff]/20";

const labelClass =
  "mb-2.5 block pl-1 text-xs tracking-[0.08em] text-white/65";

const panelClass =
  "min-w-0 rounded-3xl border border-white/10 bg-[#08090d] p-5 sm:p-7";

const courierOptions = [
  { value: "jne-reg", label: "JNE REG" },
  { value: "jnt-reg", label: "J&T REG" },
  { value: "pos-reg", label: "Pos Indonesia" },
] as const;

type CourierValue = (typeof courierOptions)[number]["value"];

export function CheckoutForm() {
  const { items, subtotal } = useShop();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("Banten");
  const [city, setCity] = useState("Kabupaten Tangerang");
  const [postal, setPostal] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [courier, setCourier] = useState<CourierValue>("jne-reg");
  const [checkoutError, setCheckoutError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkoutWhatsApp = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    setCheckoutError("");

    if (items.length === 0) {
      setCheckoutError(
        "Keranjang masih kosong. Tambahkan produk sebelum checkout.",
      );
      return;
    }

    if (
      !name.trim() ||
      !phone.trim() ||
      !province.trim() ||
      !city.trim() ||
      !postal.trim() ||
      !address.trim()
    ) {
      setCheckoutError(
        "Lengkapi semua data penerima yang wajib diisi.",
      );
      return;
    }

    const normalizedPhone = phone.replace(/[\s()-]/g, "");

    if (!/^\+?[0-9]{9,16}$/.test(normalizedPhone)) {
      setCheckoutError(
        "Nomor telepon tidak valid. Periksa kembali nomor WhatsApp.",
      );
      return;
    }

    if (!/^[0-9]{5}$/.test(postal.trim())) {
      setCheckoutError("Kode pos harus terdiri dari 5 angka.");
      return;
    }

    const selectedCourier = courierOptions.find(
      (option) => option.value === courier,
    );

    // Produk menggunakan sistem ALL SIZE.
    // Ukuran tidak dicantumkan dalam pesan pesanan.
    const orderDetails = items
      .map(
        (item, index) =>
          `${index + 1}. ${item.name}\n` +
          `   Jumlah: ${item.quantity}\n` +
          `   Harga satuan: ${formatRupiah(item.price)}\n` +
          `   Subtotal: ${formatRupiah(item.price * item.quantity)}`,
      )
      .join("\n\n");

    const message =
      `HALO STILERA, SAYA INGIN MEMESAN PRODUK BERIKUT:\n\n` +
      `=== DATA PENERIMA ===\n` +
      `Nama: ${name.trim()}\n` +
      `Telepon: ${phone.trim()}\n` +
      `Provinsi: ${province.trim()}\n` +
      `Kota/Kabupaten: ${city.trim()}\n` +
      `Kode pos: ${postal.trim()}\n` +
      `Alamat lengkap: ${address.trim()}\n` +
      (notes.trim() ? `Catatan: ${notes.trim()}\n` : "") +
      `\n=== DETAIL PRODUK ===\n${orderDetails}\n\n` +
      `=== PENGIRIMAN ===\n` +
      `Preferensi kurir: ${selectedCourier?.label ?? courier}\n` +
      `Ongkos kirim: MENUNGGU KONFIRMASI ADMIN\n\n` +
      `=== RINGKASAN BIAYA ===\n` +
      `Subtotal produk: ${formatRupiah(subtotal)}\n` +
      `Ongkos kirim: Belum ditentukan\n` +
      `TOTAL AKHIR: Belum ditentukan, menunggu konfirmasi ongkir dan ketersediaan produk.\n\n` +
      `Mohon konfirmasi stok, ongkir, estimasi pengiriman, dan total pembayaran. Terima kasih.`;

    // Buka tab melalui interaksi pengguna agar tidak mudah diblokir browser.
    const whatsappWindow = window.open("about:blank", "_blank");

    setIsSubmitting(true);

    try {
      const result = await createOrderAction({
        name: name.trim(),
        phone: phone.trim(),
        province: province.trim(),
        city: city.trim(),
        postal: postal.trim(),
        address: address.trim(),
        notes: notes.trim(),
        courier,
        // Properti size tetap dikirim untuk kompatibilitas
        // dengan server action yang mungkin masih membutuhkannya.
        // Nilainya selalu ALL SIZE.
        items: items.map((item) => ({
          productId: item.productId,
          size: "ALL SIZE",
          quantity: item.quantity,
        })),
      });

      if (!result.success) {
        whatsappWindow?.close();
        setCheckoutError(result.error);
        return;
      }

      const messageWithOrderId =
        `${message}\n\nNomor pesanan STILERA: ${result.orderId}`;

      const whatsappUrl =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageWithOrderId)}`;

      if (whatsappWindow) {
        whatsappWindow.location.href = whatsappUrl;
      } else {
        window.location.href = whatsappUrl;
      }
    } catch (error) {
      whatsappWindow?.close();

      console.error("STILERA checkout request failed:", error);

      setCheckoutError(
        "Pesanan gagal diproses. Periksa koneksi. Jika pesanan mungkin sudah tersimpan, hubungi admin sebelum mencoba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border border-white/10 bg-[#08090d] p-6 sm:p-8">
        <p className="text-sm leading-7 text-white/60">
          Keranjang masih kosong. Tambahkan produk terlebih dahulu
          sebelum melanjutkan checkout.
        </p>

        <Link
          href="/#new-arrivals"
          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-[#1739d5] px-6 py-3 text-xs tracking-[0.15em] text-white transition-colors hover:bg-[#2448ff]"
        >
          KEMBALI KE KATALOG
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
      <form
        onSubmit={checkoutWhatsApp}
        className="min-w-0 space-y-6"
      >
        {/* Delivery details */}
        <section className={panelClass}>
          <p className="text-[10px] tracking-[0.3em] text-[#6688ff]">
            DELIVERY DETAILS
          </p>

          <h2 className="mt-3 font-display text-2xl tracking-[0.06em] text-white sm:text-3xl">
            ALAMAT PENGIRIMAN
          </h2>

          <p className="mt-2 text-xs leading-6 text-white/45">
            Isi alamat penerima dengan lengkap agar admin dapat
            mengonfirmasi pengiriman.
          </p>

          <div className="mt-7 space-y-5">
            <div>
              <label htmlFor="shipping-name" className={labelClass}>
                Nama penerima *
              </label>

              <input
                id="shipping-name"
                name="name"
                autoComplete="name"
                required
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nama lengkap"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="shipping-phone" className={labelClass}>
                Nomor telepon / WhatsApp *
              </label>

              <input
                id="shipping-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                required
                minLength={9}
                maxLength={20}
                pattern="[+0-9() -]{9,20}"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="08xxxxxxxxxx"
                className={inputClass}
              />
            </div>

            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <div className="min-w-0">
                <label
                  htmlFor="shipping-province"
                  className={labelClass}
                >
                  Provinsi *
                </label>

                <input
                  id="shipping-province"
                  name="province"
                  autoComplete="address-level1"
                  required
                  maxLength={100}
                  value={province}
                  onChange={(event) => setProvince(event.target.value)}
                  placeholder="Provinsi"
                  className={inputClass}
                />
              </div>

              <div className="min-w-0">
                <label htmlFor="shipping-city" className={labelClass}>
                  Kota / Kabupaten *
                </label>

                <input
                  id="shipping-city"
                  name="city"
                  autoComplete="address-level2"
                  required
                  maxLength={100}
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Kota atau kabupaten"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="shipping-postal" className={labelClass}>
                Kode pos *
              </label>

              <input
                id="shipping-postal"
                name="postal"
                autoComplete="postal-code"
                inputMode="numeric"
                required
                maxLength={5}
                minLength={5}
                pattern="[0-9]{5}"
                value={postal}
                onChange={(event) =>
                  setPostal(
                    event.target.value.replace(/\D/g, "").slice(0, 5),
                  )
                }
                placeholder="5 digit kode pos"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="shipping-address"
                className={labelClass}
              >
                Alamat lengkap *
              </label>

              <textarea
                id="shipping-address"
                name="address"
                autoComplete="street-address"
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, dan patokan"
                className={textareaClass}
              />
            </div>

            <div>
              <label htmlFor="shipping-notes" className={labelClass}>
                Catatan pengiriman (opsional)
              </label>

              <textarea
                id="shipping-notes"
                name="notes"
                rows={3}
                maxLength={500}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Contoh: hubungi sebelum tiba"
                className={textareaClass}
              />
            </div>
          </div>
        </section>

        {/* Shipping method */}
        <section className={panelClass}>
          <p className="text-[10px] tracking-[0.3em] text-[#6688ff]">
            SHIPPING METHOD
          </p>

          <h2 className="mt-3 font-display text-2xl tracking-[0.06em] text-white sm:text-3xl">
            PILIH PENGIRIMAN
          </h2>

          <div className="mt-6 space-y-3">
            {courierOptions.map((option) => {
              const selected = courier === option.value;

              return (
                <label
                  key={option.value}
                  className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-full border px-4 py-3 transition-colors sm:px-5 ${
                    selected
                      ? "border-[#3155ff] bg-[#1739d5]/15"
                      : "border-white/10 bg-[#0b0b0f] hover:border-white/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="courier"
                    value={option.value}
                    checked={selected}
                    onChange={() => setCourier(option.value)}
                    className="h-4 w-4 shrink-0 accent-[#3155ff]"
                  />

                  <span className="min-w-0 flex-1 text-sm text-white">
                    {option.label}
                  </span>

                  <span className="text-right text-[10px] text-white/40">
                    Konfirmasi admin
                  </span>
                </label>
              );
            })}
          </div>

          <p className="mt-5 text-xs leading-6 text-white/45">
            Pilihan kurir merupakan preferensi. Ketersediaan layanan,
            ongkir, dan estimasi tiba akan dikonfirmasi admin. Tarif
            aktual belum dihitung di halaman ini.
          </p>
        </section>

        {checkoutError && (
          <p
            role="alert"
            className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-sm leading-6 text-red-200"
          >
            {checkoutError}
          </p>
        )}

        <button
          type="submit"
          disabled={items.length === 0 || isSubmitting}
          className="flex min-h-14 w-full items-center justify-center rounded-full bg-[#1739d5] px-5 py-4 font-display text-xs tracking-[0.16em] text-white transition-all hover:bg-[#2448ff] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 sm:text-sm"
        >
          {isSubmitting
            ? "SAVING ORDER..."
            : "SAVE ORDER & CHECKOUT VIA WHATSAPP"}
        </button>
      </form>

      {/* Order summary */}
      <aside className="h-fit min-w-0 rounded-3xl border border-white/10 bg-[#08090d] p-5 sm:p-6 lg:sticky lg:top-24">
        <p className="text-[10px] tracking-[0.3em] text-[#6688ff]">
          ORDER SUMMARY
        </p>

        <h2 className="mt-3 font-display text-2xl text-white">
          YOUR CART
        </h2>

        <ul className="mt-5 space-y-4">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex min-w-0 justify-between gap-3 border-b border-white/10 pb-4"
            >
              <div className="min-w-0">
                <p className="break-words text-sm text-white">
                  {item.name}
                </p>

                <p className="mt-1 text-xs text-white/45">
                  Qty {item.quantity}
                </p>
              </div>

              <p className="shrink-0 text-right text-sm text-white">
                {formatRupiah(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-xs tracking-[0.08em] text-white/50">
            SUBTOTAL PRODUK
          </span>

          <span className="font-display text-lg text-white">
            {formatRupiah(subtotal)}
          </span>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3 border-t border-white/10 pt-4">
          <span className="text-xs tracking-[0.08em] text-white/50">
            ONGKOS KIRIM
          </span>

          <span className="text-right text-xs text-white/60">
            Menunggu konfirmasi
          </span>
        </div>

        <p className="mt-4 text-xs leading-6 text-white/40">
          Total akhir ditentukan setelah admin mengonfirmasi ongkir
          dan ketersediaan produk melalui WhatsApp.
        </p>

        <Link
          href="/#new-arrivals"
          className="mt-5 flex min-h-12 items-center justify-center rounded-full border border-white/15 px-4 py-3 text-center text-xs tracking-[0.12em] text-white transition-colors hover:border-[#3155ff] hover:bg-[#1739d5]/10"
        >
          CONTINUE SHOPPING
        </Link>
      </aside>
    </div>
  );
}