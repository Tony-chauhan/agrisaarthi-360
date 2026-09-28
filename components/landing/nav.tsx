"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Sprout } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { label: "Product", href: "/#system" },
  { label: "How It Works", href: "/#journey" },
  { label: "Intelligence", href: "/#intelligence" },
  { label: "About", href: "/#trust" },
] as const;

/**
 * Refined premium navigation — translucent over the hero, solid surface
 * once scrolled. One conversion action: Add Your Farm. No Sign In — no
 * authentication system exists and none is implied.
 */
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || menuOpen
          ? "border-b border-white/10 bg-canopy-950/85 backdrop-blur"
          : "border-b border-transparent bg-gradient-to-b from-canopy-950/50 to-transparent"
      )}
    >
      <nav
        aria-label="Landing navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        {/* Brand */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-offset-4"
          aria-label="AgriSaarthi 360 — home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lime ring-1 ring-white/15">
            <Sprout className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-white">
            AgriSaarthi <span className="text-lime">360</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="group relative inline-flex min-h-11 items-center text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                {link.label}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-3 h-px origin-left scale-x-0 bg-lime transition-transform duration-200 group-hover:scale-x-100"
                />
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden shrink-0 md:block">
          <Link
            href="/farm-profile"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-terracotta-600 px-5 text-sm font-semibold text-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-terracotta-700 hover:shadow-lift"
          >
            Add Your Farm
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/20 text-white"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen ? (
        <div
          id="landing-mobile-nav"
          className="border-t border-white/10 bg-canopy-950/95 px-4 pb-5 pt-2 backdrop-blur md:hidden"
        >
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            href="/farm-profile"
            onClick={() => setMenuOpen(false)}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-terracotta-600 px-4 text-sm font-semibold text-white"
          >
            Add Your Farm
          </Link>
        </div>
      ) : null}
    </header>
  );
}
