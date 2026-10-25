import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function logoutAction() {
  "use server";

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("STILERA logout failed:", error.message);
    redirect("/admin?error=logout-failed");
  }

  redirect("/admin/login?success=logged-out");
}

async function AdminDashboard() {
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
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  const isOwner = profile.role === "owner";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] px-4 py-6 text-white sm:px-8 sm:py-10">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-48 left-1/2 h-96 w-[700px] -translate-x-1/2 rounded-full bg-[#0b2cb1]/[0.09] blur-[130px]" />
        <div className="absolute right-0 top-[40%] h-72 w-72 rounded-full bg-[#0b2cb1]/[0.04] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-6 sm:pb-8">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-3"
              aria-label="STILERA Admin Dashboard"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/[0.03] font-display text-sm font-bold tracking-tight text-white">
                S
              </span>
              <span className="font-display text-lg tracking-[0.2em]">
                STILERA
              </span>
            </Link>

            <p className="mt-4 text-[10px] tracking-[0.35em] text-[#7290ff]">
              MANAGEMENT / CONTROL CENTER
            </p>

            <h1 className="mt-2 font-display text-3xl tracking-[0.07em] sm:text-4xl lg:text-5xl">
              ADMIN DASHBOARD
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
              Manage your collection, monitor orders, and control your STILERA
              store operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[0.02] px-5 py-3 text-[10px] tracking-[0.16em] transition-all duration-300 hover:border-[#0b2cb1] hover:bg-[#0b2cb1]/10"
            >
              VIEW STORE
              <span aria-hidden="true" className="text-[#8da5ff]">
                ↗
              </span>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#0b2cb1]/50 bg-[#0b2cb1]/10 px-5 py-3 text-[10px] tracking-[0.16em] text-[#a9baff] transition-all duration-300 hover:border-[#7290ff] hover:bg-[#0b2cb1]/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7290ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                  <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                </svg>
                LOGOUT
              </button>
            </form>
          </div>
        </header>

        {/* Account information */}
        <section className="relative mt-7 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#101216] via-[#08090c] to-[#050505] p-5 sm:mt-9 sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[#0b2cb1]/10 blur-[90px]"
          />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="h-px w-7 bg-[#7290ff]" />
                <p className="text-[10px] tracking-[0.25em] text-white/45">
                  CURRENT SESSION
                </p>
              </div>

              <p className="mt-4 break-all text-base font-medium sm:text-lg">
                {user.email ?? "Authenticated user"}
              </p>

              <p className="mt-2 text-xs leading-5 text-white/40">
                Signed in to STILERA Management
              </p>
            </div>

            <div className="flex items-center gap-3 self-start rounded-full border border-[#0b2cb1]/50 bg-[#0b2cb1]/10 px-4 py-2 sm:self-center">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7290ff]" />
              <span className="text-[10px] tracking-[0.2em] text-[#a9baff]">
                {profile.role.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="relative mt-7 border-t border-white/[0.08] pt-5">
            <p className="max-w-2xl text-sm leading-7 text-white/55">
              Welcome back. Manage your products, maintain your collection, and
              keep track of store operations from one place.
            </p>
          </div>
        </section>

        {/* Dashboard navigation */}
        <section className="mt-10 sm:mt-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] tracking-[0.3em] text-[#7290ff]">
                WORKSPACE / 01
              </p>
              <h2 className="mt-2 font-display text-2xl tracking-[0.08em] sm:text-3xl">
                STORE MANAGEMENT
              </h2>
            </div>

            <p className="text-xs text-white/35">Select a workspace</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {/* Product catalog */}
            <Link
              href="/admin/products"
              className="group relative flex min-h-[250px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#08090c] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#0b2cb1]/70 hover:bg-[#0b2cb1]/[0.05] sm:p-7"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#0b2cb1]/0 blur-[70px] transition-colors duration-500 group-hover:bg-[#0b2cb1]/20"
              />

              <div className="relative flex items-center justify-between">
                <span className="text-[10px] tracking-[0.22em] text-white/45">
                  01 / CATALOG
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-lg text-white/60 transition-all duration-300 group-hover:border-[#0b2cb1] group-hover:bg-[#0b2cb1] group-hover:text-white">
                  ↗
                </span>
              </div>

              <div className="relative mt-8">
                <h3 className="font-display text-2xl tracking-[0.08em] transition-colors group-hover:text-[#a9baff] sm:text-3xl">
                  PRODUCTS
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/45">
                  Create products, edit descriptions, manage photos, gallery
                  images, and New Arrival status.
                </p>
              </div>

              <div className="relative mt-auto flex items-center gap-3 pt-8">
                <span className="h-px w-8 bg-[#0b2cb1] transition-all group-hover:w-14" />
                <span className="text-[10px] tracking-[0.2em] text-[#8da5ff]">
                  MANAGE COLLECTION
                </span>
              </div>
            </Link>

            {/* Order management */}
            <Link
              href="/admin/orders"
              className="group relative flex min-h-[250px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#08090c] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#0b2cb1]/70 hover:bg-[#0b2cb1]/[0.05] sm:p-7"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#0b2cb1]/0 blur-[70px] transition-colors duration-500 group-hover:bg-[#0b2cb1]/20"
              />

              <div className="relative flex items-center justify-between">
                <span className="text-[10px] tracking-[0.22em] text-white/45">
                  02 / OPERATIONS
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-lg text-white/60 transition-all duration-300 group-hover:border-[#0b2cb1] group-hover:bg-[#0b2cb1] group-hover:text-white">
                  ↗
                </span>
              </div>

              <div className="relative mt-8">
                <h3 className="font-display text-2xl tracking-[0.08em] transition-colors group-hover:text-[#a9baff] sm:text-3xl">
                  ORDERS
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/45">
                  Review incoming orders, customer details, purchased items,
                  and update order statuses.
                </p>
              </div>

              <div className="relative mt-auto flex items-center gap-3 pt-8">
                <span className="h-px w-8 bg-[#0b2cb1] transition-all group-hover:w-14" />
                <span className="text-[10px] tracking-[0.2em] text-[#8da5ff]">
                  VIEW ORDERS
                </span>
              </div>
            </Link>

            {/* Staff access */}
            {isOwner && (
              <div className="relative flex min-h-[250px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#08090c] p-5 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.22em] text-white/45">
                    03 / PERMISSIONS
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-lg text-white/40">
                    +
                  </span>
                </div>

                <div className="mt-8">
                  <h3 className="font-display text-2xl tracking-[0.08em] sm:text-3xl">
                    STAFF ACCESS
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/45">
                    Staff account and permission management. This workspace has
                    not been activated yet.
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-3 pt-8">
                  <span className="h-px w-8 bg-white/20" />
                  <span className="text-[10px] tracking-[0.2em] text-white/35">
                    COMING NEXT
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 flex flex-col gap-3 border-t border-white/10 py-6 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-sm tracking-[0.22em] text-white/60">
            STILERA
          </p>
          <p className="text-[9px] tracking-[0.18em] text-white/30">
            SS26 MANAGEMENT / UNDERGROUND CULTURE
          </p>
        </footer>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
          Loading dashboard...
        </main>
      }
    >
      <AdminDashboard />
    </Suspense>
  );
}
