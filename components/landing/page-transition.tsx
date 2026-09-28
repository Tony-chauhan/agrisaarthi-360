"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";

/**
 * PAGE TRANSITION — an organic emerald wipe between the landing page and
 * workspace routes. Only links marked with [data-nav-transition] use it;
 * browser back/forward and every other navigation stay native and fast.
 */
export function PageTransition() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const reduced = document.documentElement.getAttribute("data-reduced-motion") === "true";
    if (reduced) return;

    let busy = false;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.(
        "a[data-nav-transition]"
      ) as HTMLAnchorElement | null;
      if (!link || busy) return;
      const href = link.getAttribute("href");
      if (!href) return;

      e.preventDefault();
      busy = true;
      gsap
        .timeline({ onComplete: () => (busy = false) })
        .set(overlay, { yPercent: -100, display: "block" })
        .to(overlay, { yPercent: 0, duration: 0.45, ease: "power4.inOut" })
        .add(() => router.push(href))
        .to(overlay, { yPercent: 100, duration: 0.55, ease: "power4.inOut" }, "+=0.08")
        .set(overlay, { display: "none" });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  return (
    <div
      ref={overlayRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[92] hidden bg-canopy-950"
      style={{
        borderRadius: "0 0 48% 48% / 0 0 6% 6%",
      }}
    />
  );
}
