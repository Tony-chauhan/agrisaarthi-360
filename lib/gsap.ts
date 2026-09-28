"use client";

/**
 * CANONICAL GSAP MODULE — the single source of truth for GSAP in this app.
 *
 * Every component imports `gsap` and `ScrollTrigger` FROM HERE — never
 * directly from "gsap" / "gsap/ScrollTrigger". This guarantees:
 *
 * 1. ONE GSAP INSTANCE — all consumers resolve to the same module object,
 *    so tweens, plugins and ScrollTrigger share one registry.
 * 2. REGISTRATION EXACTLY ONCE, BEFORE ANY USE — module evaluation runs
 *    before any component effect, so by the time any ScrollTrigger.create()
 *    happens, ScrollTrigger.register(gsap) has already completed and
 *    ScrollTrigger.enable() has initialized its internals (including the
 *    instance-constructor's _context hook). This is the fix for the
 *    "_context is not a function" crash.
 * 3. SSR-SAFE — registration is inert during server rendering.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* Registered exactly once, at module evaluation — before any consumer
   can possibly call ScrollTrigger.create(). Inert on the server.
   (gsap.registerPlugin is idempotent; the flag keeps it provably once.) */
let registered = false;
if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

/**
 * Belt-and-braces guard: call immediately before any imperative
 * ScrollTrigger.create() so registration is provably complete even if a
 * future refactor removes the module-level registration.
 */
export function ensureGsap(): void {
  if (typeof window === "undefined" || registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export { gsap, ScrollTrigger };

/* QA diagnostic hook (namespaced): lets runtime checks count ScrollTriggers
   and prove there is exactly one registry without polluting common globals. */
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__AGRISAARTHI_GSAP__ = {
    gsap,
    ScrollTrigger,
  };
}
