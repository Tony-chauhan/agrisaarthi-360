"use client";

import { useState } from "react";
import Link from "next/link";
import { Save, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useFarmProfile } from "@/lib/farm-context";
import { DEMO_PROFILE } from "@/lib/demo-data";
import type { FarmProfile, IrrigationType, SoilType, Season } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Options                                                             */
/* ------------------------------------------------------------------ */

const IRRIGATION_OPTIONS: Array<{ value: IrrigationType; label: string }> = [
  { value: "rain-fed", label: "Rain-fed only" },
  { value: "canal", label: "Canal" },
  { value: "borewell", label: "Borewell" },
  { value: "drip", label: "Drip" },
  { value: "sprinkler", label: "Sprinkler" },
];

const SOIL_OPTIONS: Array<{ value: SoilType; label: string }> = [
  { value: "black", label: "Black (cotton soil)" },
  { value: "alluvial", label: "Alluvial" },
  { value: "loamy", label: "Loamy" },
  { value: "sandy", label: "Sandy" },
  { value: "clay", label: "Clay" },
  { value: "red", label: "Red soil" },
  { value: "laterite", label: "Laterite" },
];

const SEASON_OPTIONS: Array<{ value: Season; label: string }> = [
  { value: "kharif", label: "Kharif (monsoon — Jun–Oct)" },
  { value: "rabi", label: "Rabi (winter — Nov–Apr)" },
  { value: "zaid", label: "Zaid (summer — Apr–Jun)" },
];

/* ------------------------------------------------------------------ */
/* Validation — practical and forgiving                                */
/* ------------------------------------------------------------------ */

interface FormErrors {
  farmerName?: string;
  location?: string;
  farmSizeAcres?: string;
}

function validateProfile(draft: FarmProfile): FormErrors {
  const errors: FormErrors = {};
  if (!draft.farmerName.trim()) {
    errors.farmerName = "Farmer name is required.";
  }
  if (!draft.location.trim()) {
    errors.location = "Location helps every other feature work.";
  }
  if (
    Number.isNaN(draft.farmSizeAcres) ||
    draft.farmSizeAcres <= 0 ||
    draft.farmSizeAcres > 500
  ) {
    errors.farmSizeAcres = "Enter a farm size between 0.1 and 500 acres.";
  }
  return errors;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function FarmProfilePage() {
  const { profile, updateProfile, resetSession, hasCompleteProfile } =
    useFarmProfile();
  const [draft, setDraft] = useState<FarmProfile>(profile);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof FarmProfile>(key: K, value: FarmProfile[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    const nextErrors = validateProfile(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    updateProfile(draft);
    setSaved(true);
  };

  /** One click fills the form + saves — quick data-entry convenience. */
  const loadSampleFarm = () => {
    setDraft({ ...DEMO_PROFILE });
    updateProfile({ ...DEMO_PROFILE });
    setErrors({});
    setSaved(true);
  };

  /** Clear the shared session and return to the sample farm draft. */
  const handleResetSession = () => {
    resetSession();
    setDraft({ ...DEMO_PROFILE, selectedCrop: undefined });
    setErrors({});
    setSaved(false);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        eyebrow="Step 1 of your farm journey"
        title="Farm profile"
        description="This profile becomes the shared context for crop advice, weather actions, crop health and operations. Everything else builds on it."
      />

      {saved ? (
        <Alert tone="success" title="Profile saved">
          Your farm context is updated across the app —{" "}
          <Link
            href="/crop-advisor"
            className="font-medium underline underline-offset-2"
          >
            continue to Crop Advisor
          </Link>
          .
        </Alert>
      ) : null}

      {/* Sample farm shortcut — fill instantly; manual entry still works */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant="secondary"
          onClick={loadSampleFarm}
          leftIcon={<Sparkles className="h-4 w-4" aria-hidden />}
        >
          Use Sample Farm
        </Button>
        {hasCompleteProfile ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetSession}
            leftIcon={<RotateCcw className="h-4 w-4" aria-hidden />}
          >
            Clear session
          </Button>
        ) : null}
        <p className="text-xs text-loam-500">
          Sample farm: Ramesh Patil, 5 acres, Nashik — or edit the form with
          your own details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Who farms this land</CardTitle>
            <CardDescription>Used to personalise guidance.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Farmer name"
            htmlFor="farmerName"
            required
            error={errors.farmerName}
            hint="This name personalises your dashboard guidance."
          >
            <Input
              id="farmerName"
              value={draft.farmerName}
              onChange={(e) => set("farmerName", e.target.value)}
              placeholder="e.g. Ramesh Patil"
              aria-invalid={Boolean(errors.farmerName)}
            />
          </Field>
          <Field
            label="Location / district"
            htmlFor="location"
            required
            error={errors.location}
            hint="Village, district or region — used for weather and crops."
          >
            <Input
              id="location"
              value={draft.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Nashik, Maharashtra"
              aria-invalid={Boolean(errors.location)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Land details</CardTitle>
            <CardDescription>
              Helps match crops, machines and water planning to your land.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Farm size (acres)"
            htmlFor="farmSizeAcres"
            required
            error={errors.farmSizeAcres}
            hint="In acres — used to shortlist suitable machines."
          >
            <Input
              id="farmSizeAcres"
              type="number"
              min={0.1}
              max={500}
              step={0.1}
              value={draft.farmSizeAcres}
              onChange={(e) => set("farmSizeAcres", Number(e.target.value))}
              aria-invalid={Boolean(errors.farmSizeAcres)}
            />
          </Field>
          <Field
            label="Irrigation"
            htmlFor="irrigation"
            hint="Affects crop water planning."
          >
            <Select
              id="irrigation"
              value={draft.irrigation}
              onChange={(e) =>
                set("irrigation", e.target.value as IrrigationType)
              }
            >
              {IRRIGATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Soil type"
            htmlFor="soilType"
            hint="A rough type is enough — refine it later if needed."
          >
            <Select
              id="soilType"
              value={draft.soilType}
              onChange={(e) => set("soilType", e.target.value as SoilType)}
            >
              {SOIL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Season" htmlFor="season" hint="Kharif / Rabi / Zaid.">
            <Select
              id="season"
              value={draft.season}
              onChange={(e) => set("season", e.target.value as Season)}
            >
              {SEASON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Current crop (optional)</CardTitle>
            <CardDescription>
              You can also choose a crop later via the Crop Advisor.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Field
            label="What is currently growing?"
            htmlFor="selectedCrop"
            hint="Leave empty if undecided — the advisor will suggest options."
          >
            <Input
              id="selectedCrop"
              value={draft.selectedCrop ?? ""}
              onChange={(e) => set("selectedCrop", e.target.value || undefined)}
              placeholder="e.g. Wheat"
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link href="/dashboard" className="sm:order-1">
          <Button variant="secondary" className="w-full sm:w-auto">
            Cancel
          </Button>
        </Link>
        <Button
          variant="accent"
          className="w-full sm:w-auto"
          leftIcon={<Save className="h-4 w-4" aria-hidden />}
          onClick={handleSave}
        >
          Save farm profile
        </Button>
        {saved ? (
          <Link href="/crop-advisor" className="sm:order-2">
            <Button variant="primary" className="w-full sm:w-auto">
              Continue to Crop Advisor
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
