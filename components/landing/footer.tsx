import Link from "next/link";
import { Sprout } from "lucide-react";
import { BRAND, FOOTER } from "./copy";

/** Minimal premium footer — dark, quiet, honest, correctly anchored. */
export function LandingFooter() {
  return (
    <footer className="bg-canopy-950 text-canopy-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <span className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-canopy-800 text-white ring-1 ring-canopy-700">
                <Sprout className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-display text-lg font-semibold text-white">
                {BRAND.name.replace(" 360", "")}{" "}
                <span className="text-sprout-400">360</span>
              </span>
            </span>
            <p className="text-sm text-canopy-200/90">{BRAND.tagline}</p>
            <p aria-hidden className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-canopy-300/70">
              {BRAND.chain.join(" · ")}
            </p>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-canopy-300/80">
              {FOOTER.disclaimer}
            </p>
          </div>

          {/* Explore */}
          <nav aria-label="Footer navigation">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-canopy-300">
              Explore
            </p>
            <ul className="mt-3 flex flex-col gap-1">
              {FOOTER.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-9 items-center text-sm text-canopy-100 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Get started + legal */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-canopy-300">
              Get started
            </p>
            <div className="mt-3 flex flex-col items-start gap-2">
              <Link
                href="/farm-profile"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-terracotta-600 px-5 text-sm font-medium text-white transition-colors hover:bg-terracotta-700"
              >
                Add Your Farm
              </Link>
            </div>
            <ul className="mt-5 flex flex-col gap-1">
              {FOOTER.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-9 items-center text-sm text-canopy-200 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-canopy-800 pt-6 text-xs text-canopy-300/80">
          © {new Date().getFullYear()} AgriSaarthi 360 · Smart Agriculture
          Platform
        </div>
      </div>
    </footer>
  );
}
