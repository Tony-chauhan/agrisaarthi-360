"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, ensureGsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/cn";
import { useMotion } from "./motion-provider";

/**
 * PARALLAX — photographic depth layer. The child (usually a next/image
 * fill) drifts at its own speed while scrolling. Transform-only, scrubbed,
 * disabled for reduced motion and low tiers. One ScrollTrigger per layer.
 */
export function Parallax({
  children,
  speed = 0.12,
  className,
}: {
  children: React.ReactNode;
  /** Positive = moves slower than scroll (background). Negative = faster (foreground). */
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { tier, reducedMotion } = useMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (reducedMotion || tier === "none" || tier === "low") return;

      /* Canonical registration is guaranteed before ScrollTrigger.create(). */
      ensureGsap();

      /* Amplitude as % of the layer's own height: ±(speed×40)%. Capped so
         the overscan in DepthImage (-14%) always covers the travel — the
         photo edge can never peek out at scroll extremes. */
      const distance = Math.round(speed * 80 * 10) / 10;
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        animation: gsap.fromTo(
          el,
          { yPercent: -distance / 2 },
          {
            yPercent: distance / 2,
            ease: "none",
            overwrite: "auto",
          }
        ),
      });
      return () => st.kill();
    },
    { scope: ref, dependencies: [speed, tier, reducedMotion] }
  );

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
