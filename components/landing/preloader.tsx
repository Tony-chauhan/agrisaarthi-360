"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useMotion } from "./motion/motion-provider";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * PRELOADER — a field-row line draws across, then the wordmark reveals.
 * Gate = fonts ready + critical hero image decoded, clamped between a
 * minimum (~800ms) and a hard maximum (~1.6s) so a slow or broken asset
 * can never trap the user. Skipped entirely for reduced motion.
 */

const MIN_MS = 800;
const MAX_MS = 1600;

export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotion();
  const { t } = useLanguage();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.setAttribute("data-loaded", "true");
      setDone(true);
      return;
    }

    document.documentElement.style.overflow = "hidden";
    const started = performance.now();

    const lineAnim = gsap.fromTo(
      lineRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.1, ease: "power2.inOut", transformOrigin: "left center" }
    );

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      const remaining = Math.max(0, MIN_MS - (performance.now() - started));
      window.setTimeout(() => {
        document.documentElement.setAttribute("data-loaded", "true");
        document.documentElement.style.overflow = "";
        gsap.to(lineAnim, { timeScale: 3 });
        gsap.to(rootRef.current, {
          yPercent: -100,
          duration: 0.7,
          ease: "power4.inOut",
          onComplete: () => setDone(true),
        });
      }, remaining);
    };

    const hero = document.querySelector<HTMLImageElement>("img[data-hero-critical]");
    const assets: Promise<unknown>[] = [document.fonts?.ready ?? Promise.resolve()];
    if (hero && !hero.complete) {
      assets.push(
        new Promise((resolve) => {
          hero.addEventListener("load", resolve, { once: true });
          hero.addEventListener("error", resolve, { once: true });
        })
      );
    }
    Promise.all(assets).then(finish);
    const timeout = window.setTimeout(finish, MAX_MS);

    return () => {
      lineAnim.kill();
      window.clearTimeout(timeout);
      document.documentElement.style.overflow = "";
    };
  }, [reducedMotion]);

  if (done || reducedMotion) return null;

  const chainWords = [
    t.landing.chain.farm,
    t.landing.chain.decision,
    t.landing.chain.action,
    t.landing.chain.plan,
    t.landing.chain.proof,
  ];

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-preloader
      className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-canopy-950"
    >
      {/* Field rows */}
      <div className="absolute inset-x-10 top-1/2 h-px -translate-y-16 bg-gradient-to-r from-transparent via-canopy-600/60 to-transparent" />
      <div className="absolute inset-x-10 top-1/2 h-px translate-y-10 bg-gradient-to-r from-transparent via-canopy-600/40 to-transparent" />

      {/* Growing row line */}
      <div className="absolute inset-x-16 top-1/2 h-[2px] -translate-y-4 overflow-hidden rounded-full bg-canopy-800">
        <div ref={lineRef} className="h-full w-full origin-left bg-sprout-400" />
      </div>

      <p className="relative z-10 overflow-hidden font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        <span className="block px-2 pb-1">{t.landing.preloader.brandLines[0]}</span>
      </p>
      <p className="relative z-10 overflow-hidden font-display text-4xl font-semibold tracking-tight text-sprout-400 sm:text-5xl">
        <span className="block px-2 pb-1">{t.landing.preloader.brandLines[1]}</span>
      </p>
      {/* The product chain — the preloader's motif is the story itself */}
      <p className="relative z-10 mt-4 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-canopy-300">
        {chainWords.map((word, i) => (
          <span key={word} className="flex items-center gap-2">
            <span style={{ animationDelay: `${i * 140}ms` }} className="chain-word">
              {word}
            </span>
            {i < chainWords.length - 1 ? (
              <span aria-hidden className="h-3 w-px bg-canopy-700" />
            ) : null}
          </span>
        ))}
      </p>
      <p className="relative z-10 mt-3 text-[11px] font-medium uppercase tracking-[0.22em] text-canopy-300">
        {t.landing.preloader.subline}
      </p>
    </div>
  );
}
