/**
 * LANDING COPY v3 — redesigned editorial narrative.
 * Rules: launch-quality wording only; every data element carries its real
 * source; numbers shown exist in the application (sample profile labeled
 * as such); the score is configured suitability, never accuracy;
 * provenance is local tamper-evident verification; no authentication
 * exists, so no Sign In anywhere.
 */

import type { PhotoId } from "./photography/manifest";

export const BRAND = {
  name: "AgriSaarthi 360",
  tagline: "Smart Agriculture Platform",
  chain: ["Farm", "Decision", "Action", "Plan", "Proof"] as const,
};

/* ------------------------------ 01 HERO ------------------------------ */

export const HERO = {
  eyebrow: "Smart Agriculture Decision Support",
  headlineLines: ["FROM FARM", "TO DECISION", "TO ACTION."],
  support:
    "One connected workflow from your farm's context to the decision, the action, the plan — and the proof it happened.",
  primaryCta: "Add Your Farm",
  secondaryCta: "Explore How It Works",
  photoId: "heroWheatSunrise" as PhotoId,
  /**
   * Editorial context graphic — real product flow with the app's own
   * sample-farm values, labeled as sample.
   */
  contextFlow: [
    { label: "Farm Context", value: "Nashik · 5 acres · Rabi" },
    { label: "Crop Decision", value: "Wheat" },
    { label: "Weather Action", value: "Irrigation review" },
  ],
  sampleNote: "Sample farm context",
};

/* ---------------------------- 02 PROBLEM ----------------------------- */

export const PROBLEM = {
  eyebrow: "The problem",
  statementLines: [
    "YOUR FARM SHOULDN'T NEED",
    "FIVE DIFFERENT PLACES",
    "TO MAKE ONE DECISION.",
  ],
  fragments: ["Farm", "Crop", "Health", "Weather", "Operations", "Plan"],
  conclusion: "ONE CONNECTED CONTEXT.",
};

/* ------------------------- 03 CORE PRODUCT IDEA ---------------------- */

export const SYSTEM = {
  eyebrow: "The core idea",
  headlineLines: ["ONE FARM.", "ONE CONNECTED CONTEXT."],
  body: "Configure your farm once. Every module after that — decisions, weather, health, operations, planning — works from the same context.",
  /** The connected system: one flow, not six cards. */
  nodes: [
    { name: "Farm Profile", detail: "Land, soil, irrigation, season" },
    { name: "Crop", detail: "What you decided to grow" },
    { name: "Weather", detail: "Live conditions, your location" },
    { name: "Health", detail: "What the field is showing" },
    { name: "Operation", detail: "The work behind the crop" },
    { name: "Plan", detail: "The season, scheduled" },
  ],
};

/* ------------------------- 04 DECISION ENGINE ------------------------ */

export const DECISION_ENGINE = {
  eyebrow: "Decision engine",
  headlineLines: ["KNOW WHAT FITS", "YOUR FARM."],
  body: "Crop guidance computed from your actual conditions — with the reasoning shown, dimension by dimension.",
  /** Real engine inputs — the sample farm's values, honestly labeled. */
  inputs: [
    { label: "Season", value: "Rabi" },
    { label: "Soil", value: "Loamy" },
    { label: "Irrigation", value: "Drip" },
    { label: "Farm size", value: "5 acres" },
    { label: "Location", value: "Nashik" },
  ],
  decisionBasisTitle: "Decision basis",
  sampleNote: "Sample farm inputs",
  cta: { label: "Open the Crop Advisor", href: "/crop-advisor" },
  source: "Decision Engine",
};

/* -------------------------- 05 WEATHER → ACTION ---------------------- */

export const WEATHER_ACTION = {
  eyebrow: "Weather → farm action",
  headlineLines: ["DATA", "BECOMES ACTION."],
  body: "Live conditions for your location pass through transparent decision rules. What comes out is not a forecast to interpret — it is the next practical step.",
  dataLabels: {
    live: "Live weather",
    fallback: "Cached weather",
    ruleEngine: "Decision rule applied",
  },
  cta: { label: "Open Weather", href: "/weather" },
};

/* ---------------------------- 06 CROP HEALTH ------------------------- */

export const CROP_HEALTH = {
  eyebrow: "AI crop health",
  headlineLines: ["SEE MORE", "IN EVERY CROP IMAGE."],
  photoId: "leafMacro" as PhotoId,
  body: "Upload a field image. The analysis returns a possible condition with an explicit likelihood, what was seen, and a cautious next step — caveats included, always.",
  flow: [
    { step: "Upload crop image", note: "Validated on-device" },
    { step: "AI-assisted health check", note: "Analysis with confidence framing" },
    { step: "Result", note: "Possible condition · Likelihood · Visual note · Next step" },
  ],
  caution: "Likelihoods, not diagnoses. No pesticide dosages. The farmer decides.",
  cta: { label: "Open Crop Health", href: "/crop-health" },
  source: "AI Model",
};

/* --------------------------- 07 OPERATIONS --------------------------- */

export const OPERATIONS = {
  eyebrow: "Farm operations",
  headlineLines: ["OPERATION.", "MACHINERY.", "SERVICE."],
  body: "Choose the operation, review the machinery it needs, and raise the service request — one workflow for the work behind the crop.",
  flow: ["Choose operation", "Match machinery", "Review", "Request service"],
  operationTypes: ["Seedbed Preparation", "Sowing", "Spraying", "Harvesting", "Transport"],
  serviceNote: "Machinery and service information is service data. Availability depends on connected service providers.",
  cta: { label: "Open Farm Operations", href: "/operations" },
  source: "Service Data",
};

/* ----------------------------- 08 JOURNEY ---------------------------- */

export const JOURNEY = {
  eyebrow: "How it works",
  headline: "Five stages. One connected workflow.",
  body: "Scroll through the whole product — each stage is a real capability, not a promise.",
  stages: [
    {
      name: "FARM",
      capability: "Farm context",
      detail: "Location, size, soil, irrigation and season — understood from the first screen.",
      href: "/farm-profile",
      link: "Farm Profile",
    },
    {
      name: "DECISION",
      capability: "Crop recommendation",
      detail: "Guidance computed on real conditions, reasoning visible, score honestly labeled.",
      href: "/crop-advisor",
      link: "Crop Advisor",
    },
    {
      name: "ACTION",
      capability: "Weather · Health · Operations",
      detail: "Live weather becomes the next step; crop images become cautious assessments.",
      href: "/weather",
      link: "Weather & more",
    },
    {
      name: "PLAN",
      capability: "Farm planner",
      detail: "Today's action becomes a dated, season-long plan you can work through.",
      href: "/planner",
      link: "Farm Planner",
    },
    {
      name: "PROOF",
      capability: "Timeline + verification",
      detail: "Completed work becomes a timeline; key events keep tamper-evident records.",
      href: "/timeline",
      link: "Farm Timeline",
    },
  ],
};

/* --------------------------- 09 AI ASSISTANT ------------------------- */

export const AI_SECTION = {
  eyebrow: "Contextual farm intelligence",
  headlineLines: ["ASK WITH", "YOUR FARM", "IN MIND."],
  body: "The assistant answers with your farm context attached — and every answer carries its data source and caveats with it. It does not act autonomously. The farmer stays in control.",
  prompt: "Should I irrigate my wheat today?",
  contextLine: "Context: 5 acres · Rabi · Wheat · Drip · Nashik",
  answer:
    "Today's weather action for your farm is an irrigation review — check conditions before scheduling. Inspect the field for visible crop stress as well.",
  sourceLabel: "AI Model",
  autonomyNote: "Suggested actions are added to your plan only when you confirm them.",
  cta: { label: "Open AgriSaarthi AI", href: "/assistant" },
};

/* --------------------------- 10 PROOF / TRUST ------------------------ */

export const TRUST = {
  eyebrow: "Proof & transparency",
  headlineLines: ["NEVER HIDE", "HOW IT'S MADE."],
  body: "Every result carries a visible data source. That is a design principle, not a footnote.",
  sources: [
    { label: "LIVE API", body: "Weather information for your farm location." },
    { label: "AI MODEL", body: "Crop-health analysis and assistant answers." },
    { label: "DECISION ENGINE", body: "Transparent crop guidance and farm actions." },
    { label: "SERVICE DATA", body: "Operations workflow reference." },
    { label: "FALLBACK", body: "Labeled cached data when a live source is down." },
  ],
  recordsTitle: "Verified farm records",
  recordsBody:
    "Completed farm events can be recorded with tamper-evident verification — the default is local SHA-256 verification of each record, so later alteration is detectable.",
  recordsCta: { label: "Open Farm Timeline", href: "/timeline" },
};

/* ----------------------------- 11 FINAL CTA -------------------------- */

export const FINAL_CTA = {
  headlineLines: ["YOUR FARM.", "YOUR CONTEXT.", "BETTER DECISIONS."],
  support:
    "Bring your farm context, crop decisions, actions and plans into one connected workflow.",
  primary: "Add Your Farm",
  secondary: "Explore How It Works",
};

export const FOOTER = {
  links: [
    { label: "Product", href: "/#system" },
    { label: "How It Works", href: "/#journey" },
    { label: "Intelligence", href: "/#intelligence" },
    { label: "About", href: "/#trust" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
  disclaimer:
    "Decision support, not a replacement for qualified agricultural experts.",
};
