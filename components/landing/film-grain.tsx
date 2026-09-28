"use client";

import { useMotion } from "./motion/motion-provider";

/**
 * FILM GRAIN — barely-there editorial texture over photography.
 * A static SVG turbulence tile at very low opacity; no animation cost.
 * Hidden on low-capability devices and for reduced-motion users.
 */
const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

export function FilmGrain() {
  const { tier, reducedMotion } = useMotion();
  if (tier === "low" || tier === "none" || reducedMotion) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[80] opacity-[0.05] mix-blend-multiply"
      style={{ backgroundImage: GRAIN_URI, backgroundSize: "160px 160px" }}
    />
  );
}
