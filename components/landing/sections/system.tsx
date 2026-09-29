"use client";

import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * THE CORE PRODUCT IDEA — the architecture, drawn as one connected
 * system: a single rail flows through profile → crop → weather →
 * health → operation → plan. Typography and structure, not cards.
 */
export function System() {
  const { t } = useLanguage();
  const L = t.landing;

  return (
    <section
      id="system"
      aria-labelledby="system-heading"
      className="section-anchor bg-canopy-950 px-4 py-28 text-white sm:px-6 lg:px-8 lg:py-36"
    >
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
        {/* Copy */}
        <div>
          <Reveal>
            <p className="eyebrow text-lime">
              <span aria-hidden className="h-px w-8 bg-lime" />
              {L.system.eyebrow}
            </p>
          </Reveal>
          <SplitText
            id="system-heading"
            as="h2"
            lines={[...L.system.headlineLines]}
            className="mt-6 font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl"
          />
          <Reveal delay={200}>
            <p className="mt-6 max-w-md text-base leading-relaxed text-canopy-100/80 sm:text-lg">
              {L.system.body}
            </p>
          </Reveal>
          <Reveal delay={300}>
            <p className="mt-10 border-l-2 border-lime pl-4 text-sm leading-relaxed text-canopy-100/70">
              {L.systemRailNote}
            </p>
          </Reveal>
        </div>

        {/* Connected system diagram */}
        <div>
          <ol
            aria-label={L.systemRailAria}
            className="relative flex flex-col border-l border-white/15 pl-8"
          >
            {L.system.nodes.map((node, i) => (
              <Reveal key={node.name} delay={i * 90}>
                <li className="relative pb-10 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute -left-[2.29rem] top-1.5 h-3 w-3 rounded-full bg-lime ring-4 ring-canopy-950"
                  />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {node.name}
                  </p>
                  <p className="mt-1 text-sm text-canopy-100/60">{node.detail}</p>
                  {i < L.system.nodes.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute -left-[2.1rem] top-8 h-[calc(100%-2rem)] w-px bg-white/10"
                    />
                  ) : null}
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
