
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useShop } from "@/lib/shop-context";
import type { ProductFilter } from "@/data/products";

const navItems: { label: string; filter: ProductFilter }[] = [
  { label: "COLLECTION", filter: "all" },
  { label: "T-SHIRTS", filter: "t-shirts" },
  { label: "TOPS", filter: "tops" },
  { label: "BOTTOMS", filter: "bottoms" },
  { label: "ACCESSORIES", filter: "accessories" },
  { label: "NEW ARRIVALS", filter: "new-arrivals" },
];

export function Navbar() {
  const {
    filter,
    searchQuery,
    setSearchQuery,
    searchOpen,
    setSearchOpen,
    itemCount,
    setBagOpen,
    goToCatalog,
  } = useShop();

  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (searchOpen) {
      searchRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setSearchOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [setSearchOpen]);

  function handleNav(nextFilter: ProductFilter) {
    setSearchOpen(false);
    setMobileOpen(false);
    goToCatalog(nextFilter);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 md:h-20 md:gap-4 md:px-6 xl:px-8">
        {/* Brand */}
        <a
          href="#top"
          aria-label="STILERA Home"
          onClick={() => {
            setFilterToAll();
          }}
          className="flex shrink-0 items-center gap-2 text-white transition-opacity hover:opacity-80 sm:gap-2.5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 sm:h-10 sm:w-10">
            <img
              src="/images/stilera-logo.png"
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-contain"
            />
          </span>

          <span className="whitespace-nowrap font-display text-xl tracking-[0.16em] sm:text-2xl">
            STILERA
          </span>
        </a>

        {/* Desktop navigation */}
        <nav
          className="hidden min-w-0 flex-1 justify-center md:flex"
          aria-label="Primary navigation"
        >
          <div className="flex max-w-full items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            {navItems.map((item) => {
              const isActive = filter === item.filter;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNav(item.filter)}
                  aria-pressed={isActive}
                  className={`shrink-0 rounded-full px-2.5 py-2 font-display text-[10px] tracking-[0.08em] transition-all duration-300 lg:px-3 lg:text-xs lg:tracking-[0.12em] xl:px-4 ${
                    isActive
                      ? "bg-[#0b2cb1] text-white shadow-[0_0_20px_rgba(11,44,177,0.3)]"
                      : "text-white/75 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Search, cart, mobile menu */}
        <div className="flex shrink-0 items-center gap-2 md:gap-2.5">
          <button
            type="button"
            onClick={() => {
              setSearchOpen(!searchOpen);
              setMobileOpen(false);
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 sm:h-10 sm:w-10 ${
              searchOpen
                ? "border-[#0b2cb1] bg-[#0b2cb1]/20 text-white"
                : "border-white/15 bg-white/[0.03] text-white hover:border-[#0b2cb1]"
            }`}
            aria-expanded={searchOpen}
            aria-controls={searchId}
            aria-label="Search products"
          >
            <SearchIcon />
          </button>

          <button
            type="button"
            onClick={() => {
              setBagOpen(true);
              setMobileOpen(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white transition-all duration-300 hover:border-[#0b2cb1] sm:h-10 sm:w-10"
            aria-label={`Open shopping bag${
              itemCount > 0 ? `, ${itemCount} items` : ""
            }`}
          >
            <BagIcon />

            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0b2cb1] px-1 font-display text-[10px] text-white">
                {itemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 md:hidden sm:h-10 sm:w-10 ${
              mobileOpen
                ? "border-[#0b2cb1] bg-[#0b2cb1]/20 text-white"
                : "border-white/15 bg-white/[0.03] text-white"
            }`}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => {
              setMobileOpen((open) => !open);
              setSearchOpen(false);
            }}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="border-t border-white/10 bg-[#050505]/95 px-4 py-4 backdrop-blur-xl md:hidden"
        >
          <nav
            className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => {
              const isActive = filter === item.filter;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNav(item.filter)}
                  aria-pressed={isActive}
                  className={`rounded-full px-3 py-3 text-left font-display text-xs tracking-[0.12em] transition-all duration-300 ${
                    isActive
                      ? "bg-[#0b2cb1] text-white"
                      : "text-white/80 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Search panel */}
      {searchOpen && (
        <div
          id={searchId}
          className="border-t border-white/10 bg-[#050505]/95 px-4 py-4 backdrop-blur-xl md:px-8"
        >
          <div className="mx-auto max-w-[1440px]">
            <label className="sr-only" htmlFor="site-search">
              Search products
            </label>

            <input
              id="site-search"
              ref={searchRef}
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => goToCatalog()}
              placeholder="Search tees, tops, bottoms..."
              className="w-full rounded-full border border-white/15 bg-white/[0.03] px-5 py-3 text-sm tracking-[0.08em] text-white outline-none placeholder:text-white/35 focus:border-[#0b2cb1]"
            />
          </div>
        </div>
      )}
    </header>
  );

  function setFilterToAll() {
    setSearchOpen(false);
    setMobileOpen(false);
    goToCatalog("all");
  }
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" />
      <path d="M16 16l5 5" stroke="currentColor" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 8h12l-1 12H7L6 8Z"
        stroke="currentColor"
        strokeLinejoin="round"
      />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" stroke="currentColor" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" />
    </svg>
  );
}
