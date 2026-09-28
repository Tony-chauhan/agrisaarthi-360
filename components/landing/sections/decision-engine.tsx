import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { DECISION_ENGINE } from "../copy";
import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";

/**
 * THE DECISION ENGINE — a product case study, not a card grid.
 * The panel shows the real advisor's shape: labeled inputs → decision,
 * with the decision basis named. Values are the sample farm's, labeled
 * as sample. The score is described truthfully: configured suitability,
 * never accuracy.
 */
export function DecisionEngine() {
  return (
    <section
      id="decision"
      aria-labelledby="decision-heading"
      className="section-anchor bg-parchment px-4 py-28 sm:px-6 lg:px-8 lg:py-36"
    >
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        {/* Copy */}
        <div>
          <Reveal>
            <p className="eyebrow">
              <span aria-hidden className="h-px w-8 bg-terracotta-600" />
              {DECISION_ENGINE.eyebrow}
            </p>
          </Reveal>
          <SplitText
            id="decision-heading"
            as="h2"
            lines={DECISION_ENGINE.headlineLines}
            className="mt-6 font-display text-4xl font-semibold leading-[1.02] tracking-tight text-canopy-950 sm:text-6xl"
          />
          <Reveal delay={200}>
            <p className="mt-6 max-w-md text-base leading-relaxed text-loam-700 sm:text-lg">
              {DECISION_ENGINE.body}
            </p>
          </Reveal>
          <Reveal delay={300}>
            <Link
              href={DECISION_ENGINE.cta.href}
              className="group mt-9 inline-flex min-h-12 items-center gap-2 text-base font-semibold text-terracotta-700"
            >
              {DECISION_ENGINE.cta.label}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </Reveal>
          <Reveal delay={360}>
            <p className="mt-6 max-w-md border-l-2 border-canopy-200 pl-4 text-xs leading-relaxed text-loam-600">
              The suitability score reflects configured decision weights —
              it is not a model accuracy measure. The full reasoning is shown
              inside the advisor.
            </p>
          </Reveal>
        </div>

        {/* Case-study panel */}
        <Reveal delay={150}>
          <div className="rounded-2xl border border-canopy-200 bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-canopy-100 px-6 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-loam-500">
                Crop Advisor
              </p>
              <span className="source-tag border-canopy-200 bg-canopy-50 text-canopy-700">
                {DECISION_ENGINE.source}
              </span>
            </div>

            <div className="px-6 py-6">
              {/* Inputs */}
              <ul aria-label="Farm inputs" className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                {DECISION_ENGINE.inputs.map((input) => (
                  <li key={input.label}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-loam-500">
                      {input.label}
                    </p>
                    <p className="mt-0.5 font-display text-base font-semibold text-canopy-950">
                      {input.value}
                    </p>
                  </li>
                ))}
              </ul>

              <div aria-hidden className="my-5 flex justify-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-canopy-200 bg-parchment">
                  <ArrowDown className="h-3.5 w-3.5 text-terracotta-600" />
                </span>
              </div>

              {/* Decision */}
              <div className="rounded-xl bg-emerald-ink px-5 py-5 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-lime">
                  Recommendation
                </p>
                <p className="mt-1 font-display text-3xl font-semibold tracking-tight">
                  Wheat
                </p>
                <p className="mt-1 text-sm text-white/75">
                  High suitability for this farm profile
                </p>
              </div>

              {/* Decision basis */}
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-loam-500">
                {DECISION_ENGINE.decisionBasisTitle}
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Decision basis dimensions">
                {DECISION_ENGINE.inputs.map((input) => (
                  <li
                    key={input.label}
                    className="rounded-full border border-canopy-200 bg-canopy-50 px-2.5 py-1 text-[11px] font-medium text-canopy-700"
                  >
                    {input.label}
                  </li>
                ))}
              </ul>
            </div>

            <p className="border-t border-canopy-100 px-6 py-3 text-[11px] text-loam-500">
              {DECISION_ENGINE.sampleNote}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
