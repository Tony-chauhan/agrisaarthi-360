"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";
import { PHOTOS } from "../photography/manifest";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * CROP HEALTH — the page's second (and final) photographic moment,
 * paired with the restrained upload→analysis→result flow and the
 * product's deliberately conservative language.
 */
export function CropHealth() {
  const photo = PHOTOS["leafMacro"];
  const { t } = useLanguage();
  const L = t.landing;

  return (
    <section
      id="health"
      aria-labelledby="health-heading"
      className="section-anchor bg-white px-4 py-28 sm:px-6 lg:px-8 lg:py-36"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* The single supporting photograph */}
        <Reveal>
          <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl" data-cursor="view">
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <span className="source-tag absolute left-4 top-4 border-white/30 bg-canopy-950/50 text-white backdrop-blur-sm">
              {L.cropHealth.source}
            </span>
          </div>
        </Reveal>

        {/* Copy + flow */}
        <div>
          <Reveal>
            <p className="eyebrow">
              <span aria-hidden className="h-px w-8 bg-terracotta-600" />
              {L.cropHealth.eyebrow}
            </p>
          </Reveal>
          <SplitText
            id="health-heading"
            as="h2"
            lines={[...L.cropHealth.headlineLines]}
            className="mt-6 font-display text-4xl font-semibold leading-[1.02] tracking-tight text-canopy-950 sm:text-6xl"
          />
          <Reveal delay={200}>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-loam-700 sm:text-lg">
              {L.cropHealth.body}
            </p>
          </Reveal>

          {/* Flow */}
          <ol className="mt-10 flex flex-col border-l border-canopy-200 pl-7" aria-label={L.healthFlowAria}>
            {L.cropHealth.flow.map((item, i) => (
              <Reveal key={item.step} delay={i * 90}>
                <li className="relative pb-7 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute -left-[2.06rem] top-1.5 h-2.5 w-2.5 rounded-full bg-terracotta-600 ring-4 ring-white"
                  />
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-canopy-950">
                    {item.step}
                  </p>
                  <p className="mt-0.5 text-sm text-loam-600">{item.note}</p>
                </li>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={280}>
            <p className="mt-8 max-w-lg rounded-xl bg-parchment px-4 py-3 text-xs leading-relaxed text-loam-700">
              {L.cropHealth.caution}
            </p>
          </Reveal>

          <Reveal delay={340}>
            <Link
              href="/crop-health"
              className="group mt-8 inline-flex min-h-12 items-center gap-2 text-base font-semibold text-terracotta-700"
            >
              {L.cropHealth.cta}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
