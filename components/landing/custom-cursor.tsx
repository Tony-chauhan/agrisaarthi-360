"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMotion } from "./motion/motion-provider";

/**
 * CUSTOM CURSOR — desktop-only, elegant, quiet.
 * A small ring follows the pointer via gsap.quickTo (no React state per
 * frame); hovering [data-cursor="view|open|drag"] elements swaps in a
 * tiny label. Disabled for touch, reduced motion and non-high tiers.
 * aria-hidden: it never replaces the real cursor for AT.
 */

const LABELS: Record<string, string> = {
  view: "View",
  open: "Open",
  drag: "Drag",
};

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const { tier, reducedMotion } = useMotion();
  const enabled = tier === "high" && !reducedMotion;

  useEffect(() => {
    if (!enabled) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const dot = dotRef.current;
    const label = labelRef.current;
    if (!dot || !label) return;

    gsap.set(dot, { xPercent: -50, yPercent: -50, scale: 0 });
    const xTo = gsap.quickTo(dot, "x", { duration: 0.32, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.32, ease: "power3.out" });

    let shown = false;
    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      if (!shown) {
        shown = true;
        gsap.to(dot, { scale: 1, duration: 0.35, ease: "power2.out" });
      }

      const target = (e.target as HTMLElement | null)?.closest?.(
        "[data-cursor]"
      ) as HTMLElement | null;
      if (target) {
        const key = target.getAttribute("data-cursor") ?? "";
        label.textContent = LABELS[key] ?? "";
        gsap.to(dot, { scale: 2.1, backgroundColor: "rgba(38,69,52,0.12)", duration: 0.25 });
        gsap.to(label, { opacity: 1, duration: 0.2 });
      } else {
        gsap.to(dot, { scale: 1, backgroundColor: "rgba(38,69,52,0.85)", duration: 0.25 });
        gsap.to(label, { opacity: 0, duration: 0.15 });
      }
    };
    const onLeave = () => {
      shown = false;
      gsap.to(dot, { scale: 0, duration: 0.3 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[85] hidden h-10 w-10 items-center justify-center rounded-full border border-canopy-800/70 lg:flex"
      style={{ backgroundColor: "rgba(38,69,52,0.85)", mixBlendMode: "normal" }}
    >
      <span
        ref={labelRef}
        className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white opacity-0"
      />
    </div>
  );
}
