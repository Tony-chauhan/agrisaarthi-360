import type { CropKnowledgeEntry } from "@/lib/types";

/**
 * CROP KNOWLEDGE BASE — curated rules, NOT universal agricultural truth.
 * Purpose: transparent, explainable decision logic for the advisor.
 * Keep all crop rules centralized here; do not scatter across components.
 */

export const CROP_KNOWLEDGE_BASE: CropKnowledgeEntry[] = [
  {
    crop: "Wheat",
    seasons: ["rabi"],
    preferredSoils: ["loamy", "alluvial"],
    toleratedSoils: ["black"],
    preferredIrrigation: ["drip", "sprinkler", "canal", "borewell"],
    toleratedIrrigation: ["rain-fed"],
    waterRequirement: "moderate",
    durationDays: "110–120 days",
    farmSizeRange: { min: 0.5, max: 100 },
    caveat:
      "Verify seed variety availability with your local agriculture officer before sowing.",
  },
  {
    crop: "Chickpea (Chana)",
    seasons: ["rabi"],
    preferredSoils: ["black", "loamy", "sandy"],
    toleratedSoils: ["alluvial"],
    preferredIrrigation: ["rain-fed", "drip", "borewell"],
    toleratedIrrigation: ["canal", "sprinkler"],
    waterRequirement: "low",
    durationDays: "95–105 days",
    farmSizeRange: { min: 0.5, max: 50 },
    caveat: "Watch for pod borer activity in the first 6 weeks.",
  },
  {
    crop: "Mustard (Sarson)",
    seasons: ["rabi"],
    preferredSoils: ["loamy", "alluvial", "black"],
    toleratedSoils: ["sandy"],
    preferredIrrigation: ["rain-fed", "canal", "borewell"],
    toleratedIrrigation: ["drip", "sprinkler"],
    waterRequirement: "low",
    durationDays: "105–120 days",
    farmSizeRange: { min: 0.5, max: 50 },
    caveat:
      "Aphid pressure can be high in warm winters — scout the crop weekly.",
  },
  {
    crop: "Rice (Paddy)",
    seasons: ["kharif"],
    preferredSoils: ["alluvial", "clay", "loamy"],
    toleratedSoils: ["black"],
    preferredIrrigation: ["canal", "borewell", "drip"],
    toleratedIrrigation: ["sprinkler"],
    waterRequirement: "high",
    durationDays: "120–150 days",
    farmSizeRange: { min: 0.5, max: 100 },
    caveat:
      "Needs assured water — avoid on rain-fed plots with weak monsoon outlook.",
  },
  {
    crop: "Maize",
    seasons: ["kharif", "zaid"],
    preferredSoils: ["loamy", "alluvial"],
    toleratedSoils: ["black", "sandy"],
    preferredIrrigation: ["canal", "borewell", "sprinkler", "drip"],
    toleratedIrrigation: ["rain-fed"],
    waterRequirement: "moderate",
    durationDays: "90–110 days",
    farmSizeRange: { min: 0.5, max: 100 },
    caveat: "Stem borer is common — plan monitoring from the 3rd week.",
  },
  {
    crop: "Cotton",
    seasons: ["kharif"],
    preferredSoils: ["black", "clay"],
    toleratedSoils: ["alluvial", "loamy"],
    preferredIrrigation: ["canal", "borewell", "drip"],
    toleratedIrrigation: ["rain-fed"],
    waterRequirement: "moderate",
    durationDays: "160–180 days",
    farmSizeRange: { min: 1, max: 100 },
    caveat:
      "Long duration — confirm it fits your season length and water plan.",
  },
  {
    crop: "Green Gram (Moong)",
    seasons: ["zaid", "kharif"],
    preferredSoils: ["loamy", "sandy"],
    toleratedSoils: ["alluvial", "black"],
    preferredIrrigation: ["drip", "sprinkler", "borewell"],
    toleratedIrrigation: ["canal", "rain-fed"],
    waterRequirement: "low",
    durationDays: "60–75 days",
    farmSizeRange: { min: 0.25, max: 50 },
    caveat: "Short window — arrange harvesting labour/machine early.",
  },
  {
    crop: "Onion (Rabi)",
    seasons: ["rabi"],
    preferredSoils: ["loamy", "alluvial", "black"],
    toleratedSoils: ["clay"],
    preferredIrrigation: ["drip", "sprinkler", "canal"],
    toleratedIrrigation: ["borewell"],
    waterRequirement: "moderate",
    durationDays: "120–150 days",
    farmSizeRange: { min: 0.25, max: 20 },
    caveat:
      "Price volatility is high — check market rates before committing area.",
  },
];

/** Shown on every advisor result — the standard pre-planting checklist. */
export const CHECK_BEFORE_PLANTING =
  "Local market demand, current weather, seed availability, and advice from a qualified agriculture professional.";
