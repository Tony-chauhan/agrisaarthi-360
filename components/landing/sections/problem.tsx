"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, ensureGsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * THE PROBLEM — pure typography. The fragmented chain draws itself
 * (GSAP, once, on scroll), then resolves into one connected statement.
 * No photographs, no cards.
 */
export function Problem() {
  const rootRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();
  const L = t.landing;

  useGSAP(
    () => {
      if (document.documentElement.getAttribute("data-reduced-motion") === "true") return;
      const root = rootRef.current;
      if (!root) return;
      ensureGsap();

      const line = root.querySelector<HTMLElement>(".fragment-line");
      const chips = root.querySelectorAll<HTMLElement>(".fragment-chip");
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 70%", once: true },
      });
      tl.fromTo(
        chips,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.09, ease: "power2.out" }
      ).fromTo(
        line,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, ease: "power2.inOut" },
        "-=0.3"
      );
      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id="problem"
      aria-labelledby="problem-heading"
      className="section-anchor bg-parchment px-4 py-28 sm:px-6 lg:px-8 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="eyebrow">{L.problem.eyebrow}</p>
        </Reveal>

        <SplitText
          id="problem-heading"
          as="h2"
          lines={[...L.problem.statementLines]}
          className="mt-6 max-w-5xl font-display text-4xl font-semibold leading-[1.04] tracking-tight text-canopy-950 sm:text-6xl lg:text-7xl"
        />

        {/* Fragmented chain → drawn connector */}
        <div className="mt-20 md:pl-[12%]">
          <Reveal>
            <ul aria-label={L.fragmentsAria} className="flex flex-wrap gap-x-8 gap-y-3">
              {L.problem.fragments.map((fragment, i) => (
                <li
                  key={fragment}
                  className="fragment-chip flex items-center gap-8 text-sm font-semibold uppercase tracking-[0.18em] text-loam-600"
                >
                  {fragment}
                  {i < L.problem.fragments.length - 1 ? (
                    <span aria-hidden className="h-1 w-1 rounded-full bg-loam-400" />
                  ) : null}
                </li>
              ))}
            </ul>
            <div aria-hidden className="mt-6 h-px w-full max-w-2xl origin-left bg-canopy-300">
              <span className="fragment-line block h-px w-full origin-left bg-terracotta-600" />
            </div>
          </Reveal>
        </div>

        {/* Resolution */}
        <div className="mt-24 lg:pl-[28%]">
          <SplitText
            as="p"
            lines={[L.problem.conclusion]}
            className="font-display text-4xl font-semibold tracking-tight text-emerald-ink sm:text-6xl"
          />
          <Reveal delay={200}>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-loam-700">
              {L.resolutionBody}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
