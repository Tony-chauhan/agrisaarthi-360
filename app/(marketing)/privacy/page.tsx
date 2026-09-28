import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — AgriSaarthi 360",
  description:
    "How AgriSaarthi 360 handles your farm information: what stays on your device, what leaves it, and what is never collected.",
};

const SECTIONS = [
  {
    title: "What we store",
    body: "Your farm profile, plan, timeline and assistant conversation live in your browser for the current session. There is no account system and no server-side storage of your farm information.",
  },
  {
    title: "What leaves your device",
    body: "Requests for live weather send your farm's location to the weather service. Crop-health images and assistant questions are sent to the AI model provider to generate analysis. Farm records written for tamper-evident verification contain only the event details you choose to record.",
  },
  {
    title: "What we never do",
    body: "No advertising trackers, no third-party analytics, no sale of information, no fabricated data — every result shows the source it came from.",
  },
  {
    title: "Your control",
    body: "Use Sample Farm and Clear Session in Farm Profile reset everything stored in your browser at any time.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="eyebrow">AgriSaarthi 360</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-canopy-950 sm:text-4xl">
        Privacy
      </h1>
      <p className="mt-4 text-base leading-relaxed text-loam-700">
        Plain statements about how your farm information is handled. If a
        behavior ever changes, this page changes with it.
      </p>

      <div className="mt-10 flex flex-col gap-6">
        {SECTIONS.map((section) => (
          <section
            key={section.title}
            className="card-surface p-6"
            aria-labelledby={`privacy-${section.title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <h2
              id={`privacy-${section.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="font-display text-xl font-semibold text-canopy-950"
            >
              {section.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-loam-700">{section.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm text-loam-600">
        Questions? Write to{" "}
        <a
          href="mailto:hello@agrisaarthi.example"
          className="font-medium text-terracotta-600 underline-offset-2 hover:underline"
        >
          hello@agrisaarthi.example
        </a>
        . Or return to the{" "}
        <Link
          href="/"
          className="font-medium text-terracotta-600 underline-offset-2 hover:underline"
        >
          landing page
        </Link>
        .
      </p>
    </main>
  );
}
