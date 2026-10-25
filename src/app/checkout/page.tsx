import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { ShoppingBag } from "@/components/shopping-bag";
import { CheckoutForm } from "@/components/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#050505] text-white">
      <Navbar />

      <main className="relative mx-auto min-h-[70vh] w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8">
        {/* Background atmosphere */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-0 h-72 w-[90%] -translate-x-1/2 rounded-full bg-[#0b2cb1]/[0.07] blur-[120px]"
        />

        {/* Page heading */}
        <header className="relative z-10 border-b border-white/10 pb-7 sm:pb-9">
          <div className="flex items-center gap-2 text-[10px] font-medium tracking-[0.3em] text-[#6688ff] sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0b2cb1]" />
            STILERA / CHECKOUT
          </div>

          <div className="mt-5 flex flex-col justify-between gap-5 sm:mt-6 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <h1 className="font-display text-3xl leading-tight tracking-[0.04em] sm:text-4xl md:text-5xl">
                DELIVERY DETAILS
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 sm:leading-7">
                Lengkapi informasi penerima dan pilih metode pengiriman.
                Admin akan mengonfirmasi ketersediaan produk, ongkos kirim,
                dan total pembayaran melalui WhatsApp.
              </p>
            </div>

            <Link
              href="/#new-arrivals"
              className="inline-flex min-h-11 w-fit shrink-0 items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 text-[10px] tracking-[0.16em] text-white/70 transition-colors hover:border-[#0b2cb1] hover:bg-[#0b2cb1]/10 hover:text-white"
            >
              <span aria-hidden="true">←</span>
              BACK TO STORE
            </Link>
          </div>

          {/* Checkout progress */}
          <div className="mt-7 flex items-center gap-3 sm:mt-8">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0b2cb1] text-xs font-semibold">
              1
            </span>

            <span className="text-xs tracking-wide text-white">
              Delivery information
            </span>

            <span className="h-px min-w-4 flex-1 bg-white/10 sm:max-w-16" />

            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 text-xs text-white/50">
              2
            </span>

            <span className="text-xs tracking-wide text-white/45">
              Confirmation
            </span>
          </div>
        </header>

        {/* Checkout form */}
        <section className="relative z-10 mt-6 sm:mt-8">
          <CheckoutForm />
        </section>

        {/* Return link */}
        <div className="relative z-10 mt-8 border-t border-white/10 pt-5 sm:mt-10">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-xs tracking-[0.12em] text-white/50 transition-colors hover:text-[#6688ff]"
          >
            <span aria-hidden="true">←</span>
            CONTINUE SHOPPING
          </Link>
        </div>
      </main>

      <SiteFooter />
      <ShoppingBag />
    </div>
  );
}