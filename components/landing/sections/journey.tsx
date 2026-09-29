"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, MoveRight } from "lucide-react";
import { gsap, ensureGsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";
import { useMotion } from "../motion/motion-provider";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * HOW IT WORKS — the signature pinned section, typography-led.
 * Vertical scroll scrubs into horizontal movement through the five
 * stages FARM → DECISION → ACTION → PLAN → PROOF. Each stage is set in
 * large editorial type with its real capability, detail and destination —
 * no photography. Runs only where it is genuinely good (motion-capable
 * tiers); everywhere else the same five stages stack vertically with
 * full content parity. Uses the canonical GSAP module (lib/gsap).
 */
const STAGE_HREFS = [
  "/farm-profile",
  "/crop-advisor",
  "/weather",
  "/planner",
  "/timeline",
] as const;
export function Journey() {
  const { tier, reducedMotion } = useMotion();
  const { t } = useLanguage();
  const L = t.landing;
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const pinned = tier !== "low" && tier !== "none" && !reducedMotion;

  useGSAP(
    () => {
      if (!pinned) return;
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      ensureGsap();

      const distance = () => Math.max(0, track.scrollWidth - section.clientWidth);

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const progress = gsap.to(progressRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        progress.scrollTrigger?.kill();
        progress.kill();
      };
    },
    { scope: sectionRef, dependencies: [pinned] }
  );

  return (
    <section
      ref={sectionRef}
      id="journey"
      aria-labelledby="journey-heading"
      className="section-anchor relative overflow-hidden bg-canopy-950 py-24 text-white lg:py-0"
    >
      <div className={pinned ? "flex h-svh flex-col justify-center" : ""}>
        {/* Header */}
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 lg:pb-8 lg:pt-6">
          <Reveal>
            <p className="eyebrow text-lime">
              <span aria-hidden className="h-px w-8 bg-lime" />
              {L.journey.eyebrow}
            </p>
          </Reveal>
          <SplitText
            id="journey-heading"
            as="h2"
            lines={[L.journey.headline]}
            className="mt-3 font-display text-3xl font-semibold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl"
          />
          <Reveal delay={140}>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-canopy-200 sm:text-base">
              {L.journey.body}
              {pinned ? (
                <span className="ml-2 inline-flex items-center gap-1 text-canopy-300">
                  {L.journeyKeepScrolling}{" "}
                  <MoveRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              ) : null}
            </p>
          </Reveal>
          {/* Scrub progress rail (pinned layout only) */}
          <div aria-hidden className="mt-8 hidden h-px w-full bg-white/10 lg:block">
            <span
              ref={progressRef}
              className="journey-progress block h-px w-full origin-left scale-x-0 bg-lime"
            />
          </div>
        </div>

        {/* Track — horizontal when pinned, stacked otherwise */}
        <div
          ref={trackRef}
          className={
            pinned
              ? "mt-4 flex w-max items-stretch gap-12 px-4 will-change-transform sm:px-6 lg:mt-8 lg:gap-20 lg:px-8"
              : "mx-auto mt-12 flex w-full max-w-7xl flex-col gap-14 px-4 sm:px-6 lg:px-8"
          }
        >
          {L.journey.stages.map((stage, i) => (
            <article
              key={stage.name}
              className={
                pinned
                  ? "flex w-[82vw] shrink-0 flex-col justify-between gap-6 border-l border-white/10 pl-8 first:border-l-0 first:pl-0 sm:w-[58vw] lg:w-[34rem] lg:pl-12"
                  : "flex flex-col justify-between gap-5 border-t border-white/10 pt-8"
              }
            >
              <div>
                <div className="flex items-baseline justify-between gap-6">
                  <span
                    aria-hidden
                    className="font-display text-[5.5rem] font-semibold leading-[0.8] text-white/10 sm:text-[8rem]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-lime">
                    {stage.capability}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
                  {stage.name}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-canopy-200 sm:text-base">
                  {stage.detail}
                </p>
              </div>
              <Link
                href={STAGE_HREFS[i] ?? "/dashboard"}
                className="group inline-flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-sprout-400 transition-colors hover:text-white"
              >
                {stage.link}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
