import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { FarmProvider } from "@/lib/farm-context";
import { TimelineProvider } from "@/lib/timeline/timeline-context";
import { PlannerProvider } from "@/lib/planner/task-store";
import { LanguageProvider } from "@/lib/i18n/language-context";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

// Hindi (Devanagari) support — Fraunces/Instrument Sans are Latin-only.
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgriSaarthi 360 — Smart Agriculture Platform",
  description:
    "AgriSaarthi 360 connects farm context, crop decisions, AI crop-health analysis, live weather and farm actions in one smart agriculture platform.",
  openGraph: {
    title: "AgriSaarthi 360 — Smart Agriculture Platform",
    description:
      "Farm context, crop decisions, AI crop health, live weather and farm actions — one connected agriculture experience.",
    type: "website",
    siteName: "AgriSaarthi 360",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgriSaarthi 360 — Smart Agriculture Platform",
    description:
      "Farm context, crop decisions, AI crop health, live weather and farm actions — one connected agriculture experience.",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable} ${notoDevanagari.variable}`}
    >
      <body>
        <LanguageProvider>
          <FarmProvider>
            <TimelineProvider>
              <PlannerProvider>{children}</PlannerProvider>
            </TimelineProvider>
          </FarmProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
