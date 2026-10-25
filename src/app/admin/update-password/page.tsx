
import { Suspense } from "react";
import { updatePasswordAction } from "./actions";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

async function UpdatePasswordContent({ searchParams }: PageProps) {
  const { error } = await searchParams;

  const messages: Record<string, string> = {
    length: "Password harus terdiri dari minimal 10 karakter.",
    mismatch: "Kedua password tidak sama.",
    failed: "Password gagal diperbarui. Silakan coba lagi.",
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-10 text-white">
      <section className="w-full max-w-md border border-white/15 bg-[#080808] p-6 sm:p-8">
        <p className="text-xs tracking-[0.3em] text-[#E50914]">
          STILERA / ACCOUNT RECOVERY
        </p>

        <h1 className="mt-4 font-display text-3xl tracking-[0.08em]">
          SET NEW PASSWORD
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/60">
          Masukkan password baru untuk akun admin kamu.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 border border-red-500/40 p-3 text-sm text-red-200"
          >
            {messages[error] ?? "Terjadi kesalahan."}
          </p>
        )}

        <form action={updatePasswordAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="mb-2 block text-xs">
              PASSWORD BARU
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={10}
              autoComplete="new-password"
              required
              className="w-full border border-white/20 bg-black px-4 py-3 outline-none focus:border-[#E50914]"
            />
          </div>

          <div>
            <label htmlFor="confirmation" className="mb-2 block text-xs">
              ULANGI PASSWORD
            </label>
            <input
              id="confirmation"
              name="confirmation"
              type="password"
              minLength={10}
              autoComplete="new-password"
              required
              className="w-full border border-white/20 bg-black px-4 py-3 outline-none focus:border-[#E50914]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#E50914] px-4 py-3 font-display tracking-[0.2em] text-white hover:bg-red-700"
          >
            UPDATE PASSWORD
          </button>
        </form>
      </section>
    </main>
  );
}

export default function UpdatePasswordPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
          Loading...
        </main>
      }
    >
      <UpdatePasswordContent searchParams={props.searchParams} />
    </Suspense>
  );
}
