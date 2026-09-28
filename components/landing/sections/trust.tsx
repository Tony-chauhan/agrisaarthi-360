import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { TRUST } from "../copy";
import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";

/**
 * PROOF & TRANSPARENCY — the page's honesty ledger. Five visible data
 * sources (the tags the product itself uses) and the tamper-evident
 * records capability, stated plainly. Light editorial surface so the
 * dark sections breathe on either side.
 */
export function Trust() {
  return (
    <section
      id="trust"
      aria-labelledby="trust-heading"
      className="section-anchor bg-parchment px-4 py-28 sm:px-6 lg:px-8 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-2xl">
            <Reveal>
              <p className="eyebrow">
                <span aria-hidden className="h-px w-8 bg-terracotta-600" />
                {TRUST.eyebrow}
              </p>
            </Reveal>
            <SplitText
              id="trust-heading"
              as="h2"
              lines={TRUST.headlineLines}
              className="mt-6 font-display text-4xl font-semibold leading-[1.02] tracking-tight text-canopy-950 sm:text-6xl lg:text-7xl"
            />
          </div>
          <Reveal delay={200}>
            <p className="max-w-md text-base leading-relaxed text-loam-700 sm:text-lg">
              {TRUST.body}
            </p>
          </Reveal>
        </div>

        {/* The five real sources */}
        <ul
          aria-label="Data sources used by AgriSaarthi 360"
          className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-canopy-200 bg-canopy-200 sm:grid-cols-2 lg:grid-cols-5"
        >
          {TRUST.sources.map((source, i) => (
            <Reveal key={source.label} delay={i * 70} className="h-full">
              <li className="flex h-full flex-col gap-2 bg-white p-6">
                <span className="source-tag self-start border-canopy-200 bg-canopy-50 text-canopy-700">
                  {source.label}
                </span>
                <p className="text-sm leading-relaxed text-loam-700">{source.body}</p>
              </li>
            </Reveal>
          ))}
        </ul>

        {/* Verified records */}
        <Reveal delay={160}>
          <div className="mt-12 flex flex-wrap items-start justify-between gap-8 rounded-2xl bg-emerald-ink px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="max-w-2xl">
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-lime">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                {TRUST.recordsTitle}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                {TRUST.recordsBody}
              </p>
            </div>
            <Link
              href={TRUST.recordsCta.href}
              className="group inline-flex min-h-12 items-center gap-2 self-center text-base font-semibold text-lime"
            >
              {TRUST.recordsCta.label}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
