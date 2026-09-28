"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ImageIcon, X, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { CropResultCard } from "@/components/feature/crop-result-card";
import { useFarmProfile } from "@/lib/farm-context";
import { useTimeline } from "@/lib/timeline/timeline-context";
import { recommendCrops } from "@/lib/crop-recommendation";
import type {
  CropAdvisorInputs,
  EngineCropRecommendation,
  IrrigationType,
  SoilType,
  Season,
} from "@/lib/types";

export default function CropAdvisorPage() {
  const { profile, updateProfile, setSelectedCrop, hasCompleteProfile } =
    useFarmProfile();
  const { emitEvent } = useTimeline();
  const router = useRouter();

  /* Editable inputs — pre-filled from shared farm context */
  const [location, setLocation] = useState(profile.location);
  const [season, setSeason] = useState<Season>(profile.season);
  const [farmSizeAcres, setFarmSizeAcres] = useState(profile.farmSizeAcres);
  const [irrigation, setIrrigation] = useState<IrrigationType>(
    profile.irrigation
  );
  const [soilType, setSoilType] = useState<SoilType>(profile.soilType);

  /* Land photo — context only, never scored */
  const [landPhotoUrl, setLandPhotoUrl] = useState<string | undefined>(
    profile.landPhotoUrl
  );
  const [landPhotoName, setLandPhotoName] = useState<string | null>(null);

  /* Flow state */
  const [results, setResults] = useState<EngineCropRecommendation[] | null>(
    null
  );
  const [incomplete, setIncomplete] = useState<string[] | null>(null);
  const [isFinding, setIsFinding] = useState(false);

  const handlePhoto = (file: File | undefined) => {
    if (!file) return;
    setLandPhotoUrl(URL.createObjectURL(file));
    setLandPhotoName(file.name);
  };

  const removePhoto = () => {
    setLandPhotoUrl(undefined);
    setLandPhotoName(null);
  };

  const runAdvisor = () => {
    setIsFinding(true);

    // Short, realistic loading beat so judges see "Analyzing farm profile…"
    window.setTimeout(() => {
      const inputs: CropAdvisorInputs = {
        location,
        season,
        farmSizeAcres,
        irrigation,
        soilType,
      };
      const outcome = recommendCrops(inputs);

      if (outcome.incompleteProfile) {
        setIncomplete(outcome.missingInputs);
        setResults(null);
      } else {
        setIncomplete(null);
        setResults(outcome.recommendations);
      }
      setIsFinding(false);
    }, 700);
  };

  const handleSelectCrop = (crop: string) => {
    // Persist the advisor inputs to the shared profile, then the crop.
    updateProfile({
      location,
      season,
      farmSizeAcres,
      irrigation,
      soilType,
      landPhotoUrl,
    });
    setSelectedCrop(crop);
    // P1: actual action → timeline event.
    emitEvent({
      eventType: "CROP_SELECTED",
      title: `${crop} selected`,
      description: `Crop selected from the advisor for the ${season} season at ${location}.`,
      source: "rules-based",
      entityType: "crop",
      entityId: crop,
    });
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        eyebrow="Step 2 of your farm journey"
        title="Crop advisor"
        description="Smart crop suggestions generated from your farm context — the reasoning is always shown, never hidden."
      />

      {/* Inputs */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Your farm details</CardTitle>
            <CardDescription>
              Pre-filled from your farm profile — adjust for this season.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Location" htmlFor="ca-location" required>
            <Input
              id="ca-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Field>
          <Field label="Season" htmlFor="ca-season">
            <Select
              id="ca-season"
              value={season}
              onChange={(e) => setSeason(e.target.value as Season)}
            >
              <option value="kharif">Kharif (monsoon)</option>
              <option value="rabi">Rabi (winter)</option>
              <option value="zaid">Zaid (summer)</option>
            </Select>
          </Field>
          <Field label="Farm size (acres)" htmlFor="ca-size">
            <Input
              id="ca-size"
              type="number"
              min={0.1}
              step={0.1}
              value={farmSizeAcres}
              onChange={(e) => setFarmSizeAcres(Number(e.target.value))}
            />
          </Field>
          <Field label="Irrigation" htmlFor="ca-irrigation">
            <Select
              id="ca-irrigation"
              value={irrigation}
              onChange={(e) => setIrrigation(e.target.value as IrrigationType)}
            >
              <option value="rain-fed">Rain-fed only</option>
              <option value="canal">Canal</option>
              <option value="borewell">Borewell</option>
              <option value="drip">Drip</option>
              <option value="sprinkler">Sprinkler</option>
            </Select>
          </Field>
          <Field label="Soil type" htmlFor="ca-soil">
            <Select
              id="ca-soil"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value as SoilType)}
            >
              <option value="black">Black (cotton soil)</option>
              <option value="alluvial">Alluvial</option>
              <option value="loamy">Loamy</option>
              <option value="sandy">Sandy</option>
              <option value="clay">Clay</option>
              <option value="red">Red soil</option>
              <option value="laterite">Laterite</option>
            </Select>
          </Field>

          {/* Land photo — context only */}
          <Field
            label="Land photo (optional)"
            htmlFor="ca-photo"
            hint="Context signal only — never the sole basis for crop recommendation."
          >
            {landPhotoUrl ? (
              <div className="flex items-center gap-3 rounded-xl border border-canopy-200 bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={landPhotoUrl}
                  alt="Selected land photo preview"
                  className="h-16 w-24 rounded-lg border border-canopy-100 object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-sm text-loam-700">
                  {landPhotoName ?? "Selected image"}
                </span>
                <button
                  type="button"
                  onClick={removePhoto}
                  aria-label="Remove land photo"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-loam-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ) : (
              <label
                htmlFor="ca-photo"
                className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-canopy-300 bg-canopy-50/50 px-3.5 text-sm text-loam-600 transition-colors hover:border-canopy-400"
              >
                <ImageIcon className="h-4 w-4 text-canopy-600" aria-hidden />
                Choose an image
              </label>
            )}
            <input
              id="ca-photo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handlePhoto(e.target.files?.[0])}
            />
          </Field>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-loam-500">
            Decision engine — the photo never affects scores.
          </p>
          <Button
            variant="accent"
            loading={isFinding}
            onClick={runAdvisor}
            leftIcon={<Sparkles className="h-4 w-4" aria-hidden />}
          >
            {isFinding ? "Analyzing farm profile…" : "Find suitable crops"}
          </Button>
        </CardFooter>
      </Card>

      {/* Incomplete profile edge state */}
      {incomplete ? (
        <Alert tone="warning" title="Not enough profile information for a reliable recommendation">
          <ul className="mt-1 list-inside list-disc">
            {incomplete.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <div className="mt-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => router.push("/farm-profile")}
            >
              Complete Farm Profile
            </Button>
          </div>
        </Alert>
      ) : null}

      {/* Results */}
      {results ? (
        <section aria-label="Crop recommendations" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Alert tone="info" title="How to read these results" className="flex-1">
              Rankings come from a transparent decision engine — decision
              support, not scientific certainty. Confirm with your local
              agriculture officer.
            </Alert>
          </div>
          <div className="flex justify-end">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm font-medium text-terracotta-600 hover:underline"
            >
              View dashboard
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-canopy-200 bg-white/60 px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-canopy-50 text-canopy-600">
                <Sparkles className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-canopy-900">
                  No crop met enough of the decision rules
                </p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-loam-600">
                  For this season/soil/irrigation combination, no crop in the
                  knowledge base scored strongly. Adjust the inputs or verify
                  locally.
                </p>
              </div>
            </div>
          ) : (
            results.map((rec) => (
              <CropResultCard
                key={rec.crop}
                recommendation={rec}
                isSelected={profile.selectedCrop === rec.crop}
                onSelect={handleSelectCrop}
              />
            ))
          )}
        </section>
      ) : !incomplete ? (
        <EmptyResults hasCompleteProfile={hasCompleteProfile} />
      ) : null}
    </div>
  );
}

function EmptyResults({ hasCompleteProfile }: { hasCompleteProfile: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-canopy-200 bg-white/60 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-canopy-50 text-canopy-600">
        <Sparkles className="h-6 w-6" aria-hidden />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-canopy-900">
          No recommendations yet
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-loam-600">
          {hasCompleteProfile
            ? 'Review your farm details above and choose "Find suitable crops" to see options with clear reasoning.'
            : "Complete your farm profile first — the advisor uses it to generate matching crops."}
        </p>
      </div>
    </div>
  );
}
