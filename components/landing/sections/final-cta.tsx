"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";
import { Magnetic } from "../motion/magnetic";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * FINAL CTA — pure typography. The three-line statement is the visual;
 * a controlled golden-hour gradient supplies atmosphere without a single
 * photograph. One magnetic primary action; nothing competing.
 */
export function FinalCta() {
  const { t } = useLanguage();
  const L = t.landing;

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="section-anchor relative isolate overflow-hidden bg-canopy-950"
    >
      {/* Golden-hour atmosphere — gradients, no photography */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-x-0 bottom-[-30%] h-[70%] rounded-[100%] bg-harvest-500/15 blur-3xl" />
        <div className="absolute left-1/2 top-[-20%] h-[55%] w-[80%] -translate-x-1/2 rounded-[100%] bg-sprout-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-canopy-950 via-transparent to-canopy-950/80" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 py-32 text-center sm:px-6 lg:py-44">
        <SplitText
          id="final-cta-heading"
          as="h2"
          lines={[...L.finalCta.headlineLines]}
          className="font-display text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-7xl lg:text-8xl"
        />
        <Reveal delay={200}>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-canopy-100/85 sm:text-lg">
            {L.finalCta.support}
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <Link
                href="/farm-profile"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-terracotta-600 px-8 text-base font-semibold text-white shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:bg-terracotta-700"
              >
                {L.finalCta.primary}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Magnetic>
            <Link
              href="/#journey"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/35 px-7 text-base font-medium text-white transition-colors duration-200 hover:border-white hover:bg-white/10"
            >
              {L.finalCta.secondary}
            </Link>
          </div>
        </Reveal>
        <Reveal delay={380}>
          <p className="mt-10 text-xs text-canopy-100/50">{L.finalCtaNote}</p>
        </Reveal>
      </div>
    </section>
  );
}
