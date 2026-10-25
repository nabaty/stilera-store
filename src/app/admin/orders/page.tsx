
import {
  OrderFilters,
  type AdminOrder,
  type AdminOrderItem,
} from "./order-filters";
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function AdminOrdersContent() {
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

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, customer_name, phone, province, city, postal_code, address, notes, courier, tracking_number, subtotal, shipping_fee, total, status, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  let items: AdminOrderItem[] = [];
  let itemError = false;

  if (!error && orders && orders.length > 0) {
    const { data, error: detailsError } = await supabase
      .from("order_items")
      .select(
        "id, order_id, product_id, product_name, size, quantity, unit_price, line_total",
      )
      .in(
        "order_id",
        orders.map((order) => order.id),
      )
      .order("created_at", { ascending: true });

    if (detailsError) {
      itemError = true;
      console.error("STILERA order items:", detailsError.message);
    } else {
      items = (data ?? []) as AdminOrderItem[];
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] px-4 py-6 text-white sm:px-8 sm:py-10">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-80 w-[650px] -translate-x-1/2 rounded-full bg-[#0b2cb1]/[0.08] blur-[130px]" />
        <div className="absolute right-0 top-[40%] h-64 w-64 rounded-full bg-[#0b2cb1]/[0.04] blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-center sm:justify-between sm:pb-8">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-3"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] font-display text-sm font-bold">
                S
              </span>

              <span className="font-display text-lg tracking-[0.2em]">
                STILERA
              </span>
            </Link>

            <p className="mt-4 text-[10px] tracking-[0.32em] text-[#8da5ff]">
              MANAGEMENT / OPERATIONS
            </p>

            <h1 className="mt-2 font-display text-3xl tracking-[0.07em] sm:text-4xl lg:text-5xl">
              ORDER MANAGEMENT
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
              Manage customer orders, review purchased items, and
              monitor delivery information.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-4 py-3 text-center text-[10px] tracking-[0.12em] transition-colors hover:border-[#0b2cb1] hover:bg-[#0b2cb1]/10"
            >
              DASHBOARD
            </Link>

            <Link
              href="/admin/products"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-4 py-3 text-center text-[10px] tracking-[0.12em] transition-colors hover:border-[#0b2cb1] hover:bg-[#0b2cb1]/10"
            >
              PRODUCTS
            </Link>
          </div>
        </header>

        {/* Page summary */}
        <section className="mt-7 grid gap-4 sm:mt-9 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#101216] to-[#08090c] p-5 sm:p-6">
            <p className="text-[10px] tracking-[0.24em] text-white/40">
              ORDER OVERVIEW
            </p>

            <h2 className="mt-3 font-display text-2xl tracking-[0.08em]">
              CUSTOMER ORDERS
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/45">
              Review orders from newest to oldest.
            </p>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-[#0b2cb1]/30 bg-[#0b2cb1]/[0.06] p-5 sm:p-6">
            <p className="text-[10px] tracking-[0.24em] text-[#8da5ff]">
              RECORDS LOADED
            </p>

            <p className="mt-2 font-display text-4xl text-white">
              {error ? "—" : orders?.length ?? 0}
            </p>

            <p className="mt-2 text-xs leading-5 text-white/45">
              {orders?.length === 100
                ? "Showing the latest 100 orders."
                : "Orders retrieved from the database."}
            </p>
          </div>
        </section>

        {/* Order results */}
        {error ? (
          <section className="mt-7 rounded-2xl border border-red-400/30 bg-red-950/10 p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-400/30 text-red-300">
                !
              </span>

              <div>
                <h2 className="font-display text-lg tracking-[0.08em] text-red-200">
                  UNABLE TO LOAD ORDERS
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  Pesanan gagal dimuat. Periksa policy SELECT pada
                  tabel orders dan konfigurasi Supabase. Detail
                  error tersedia di terminal server.
                </p>
              </div>
            </div>
          </section>
        ) : !orders?.length ? (
          <section className="mt-7 rounded-2xl border border-white/10 bg-[#08090c] px-5 py-12 text-center sm:py-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 text-2xl text-white/50">
              ↗
            </div>

            <h2 className="mt-5 font-display text-xl tracking-[0.08em]">
              NO ORDERS YET
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/45">
              Belum ada pesanan yang tersimpan. Pesanan baru akan
              muncul di sini setelah berhasil masuk ke Supabase.
            </p>

            <Link
              href="/admin"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 py-3 text-[10px] tracking-[0.15em] transition-colors hover:border-[#0b2cb1] hover:bg-[#0b2cb1]/10"
            >
              BACK TO DASHBOARD
            </Link>
          </section>
        ) : (
          <section className="mt-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] tracking-[0.25em] text-[#8da5ff]">
                  ORDER DATABASE
                </p>

                <h2 className="mt-2 font-display text-xl tracking-[0.08em]">
                  ALL ORDERS
                </h2>
              </div>

              <p className="text-xs text-white/40">
                {orders.length} orders
                {orders.length === 100 ? " / LIMIT 100" : ""}
              </p>
            </div>

            {itemError && (
              <div
                role="alert"
                className="rounded-xl border border-yellow-500/30 bg-yellow-500/[0.04] p-4 text-sm leading-6 text-yellow-100/80"
              >
                Detail item gagal dimuat. Informasi utama pesanan
                masih ditampilkan. Periksa policy SELECT pada tabel
                order_items.
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#08090c] p-3 sm:p-5">
              <OrderFilters
                orders={orders as AdminOrder[]}
                items={items}
              />
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 flex flex-col gap-3 border-t border-white/10 py-6 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-sm tracking-[0.22em] text-white/55">
            STILERA
          </p>

          <p className="text-[9px] tracking-[0.18em] text-white/30">
            SS26 MANAGEMENT / ORDER OPERATIONS
          </p>
        </footer>
      </div>
    </main>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
          Loading orders...
        </main>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
