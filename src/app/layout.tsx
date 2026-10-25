
import { Suspense } from "react";
import type { Metadata } from "next";
import { Bebas_Neue, Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { LiquidBackground } from "@/components/liquid-background";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

export const metadata: Metadata = {
  title: "STILERA — Fearless Soul",
  description:
    "STILERA is a dark gothic streetwear house. SS26 underground culture, oversized black tees, and fearless souls.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="relative min-h-full bg-[#050505] text-white">
        <Suspense
          fallback={<div className="min-h-screen bg-[#050505]" />}
        >
          <Providers>
            {/* Global Black Liquid WebGL layer */}
            <div
              aria-hidden="true"
              className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            >
              <LiquidBackground intensity={0.85} />
            </div>

            {/* Website content */}
            <div className="relative z-10 min-h-screen">
              {children}
            </div>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
