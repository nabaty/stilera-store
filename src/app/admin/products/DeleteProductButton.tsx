
"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteProductAction,
  type DeleteProductState,
} from "./actions";

const initialState: DeleteProductState = {
  success: false,
  message: "",
};

export default function DeleteProductButton({
  productId,
}: {
  productId: string;
}) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    deleteProductAction,
    initialState,
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);

  useEffect(() => {
    if (!state.message) return;

    setConfirmOpen(false);
    setResultOpen(true);
  }, [state]);

  useEffect(() => {
    if (!confirmOpen && !resultOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        if (resultOpen) {
          closeResult();
        } else {
          setConfirmOpen(false);
        }
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [confirmOpen, resultOpen, pending]);

  function closeResult() {
    setResultOpen(false);

    if (state.success) {
      router.refresh();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-red-500/40 bg-red-500/[0.04] px-3 py-2 text-center text-[10px] tracking-[0.12em] text-red-300 transition-all duration-300 hover:border-red-500 hover:bg-red-600 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
      >
        DELETE PRODUCT
      </button>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !pending
            ) {
              setConfirmOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#08090c] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.8)] sm:p-8"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-2xl text-red-300">
              !
            </div>

            <p className="mt-5 text-center text-[10px] tracking-[0.3em] text-red-300">
              STILERA / CONFIRMATION
            </p>

            <h2
              id="delete-product-title"
              className="mt-3 text-center font-display text-2xl tracking-[0.08em] text-white"
            >
              DELETE PRODUCT?
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-white/50">
              Produk akan dihapus dari katalog. Tindakan ini tidak
              dapat dibatalkan.
            </p>

            <form action={formAction} className="mt-7">
              <input
                type="hidden"
                name="productId"
                value={productId}
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setConfirmOpen(false)}
                  className="min-h-12 rounded-full border border-white/15 px-4 py-3 text-xs tracking-[0.14em] text-white/70 transition-colors hover:border-white/40 hover:text-white disabled:opacity-40"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={pending}
                  className="min-h-12 rounded-full border border-red-500 bg-red-600 px-4 py-3 text-xs tracking-[0.14em] text-white transition-colors hover:bg-red-500 disabled:cursor-wait disabled:opacity-60"
                >
                  {pending ? "DELETING..." : "DELETE"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {resultOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-result-title"
            aria-describedby="delete-result-message"
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#08090c] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.8)] sm:p-8"
          >
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border text-2xl ${
                state.success
                  ? "border-[#4169ff]/40 bg-[#0b2cb1]/20 text-[#a9baff]"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              {state.success ? "✓" : "!"}
            </div>

            <p
              className={`mt-5 text-center text-[10px] tracking-[0.3em] ${
                state.success ? "text-[#8da5ff]" : "text-red-300"
              }`}
            >
              STILERA / {state.success ? "SUCCESS" : "ERROR"}
            </p>

            <h2
              id="delete-result-title"
              className="mt-3 text-center font-display text-2xl tracking-[0.08em] text-white"
            >
              {state.success ? "PRODUCT DELETED" : "DELETE FAILED"}
            </h2>

            <p
              id="delete-result-message"
              className="mt-3 text-center text-sm leading-6 text-white/55"
            >
              {state.message}
            </p>

            <button
              type="button"
              onClick={closeResult}
              className="mt-7 min-h-12 w-full rounded-full border border-[#4169ff]/60 bg-[#0b2cb1]/20 px-5 py-3 text-xs tracking-[0.18em] text-white transition-colors hover:border-[#7290ff] hover:bg-[#0b2cb1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7290ff]"
            >
              {state.success ? "CONTINUE" : "CLOSE"}
            </button>
          </section>
        </div>
      )}
    </>
  );
}
