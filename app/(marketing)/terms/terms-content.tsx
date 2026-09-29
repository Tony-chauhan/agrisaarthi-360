"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";

/** Bilingual body of the terms page — the page file itself stays a
 * server component so metadata remains static. Section ids are index
 * based so they never depend on the active language. */
export function TermsContent() {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="eyebrow">AgriSaarthi 360</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-canopy-950 sm:text-4xl">
        {t.terms.title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-loam-700">
        {t.terms.intro}
      </p>

      <div className="mt-10 flex flex-col gap-6">
        {t.terms.sections.map((section, i) => (
          <section
            key={section.title}
            className="card-surface p-6"
            aria-labelledby={`terms-section-${i}`}
          >
            <h2
              id={`terms-section-${i}`}
              className="font-display text-xl font-semibold text-canopy-950"
            >
              {section.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-loam-700">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm text-loam-600">
        {t.terms.contactPrefix}
        <a
          href="mailto:hello@agrisaarthi.example"
          className="font-medium text-terracotta-600 underline-offset-2 hover:underline"
        >
          hello@agrisaarthi.example
        </a>
        {t.terms.contactSuffix}
        <Link
          href="/"
          className="font-medium text-terracotta-600 underline-offset-2 hover:underline"
        >
          {t.terms.landingLink}
        </Link>
        .
      </p>
    </main>
  );
}
