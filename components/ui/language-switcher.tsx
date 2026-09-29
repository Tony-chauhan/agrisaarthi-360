"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { LANGUAGES } from "@/lib/i18n/types";

/**
 * Accessible language switcher — renders as "English | हिन्दी".
 *
 * - aria-pressed communicates the active language to screen readers.
 * - Fully keyboard operable (native buttons); focus ring comes from the
 *   global :focus-visible style.
 * - Both labels are always visible so the control works in either language.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language / भाषा"
      className={
        className ??
        "inline-flex items-center gap-0.5 text-xs font-medium text-loam-600"
      }
    >
      {LANGUAGES.map((entry, index) => (
        <span key={entry.id} className="inline-flex items-center">
          {index > 0 && (
            <span aria-hidden="true" className="px-1 text-loam-300">
              |
            </span>
          )}
          <button
            type="button"
            aria-pressed={lang === entry.id}
            onClick={() => setLang(entry.id)}
            className={
              lang === entry.id
                ? "rounded px-1.5 py-1 font-semibold text-canopy-800"
                : "rounded px-1.5 py-1 text-loam-500 hover:text-canopy-700"
            }
          >
            {entry.nativeLabel}
          </button>
        </span>
      ))}
    </div>
  );
}
