"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, ensureGsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";

/**
 * MOTION PROVIDER — one animation clock for the whole landing page.
 *
 * - Lenis smooth scroll is driven by the GSAP ticker (never its own rAF).
 * - Lenis emits "scroll" → ScrollTrigger.update (never a competing system).
 * - All component animation runs through useGSAP / gsap.context.
 * - React state is used only for slow-changing capability info (tier,
 *   reduced-motion) — never for per-frame values.
 *
 * GSAP + ScrollTrigger come from the canonical lib/gsap module and are
 * registered exactly once there, before any ScrollTrigger.create().
 */

export type MotionTier = "high" | "medium" | "low" | "none";

interface MotionState {
  tier: MotionTier;
  reducedMotion: boolean;
}

const MotionContext = createContext<MotionState>({
  tier: "high",
  reducedMotion: false,
});

export function useMotion() {
  return useContext(MotionContext);
}

function detectTier(): MotionTier {
  if (typeof window === "undefined") return "high";
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    if (!gl) return "none";
  } catch {
    return "none";
  }
  if (coarse && (cores <= 4 || memory <= 3)) return "low";
  if (coarse) return "medium";
  if (cores <= 4 || memory <= 4) return "medium";
  return "high";
}

let lenisInstance: Lenis | null = null;
/** Access the shared Lenis instance (used by page transitions to pause smooth scroll). */
export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  const [state, setState] = useState<MotionState>({
    tier: "high",
    reducedMotion: false,
  });

  /* Capability detection — once, slow-changing. */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tier = reduced ? "none" : detectTier();
    setState({ tier, reducedMotion: reduced });
    document.documentElement.setAttribute("data-motion-tier", tier);
    document.documentElement.setAttribute(
      "data-reduced-motion",
      reduced ? "true" : "false"
    );
  }, []);

  /* Lenis ⇄ GSAP single clock (landing only). */
  useEffect(() => {
    ensureGsap();
    if (!isLanding || state.reducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    lenisInstance = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /* Anchor links stay functional through the smooth layer. */
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -72 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [isLanding, state.reducedMotion]);

  /* ScrollTrigger recalculation after fonts/layout settle. */
  useEffect(() => {
    if (!isLanding) return;
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => window.clearTimeout(t);
  }, [isLanding]);

  const value = useMemo(() => state, [state]);

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}
