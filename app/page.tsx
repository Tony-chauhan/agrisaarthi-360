import { MotionProvider } from "@/components/landing/motion/motion-provider";
import { Preloader } from "@/components/landing/preloader";
import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/sections/hero";
import { Problem } from "@/components/landing/sections/problem";
import { System } from "@/components/landing/sections/system";
import { DecisionEngine } from "@/components/landing/sections/decision-engine";
import { WeatherAction } from "@/components/landing/sections/weather-action";
import { CropHealth } from "@/components/landing/sections/crop-health";
import { Operations } from "@/components/landing/sections/operations";
import { Journey } from "@/components/landing/sections/journey";
import { Assistant } from "@/components/landing/sections/assistant";
import { Trust } from "@/components/landing/sections/trust";
import { FinalCta } from "@/components/landing/sections/final-cta";
import { LandingFooter } from "@/components/landing/footer";
import { FilmGrain } from "@/components/landing/film-grain";
import { CustomCursor } from "@/components/landing/custom-cursor";
import { PageTransition } from "@/components/landing/page-transition";
import { RevealObserver } from "@/components/landing/reveal-observer";

export const metadata = {
  title: "AgriSaarthi 360 — Smart Agriculture Platform",
  description:
    "AgriSaarthi 360 connects farm context, crop decisions, AI crop-health analysis, live weather and farm actions in one smart agriculture platform.",
  alternates: {
    canonical: "/",
  },
};

/**
 * PUBLIC LANDING PAGE v3 — typography-led editorial narrative in eleven
 * sections: Hero → Problem → System → Decision Engine → Weather→Action →
 * Crop Health → Operations → Journey → AI → Trust → Final CTA.
 * Two photographs total (hero + crop health); everything else is type,
 * diagrams and product structure. One animation clock (MotionProvider),
 * canonical GSAP module, one pinned horizontal journey. No Sign In —
 * the single conversion path is Add Your Farm. The workspace shell
 * lives in the (app) route group and is untouched.
 */
export default function LandingPage() {
  return (
    <MotionProvider>
      <Preloader />
      <LandingNav />
      <main id="main-content">
        <Hero />
        <Problem />
        <System />
        <DecisionEngine />
        <WeatherAction />
        <CropHealth />
        <Operations />
        <Journey />
        <Assistant />
        <Trust />
        <FinalCta />
      </main>
      <LandingFooter />
      <FilmGrain />
      <CustomCursor />
      <PageTransition />
      <RevealObserver />
    </MotionProvider>
  );
}
