import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OPERATIONS } from "../copy";
import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";

/**
 * FARM OPERATIONS — the workflow, drawn as four connected steps on a
 * graphite panel. The service-data reality is stated plainly.
 */
export function Operations() {
  return (
    <section
      id="operations"
      aria-labelledby="operations-heading"
      className="section-anchor bg-graphite px-4 py-28 text-white sm:px-6 lg:px-8 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-2xl">
            <Reveal>
              <p className="eyebrow text-lime">
                <span aria-hidden className="h-px w-8 bg-lime" />
                {OPERATIONS.eyebrow}
              </p>
            </Reveal>
            <SplitText
              id="operations-heading"
              as="h2"
              lines={OPERATIONS.headlineLines}
              className="mt-6 font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl"
            />
          </div>
          <Reveal delay={200}>
            <p className="max-w-md text-base leading-relaxed text-white/65">
              {OPERATIONS.body}
            </p>
          </Reveal>
        </div>

        {/* Workflow */}
        <ol
          aria-label="Operations workflow"
          className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {OPERATIONS.flow.map((step, i) => (
            <Reveal key={step} delay={i * 90} className="h-full">
              <li className="group relative flex h-full flex-col gap-3 bg-graphite p-7 transition-colors duration-300 hover:bg-white/5">
                <span className="font-display text-4xl font-semibold text-white/15 transition-colors group-hover:text-lime/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                  {step}
                </p>
                {i < OPERATIONS.flow.length - 1 ? (
                  <ArrowRight
                    aria-hidden
                    className="absolute right-5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-white/25 lg:block"
                  />
                ) : null}
              </li>
            </Reveal>
          ))}
        </ol>

        {/* Catalogue + honesty */}
        <div className="mt-14 flex flex-wrap items-start justify-between gap-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
              Supported operations
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {OPERATIONS.operationTypes.map((op) => (
                <li
                  key={op}
                  className="text-sm font-medium text-white/75"
                >
                  {op}
                </li>
              ))}
            </ul>
          </div>
          <div className="max-w-md">
            <span className="source-tag border-white/25 bg-white/10 text-white/80">
              {OPERATIONS.source}
            </span>
            <p className="mt-3 text-xs leading-relaxed text-white/50">
              {OPERATIONS.serviceNote}
            </p>
            <Link
              href={OPERATIONS.cta.href}
              className="group mt-5 inline-flex min-h-12 items-center gap-2 text-base font-semibold text-lime"
            >
              {OPERATIONS.cta.label}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
