import type {
  CropAdvisorInputs,
  CropKnowledgeEntry,
  EngineCropRecommendation,
  CropRecommendationResult,
  IrrigationType,
  SoilType,
  Season,
} from "@/lib/types";
import { CROP_KNOWLEDGE_BASE } from "@/lib/crop-knowledge";
import type { Lang } from "@/lib/i18n/types";
import { t as dict } from "@/lib/i18n";

/**
 * CROP DECISION ENGINE — deterministic, transparent, rules-based.
 *
 * SCORING WEIGHTS (documented, NOT scientific accuracy):
 *   Season fit        30
 *   Soil fit          25
 *   Irrigation fit    25
 *   Location/context  10
 *   Farm-size fit     10
 *   ----------------------
 *   Max total        100
 *
 * Same inputs always produce the same output (pure functions, no randomness).
 * The land photo is NEVER used for scoring — it is a context signal only.
 *
 * English is the deterministic default (verify suites assert English
 * strings); pass `lang` to receive basis strings in the selected UI language.
 */

export const SCORING_WEIGHTS = {
  season: 30,
  soil: 25,
  irrigation: 25,
  location: 10,
  farmSize: 10,
} as const;

/** Score at/above which a crop is presented as "high" suitability. */
const HIGH_THRESHOLD = 85;
/** Score at/above which a crop is presented as "moderate" suitability. */
const MODERATE_THRESHOLD = 60;
/** Crops scoring below this are dropped entirely. */
const MIN_SCORE = 40;
/** Number of recommendations returned. */
const MAX_RESULTS = 3;

/* ------------------------------------------------------------------ */
/* Dimension scorers (pure functions)                                  */
/* ------------------------------------------------------------------ */

type BasisParams = {
  entry: CropKnowledgeEntry;
  L: ReturnType<typeof dict>["cropLib"] | null;
};

/** Localized crop name with safe fallback to the canonical English name. */
function cropNameFor(L: BasisParams["L"], crop: string): string {
  if (!L) return crop;
  return (L.cropNames as Record<string, string>)[crop] ?? crop;
}

function scoreSeason(
  entry: CropKnowledgeEntry,
  season: Season,
  L: BasisParams["L"],
  lang: Lang
) {
  const seasonName = L
    ? L.seasonNames[season]
    : capitalize(season);
  const cropName = cropNameFor(L, entry.crop);
  if (entry.seasons.includes(season)) {
    return {
      points: SCORING_WEIGHTS.season,
      max: SCORING_WEIGHTS.season,
      basis: L
        ? L.basis.seasonMatch(seasonName, cropName)
        : `${capitalize(season)} matches ${entry.crop}'s season profile.`,
    };
  }
  return {
    points: 0,
    max: SCORING_WEIGHTS.season,
    basis: L
      ? L.basis.seasonMiss(seasonName, cropName)
      : `${capitalize(season)} is outside ${entry.crop}'s season profile — needs local verification.`,
  };
}

function scoreSoil(
  entry: CropKnowledgeEntry,
  soil: SoilType,
  L: BasisParams["L"]
) {
  const soilName = L ? L.soilNames[soil] : capitalize(soil);
  const cropName = cropNameFor(L, entry.crop);
  if (entry.preferredSoils.includes(soil)) {
    return {
      points: SCORING_WEIGHTS.soil,
      max: SCORING_WEIGHTS.soil,
      basis: L
        ? L.basis.soilMatch(soilName, cropName)
        : `${capitalize(soil)} soil matches the configured rule set for ${entry.crop}.`,
    };
  }
  if (entry.toleratedSoils?.includes(soil)) {
    return {
      points: Math.round(SCORING_WEIGHTS.soil * 0.5),
      max: SCORING_WEIGHTS.soil,
      basis: L
        ? L.basis.soilPartial(soilName, cropName)
        : `${capitalize(soil)} soil is workable for ${entry.crop} (partial match).`,
    };
  }
  return {
    points: 0,
    max: SCORING_WEIGHTS.soil,
    basis: L
      ? L.basis.soilMiss(soilName, cropName)
      : `${capitalize(soil)} soil is not in ${entry.crop}'s preferred soil list.`,
  };
}

function scoreIrrigation(
  entry: CropKnowledgeEntry,
  irrigation: IrrigationType,
  L: BasisParams["L"]
) {
  const irrigationName = L ? L.irrigationNames[irrigation] : label(irrigation);
  const cropName = cropNameFor(L, entry.crop);
  const water = L ? L.waterWord[entry.waterRequirement] : entry.waterRequirement;
  if (entry.preferredIrrigation.includes(irrigation)) {
    return {
      points: SCORING_WEIGHTS.irrigation,
      max: SCORING_WEIGHTS.irrigation,
      basis: L
        ? L.basis.irrigationMatch(irrigationName, cropName, water)
        : `${label(irrigation)} irrigation supports ${entry.crop}'s ${entry.waterRequirement} water requirement.`,
    };
  }
  if (entry.toleratedIrrigation?.includes(irrigation)) {
    return {
      points: Math.round(SCORING_WEIGHTS.irrigation * 0.5),
      max: SCORING_WEIGHTS.irrigation,
      basis: L
        ? L.basis.irrigationPartial(irrigationName, cropName)
        : `${label(irrigation)} irrigation is workable for ${entry.crop} (partial match).`,
    };
  }
  return {
    points: 0,
    max: SCORING_WEIGHTS.irrigation,
    basis: L
      ? L.basis.irrigationMiss(irrigationName, cropName)
      : `${label(irrigation)} irrigation is not in ${entry.crop}'s preferred irrigation list.`,
  };
}

function scoreLocation(
  entry: CropKnowledgeEntry,
  location: string,
  L: BasisParams["L"]
) {
  // No district-level agronomy is modeled. Be explicit about it.
  return {
    points: SCORING_WEIGHTS.location,
    max: SCORING_WEIGHTS.location,
    basis: L
      ? location.trim()
        ? L.basis.locationNoted(location.trim())
        : L.basis.locationMissing
      : location.trim()
        ? `Location "${location.trim()}" noted — regional agronomy is not modeled; verify locally.`
        : "Insufficient location information — generic default applied.",
  };
}

function scoreFarmSize(
  entry: CropKnowledgeEntry,
  size: number,
  L: BasisParams["L"]
) {
  const { min, max } = entry.farmSizeRange;
  const cropName = cropNameFor(L, entry.crop);
  if (size >= min && size <= max) {
    return {
      points: SCORING_WEIGHTS.farmSize,
      max: SCORING_WEIGHTS.farmSize,
      basis: L
        ? L.basis.sizeMatch(size, cropName)
        : `${size} acres fits the configured farm-size range for ${entry.crop}.`,
    };
  }
  return {
    points: 0,
    max: SCORING_WEIGHTS.farmSize,
    basis: L
      ? L.basis.sizeMiss(size, cropName, min, max)
      : `${size} acres is outside ${entry.crop}'s configured range (${min}–${max}).`,
  };
}

/* ------------------------------------------------------------------ */
/* Profile completeness                                                */
/* ------------------------------------------------------------------ */

function findMissingInputs(inputs: CropAdvisorInputs, L: BasisParams["L"]): string[] {
  const missing: string[] = [];
  if (!inputs.location.trim()) missing.push(L ? L.missingLocation : "Location is missing.");
  if (!Number.isFinite(inputs.farmSizeAcres) || inputs.farmSizeAcres <= 0) {
    missing.push(L ? L.missingFarmSize : "Valid farm size (> 0 acres) is missing.");
  }
  return missing;
}

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

/**
 * Run the rules-based engine. Deterministic: identical inputs produce
 * identical outputs. The land photo is intentionally ignored for scoring.
 */
export function recommendCrops(
  inputs: CropAdvisorInputs,
  lang: Lang = "en"
): CropRecommendationResult {
  const L = lang === "hi" ? dict("hi").cropLib : null;
  const missingInputs = findMissingInputs(inputs, L);

  if (missingInputs.length > 0) {
    return {
      recommendations: [],
      incompleteProfile: true,
      missingInputs,
    };
  }

  const scored: EngineCropRecommendation[] = [];

  for (const entry of CROP_KNOWLEDGE_BASE) {
    const season = scoreSeason(entry, inputs.season, L, lang);
    const soil = scoreSoil(entry, inputs.soilType, L);
    const irrigation = scoreIrrigation(entry, inputs.irrigation, L);
    const location = scoreLocation(entry, inputs.location, L);
    const farmSize = scoreFarmSize(entry, inputs.farmSizeAcres, L);

    const score =
      season.points +
      soil.points +
      irrigation.points +
      location.points +
      farmSize.points;

    if (score < MIN_SCORE) continue;

    scored.push({
      crop: entry.crop,
      suitability:
        score >= HIGH_THRESHOLD
          ? "high"
          : score >= MODERATE_THRESHOLD
            ? "moderate"
            : "exploratory",
      score,
      scoreBasis: { season, soil, irrigation, location, farmSize },
      seasonFit: season.basis,
      soilFit: soil.basis,
      irrigationFit: irrigation.basis,
      // Narrative reasons — the top-scoring dimensions, in plain language.
      whyItMatches: [season, soil, irrigation, farmSize]
        .filter((d) => d.points > 0)
        .sort((a, b) => b.points - a.points)
        .map((d) => d.basis),
      waterRequirement: entry.waterRequirement,
      durationDays: entry.durationDays,
      caveat: entry.caveat,
      source: "rules-based",
    });
  }

  scored.sort((a, b) => b.score - a.score);

  return {
    recommendations: scored.slice(0, MAX_RESULTS),
    incompleteProfile: false,
    missingInputs: [],
  };
}

/* ------------------------------------------------------------------ */
/* Label helpers                                                       */
/* ------------------------------------------------------------------ */

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function label(irrigation: IrrigationType): string {
  if (irrigation === "rain-fed") return "Rain-fed";
  return capitalize(irrigation);
}
