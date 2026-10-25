import { Suspense } from "react";
import {
  loginAction,
  requestPasswordResetAction,
} from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

async function LoginContent({ searchParams }: LoginPageProps) {
  const { error, success } = await searchParams;

  const errorMessages: Record<string, string> = {
    missing: "Please enter your email and password.",
    credentials: "The email or password is incorrect.",
    unauthorized: "This account does not have administrator access.",
    "reset-failed":
      "The password reset request failed. Please check the Supabase configuration.",
    recovery:
      "The password recovery session is invalid or has expired. Please request a new reset link.",
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-4 py-10 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(11,44,177,0.16),transparent_55%)]"
      />

      <section className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-[#101216] via-[#08090c] to-[#050505] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.65)] sm:p-8">
        <p className="text-[10px] tracking-[0.3em] text-[#8da5ff]">
          STILERA / PRIVATE ACCESS
        </p>

        <h1 className="mt-4 font-display text-3xl tracking-[0.1em] sm:text-4xl">
          ADMIN LOGIN
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/55">
          Sign in using an authorized owner or staff account.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm leading-6 text-red-200"
          >
            {errorMessages[error] ?? "Login failed. Please try again."}
          </p>
        )}

        {success === "reset-sent" && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-green-500/30 bg-green-950/20 p-3 text-sm leading-6 text-green-200"
          >
            If the email belongs to a registered account, a password reset
            link will be sent. Check your inbox and spam folder.
          </p>
        )}

        {success === "password-updated" && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-green-500/30 bg-green-950/20 p-3 text-sm leading-6 text-green-200"
          >
            Your password has been updated. Please sign in again.
          </p>
        )}

        <form action={loginAction} className="mt-7 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-xs tracking-[0.15em] text-white/70"
            >
              EMAIL
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#0b2cb1] focus:ring-1 focus:ring-[#0b2cb1]/40"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-xs tracking-[0.15em] text-white/70"
            >
              PASSWORD
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#0b2cb1] focus:ring-1 focus:ring-[#0b2cb1]/40"
            />
          </div>

          <button
            type="submit"
            className="min-h-12 w-full rounded-full border border-[#0b2cb1] bg-[#0b2cb1] px-4 py-3 font-display text-xs tracking-[0.2em] text-white transition-colors hover:bg-[#092397] active:scale-[0.99]"
          >
            SIGN IN
          </button>
        </form>

        <div className="mt-7 border-t border-white/10 pt-6">
          <p className="text-xs tracking-[0.15em] text-white/70">
            RESET PASSWORD VIA EMAIL
          </p>

          <p className="mt-2 text-sm leading-6 text-white/45">
            Enter your account email to request a password reset link.
          </p>

          <form action={requestPasswordResetAction} className="mt-4">
            <label htmlFor="reset-email" className="sr-only">
              Account email
            </label>
            <input
              id="reset-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              placeholder="Account email"
              required
              className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#0b2cb1] focus:ring-1 focus:ring-[#0b2cb1]/40"
            />

            <button
              type="submit"
              className="mt-3 min-h-12 w-full rounded-full border border-white/15 px-4 py-3 font-display text-xs tracking-[0.15em] text-white/75 transition-colors hover:border-[#0b2cb1] hover:bg-[#0b2cb1]/10 hover:text-white"
            >
              FORGOT PASSWORD
            </button>
          </form>
        </div>

        <p className="mt-7 text-center text-[9px] tracking-[0.2em] text-white/25">
          STILERA · FEARLESS SOULS ONLY
        </p>
      </section>
    </main>
  );
}

export default function AdminLoginPage(props: LoginPageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
          <p className="text-xs tracking-[0.2em] text-[#8da5ff]">
            LOADING...
          </p>
        </main>
      }
    >
      <LoginContent searchParams={props.searchParams} />
    </Suspense>
  );
}