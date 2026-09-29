"use client";

import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";
import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * AGRI-SAARTHI AI — contextual farm intelligence. A quiet conversation
 * preview carries the farm's context line and a representative answer;
 * every element of honesty (source tag, autonomy note) is structural,
 * not decorative.
 */
export function Assistant() {
  const { t } = useLanguage();
  const L = t.landing;

  return (
    <section
      id="assistant"
      aria-labelledby="ai-heading"
      className="section-anchor bg-canopy-950 px-4 py-28 text-white sm:px-6 lg:px-8 lg:py-36"
    >
      <div className="mx-auto grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        {/* Copy */}
        <div>
          <Reveal>
            <p className="eyebrow text-lime">
              <span aria-hidden className="h-px w-8 bg-lime" />
              {L.assistant.eyebrow}
            </p>
          </Reveal>
          <SplitText
            id="ai-heading"
            as="h2"
            lines={[...L.assistant.headlineLines]}
            className="mt-6 font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl"
          />
          <Reveal delay={200}>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-canopy-100/80 sm:text-lg">
              {L.assistant.body}
            </p>
          </Reveal>
          <Reveal delay={280}>
            <div className="mt-8">
              <Link
                href="/assistant"
                className="group inline-flex min-h-12 items-center gap-2 text-base font-semibold text-sprout-400 transition-colors hover:text-white"
              >
                {L.assistant.cta}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Conversation preview — prompt with context, grounded answer */}
        <Reveal delay={150}>
          <div
            role="img"
            aria-label={L.assistantPreviewAria}
            className="overflow-hidden rounded-3xl border border-white/10 bg-canopy-900 shadow-deep"
          >
            <div className="flex items-center gap-3 border-b border-white/10 bg-canopy-950 px-5 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-canopy-800 ring-1 ring-sprout-400/40">
                <Bot className="h-5 w-5 text-sprout-400" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  {L.assistantName}
                </p>
                <p className="text-[11px] text-canopy-300">
                  {L.assistantConnected}
                </p>
              </div>
              <span className="source-tag ml-auto border-sprout-400/30 bg-canopy-800 text-sprout-400">
                {L.assistant.sourceLabel}
              </span>
            </div>

            <div className="flex flex-col gap-3 px-5 py-5">
              <div className="flex flex-col items-end gap-1">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-canopy-700 px-4 py-2.5 text-sm text-white">
                  {L.assistant.prompt}
                </p>
                <p className="px-1 text-[11px] text-canopy-300">
                  {L.assistant.contextLine}
                </p>
              </div>

              <p className="max-w-[92%] self-start rounded-2xl rounded-bl-md bg-canopy-800 px-4 py-3 text-sm leading-relaxed text-canopy-100">
                {L.assistant.answer}
              </p>

              <p className="mt-1 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-canopy-300">
                {L.assistant.autonomyNote}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
