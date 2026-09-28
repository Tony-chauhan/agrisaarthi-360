import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms — AgriSaarthi 360",
  description:
    "The terms of using AgriSaarthi 360: what the platform provides, what it does not, and how to use its guidance responsibly.",
};

const SECTIONS = [
  {
    title: "What the platform provides",
    body: "AgriSaarthi 360 is a decision-support tool. It organizes your farm context, computes crop guidance, analyzes crop images, and turns live weather into suggested actions.",
  },
  {
    title: "What it is not",
    body: "It is not a replacement for qualified agricultural experts, local regulations, or your own judgment. Weather information depends on external services and can be wrong. AI analysis can misread images. Every result shows its source for a reason.",
  },
  {
    title: "How to use guidance responsibly",
    body: "Treat suggestions as a starting point. Verify important decisions with local expertise and confirm critical operations — irrigation, spraying, harvesting — against your own field conditions before acting.",
  },
  {
    title: "Your farm record",
    body: "Verified farm records reflect the events you choose to record. Their tamper-evident verification makes later alteration detectable; it does not attest to what happened in the physical field.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="eyebrow">AgriSaarthi 360</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-canopy-950 sm:text-4xl">
        Terms
      </h1>
      <p className="mt-4 text-base leading-relaxed text-loam-700">
        The short version: use the guidance, verify the important things.
      </p>

      <div className="mt-10 flex flex-col gap-6">
        {SECTIONS.map((section) => (
          <section
            key={section.title}
            className="card-surface p-6"
            aria-labelledby={`terms-${section.title.toLowerCase().replace(/[^a-z]+/g, "-")}`}
          >
            <h2
              id={`terms-${section.title.toLowerCase().replace(/[^a-z]+/g, "-")}`}
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
