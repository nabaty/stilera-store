
const socialLinks = [
  {
    name: "INSTAGRAM",
    href: "https://www.instagram.com/",
  },
  {
    name: "TIKTOK",
    href: "https://www.tiktok.com/",
  },
  {
    name: "SHOPEE",
    href: "https://shopee.co.id/",
  },
];

export function SiteFooter() {
  return (
    <footer className="liquid-footer relative isolate overflow-hidden px-4 py-10 md:px-8 md:py-14">
      <div className="relative z-10 mx-auto max-w-[1440px]">
        <div className="grid gap-10 border-b border-white/10 pb-8 sm:grid-cols-2 sm:items-end">
          <div>
            <a
              href="#top"
              className="inline-block font-display text-3xl tracking-[0.18em] text-white transition-colors duration-300 hover:text-[#0b2cb1]"
            >
              STILERA
            </a>

            <p className="mt-2 text-xs tracking-[0.24em] text-white/45">
              UNDERGROUND CULTURE / JAKARTA
            </p>

            <p className="mt-5 max-w-sm text-sm leading-6 text-white/40">
              Fearless souls. Independent expression.
              A different uniform for a different mindset.
            </p>
          </div>

          <div className="sm:justify-self-end">
            <p className="mb-4 text-[10px] tracking-[0.3em] text-white/40">
              FOLLOW STILERA
            </p>

            <nav
              aria-label="Social media"
              className="flex flex-wrap gap-3"
            >
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 px-4 py-2.5 font-display text-xs tracking-[0.16em] text-white/75 transition-all duration-300 hover:border-[#0b2cb1] hover:bg-[#0b2cb1]/10 hover:text-[#0b2cb1]"
                >
                  {social.name}
                  <span className="ml-2" aria-hidden="true">
                    ↗
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-[10px] tracking-[0.16em] text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 STILERA. ALL RIGHTS RESERVED.
          </p>
          <p>SS26 LOOKBOOK · UNDERGROUND CULTURE</p>
        </div>
      </div>
    </footer>
  );
}
