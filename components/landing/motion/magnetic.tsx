"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMotion } from "./motion-provider";

/**
 * MAGNETIC — premium CTA micro-interaction (desktop high tier only).
 * Pointer position feeds gsap.quickTo on transforms — never React state.
 * Falls back to a plain wrapper everywhere else.
 */
export function Magnetic({
  children,
  strength = 0.28,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const { tier, reducedMotion } = useMotion();
  const enabled = tier === "high" && !reducedMotion;

  if (!enabled) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: "inline-block" }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" })(relX * strength);
        gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" })(relY * strength);
      }}
      onPointerLeave={() => {
        const el = ref.current;
        if (!el) return;
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)", overwrite: "auto" });
      }}
    >
      {children}
    </span>
  );
}
