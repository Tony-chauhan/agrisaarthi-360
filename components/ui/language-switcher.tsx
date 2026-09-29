"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { LANGUAGES } from "@/lib/i18n/types";
import { cn } from "@/lib/cn";

/**
 * Accessible language switcher — renders as "English | हिन्दी".
 *
 * - aria-pressed communicates the active language to screen readers.
 * - Fully keyboard operable (native buttons); focus ring comes from the
 *   global :focus-visible style.
 * - Both labels are always visible so the control works in either language.
 * - `variant="dark"` restyles the control for the dark landing navbar
 *   (same markup, same behavior — only surface colors change).
 */
export function LanguageSwitcher({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const { lang, setLang } = useLanguage();

  const base =
    variant === "dark"
      ? "inline-flex items-center gap-0.5 rounded-xl border border-white/25 bg-white/10 px-2 py-1 text-xs font-medium text-white/80"
      : "inline-flex items-center gap-0.5 text-xs font-medium text-loam-600";
  const divider =
    variant === "dark" ? "px-1 text-white/30" : "px-1 text-loam-300";
  const active =
    variant === "dark"
      ? "rounded-lg bg-lime/20 px-1.5 py-1 font-semibold text-lime ring-1 ring-lime/40"
      : "rounded px-1.5 py-1 font-semibold text-canopy-800";
  const inactive =
    variant === "dark"
      ? "rounded-lg px-1.5 py-1 text-white/70 hover:bg-white/10 hover:text-white"
      : "rounded px-1.5 py-1 text-loam-500 hover:text-canopy-700";

  return (
    <div
      role="group"
      aria-label="Language / भाषा"
      className={cn(base, className)}
    >
      {LANGUAGES.map((entry, index) => (
        <span key={entry.id} className="inline-flex items-center">
          {index > 0 && (
            <span aria-hidden="true" className={divider}>
              |
            </span>
          )}
          <button
            type="button"
            aria-pressed={lang === entry.id}
            onClick={() => setLang(entry.id)}
            className={cn("cursor-pointer transition-colors", lang === entry.id ? active : inactive)}
          >
            {entry.nativeLabel}
          </button>
        </span>
      ))}
    </div>
  );
}
