"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, MoveDown } from "lucide-react";
import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";
import { Magnetic } from "../motion/magnetic";
import { Parallax } from "../motion/parallax";
import { PHOTOS } from "../photography/manifest";
import { useMotion } from "../motion/motion-provider";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * HERO — one cinematic photograph, editorial typography, and a quiet
 * context-flow graphic: Farm Context → Crop Decision → Weather Action.
 * No floating dashboard, no cards-on-photo clutter — the flow is a real
 * product story using the app's labeled sample values.
 */
export function Hero() {
  const photo = PHOTOS["heroWheatSunrise"];
  const { reducedMotion } = useMotion();
  const { t } = useLanguage();
  const L = t.landing;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-canopy-950"
    >
      {/* Single hero photograph with parallax depth */}
      <Parallax speed={0.28} className="absolute inset-0">
        <div className="absolute inset-[-12%]">
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            priority
            data-hero-critical
            sizes="100vw"
            className="h-full w-full object-cover will-change-transform"
            style={{ filter: "saturate(1.05) contrast(1.02) brightness(0.98)" }}
          />
        </div>
      </Parallax>
      {/* Legibility scrims — structure, never a color cast */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-canopy-950/85 via-canopy-950/40 to-canopy-950/15" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-canopy-950 via-canopy-950/20 to-canopy-950/30" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-14 px-4 pb-24 pt-36 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:gap-10 lg:px-8">
        {/* Copy block */}
        <div>
          <Reveal>
            <p className="eyebrow text-lime">
              <span aria-hidden className="h-px w-8 bg-lime" />
              {L.hero.eyebrow}
            </p>
          </Reveal>

          <SplitText
            id="hero-heading"
            as="h1"
            lines={[...L.hero.headlineLines]}
            playOn="load"
            stagger={0.16}
            className="mt-6 font-display text-[3.2rem] font-semibold leading-[0.98] tracking-tight text-white sm:text-7xl lg:text-[5.6rem]"
          />

          <Reveal delay={320}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-canopy-100/85">
              {L.hero.support}
            </p>
          </Reveal>

          <Reveal delay={420}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Link
                  href="/farm-profile"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-terracotta-600 px-8 text-base font-semibold text-white shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:bg-terracotta-700"
                >
                  {L.addYourFarm}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Magnetic>
              <Link
                href="#problem"
                className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/35 px-7 text-base font-medium text-white transition-colors duration-200 hover:border-white hover:bg-white/10"
              >
                {L.exploreHow}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={520}>
            <p className="mt-8 text-sm text-canopy-100/60">
              {L.hero.subline}
            </p>
          </Reveal>
        </div>

        {/* Editorial context flow — the product in three lines */}
        <Reveal delay={600} className="lg:justify-self-end">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-canopy-950/45 p-6 backdrop-blur-sm">
            <ol aria-label={L.hero.contextFlowAria} className="flex flex-col">
              {L.hero.contextFlow.map((row, i) => (
                <li key={row.label} className="flex flex-col">
                  <div className="flex items-baseline gap-3 py-1.5">
                    <span
                      aria-hidden
                      className="w-6 shrink-0 text-xs font-semibold tracking-[0.14em] text-lime"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                        {row.label}
                      </span>
                      <span className="block font-display text-lg font-semibold text-white">
                        {row.value}
                      </span>
                    </span>
                  </div>
                  {i < L.hero.contextFlow.length - 1 ? (
                    <span aria-hidden className="flex items-center gap-2 pb-1 pl-6">
                      <span className="h-4 w-px bg-white/20" />
                      <MoveDown className="h-3 w-3 text-lime" />
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t border-white/10 pt-3 text-xs text-white/45">
              {L.hero.sampleNote}
            </p>
          </div>
        </Reveal>
      </div>

      {/* Scroll cue */}
      <div className="relative z-10 flex px-4 pb-8 sm:px-6 lg:px-8">
        <Link
          href="#problem"
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-canopy-100/70 transition-colors hover:text-white"
        >
          {!reducedMotion ? (
            <ArrowDown className="motion-safe:animate-bounce h-4 w-4" aria-hidden />
          ) : null}
          {L.hero.scrollCue}
        </Link>
      </div>
    </section>
  );
}
