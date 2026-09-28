"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, ensureGsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/cn";

/**
 * SPLIT TEXT — cinematic masked line reveal.
 * Each line sits in an overflow-hidden mask; inner lines translate from
 * below. Initial hidden state is set by JS only, so SSR/no-JS users and
 * crawlers always see real text. Reduced motion: no animation at all.
 * Uses the canonical GSAP module (lib/gsap) — one instance app-wide.
 */

const EASE_CINEMATIC = "cubic-bezier(0.65,0,0.15,1)";

export function SplitText({
  lines,
  as: Tag = "h2",
  className,
  playOn = "scroll",
  stagger = 0.14,
  id,
}: {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** "load": wait for html[data-loaded] (post-preloader). "scroll": ScrollTrigger. */
  playOn?: "load" | "scroll";
  stagger?: number;
  id?: string;
}) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const inner = root.querySelectorAll<HTMLElement>(".split-line-inner");
      if (inner.length === 0) return;
      if (
        document.documentElement.getAttribute("data-reduced-motion") === "true"
      ) {
        return; // leave text fully visible
      }

      ensureGsap();

      const animate = () => {
        gsap.fromTo(
          inner,
          { yPercent: 118 },
          {
            yPercent: 0,
            duration: 0.95,
            ease: EASE_CINEMATIC,
            stagger,
            overwrite: "auto",
          }
        );
      };

      if (playOn === "load") {
        // Wait for the preloader gate (with a hard fallback so the page
        // can never stay hidden).
        if (document.documentElement.hasAttribute("data-loaded")) {
          animate();
          return;
        }
        const observer = new MutationObserver(() => {
          if (document.documentElement.hasAttribute("data-loaded")) {
            observer.disconnect();
            animate();
          }
        });
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-loaded"],
        });
        const fallback = window.setTimeout(() => {
          observer.disconnect();
          animate();
        }, 3000);
        return () => {
          observer.disconnect();
          window.clearTimeout(fallback);
        };
      }

      gsap.set(inner, { yPercent: 118 });
      const st = ScrollTrigger.create({
        trigger: root,
        start: "top 82%",
        once: true,
        onEnter: animate,
      });
      return () => st.kill();
    },
    { scope: rootRef, dependencies: [playOn] }
  );

  return (
    <Tag ref={rootRef as React.Ref<HTMLHeadingElement>} id={id} className={className}>
      {lines.map((line, i) => (
        <span key={`${line}-${i}`} className="block overflow-hidden pb-[0.08em]">
          <span className="split-line-inner block will-change-transform">
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
