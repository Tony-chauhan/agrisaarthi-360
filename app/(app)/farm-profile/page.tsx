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
import { useLanguage } from "@/lib/i18n/language-context";
import type { FarmProfile, IrrigationType, SoilType, Season } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Options                                                             */
/* ------------------------------------------------------------------ */

const IRRIGATION_OPTIONS: Array<{ value: IrrigationType }> = [
  { value: "rain-fed" },
  { value: "canal" },
  { value: "borewell" },
  { value: "drip" },
  { value: "sprinkler" },
];

const SOIL_OPTIONS: Array<{ value: SoilType }> = [
  { value: "black" },
  { value: "alluvial" },
  { value: "loamy" },
  { value: "sandy" },
  { value: "clay" },
  { value: "red" },
  { value: "laterite" },
];

const SEASON_OPTIONS: Array<{ value: Season }> = [
  { value: "kharif" },
  { value: "rabi" },
  { value: "zaid" },
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
  const { t } = useLanguage();
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
        eyebrow={t.farmProfile.eyebrow}
        title={t.farmProfile.title}
        description={t.farmProfile.description}
      />

      {saved ? (
        <Alert tone="success" title={t.farmProfile.savedTitle}>
          {t.farmProfile.savedBody}{" "}
          <Link
            href="/crop-advisor"
            className="font-medium underline underline-offset-2"
          >
            {t.farmProfile.savedLink}
          </Link>
          .
        </Alert>
      ) : null}

      {/* Sample farm shortcut — quiet utility row, never competing with
          the primary Save action below. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={loadSampleFarm}
          leftIcon={<Sparkles className="h-3.5 w-3.5" aria-hidden />}
        >
          Use Sample Farm
        </Button>
        {hasCompleteProfile ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetSession}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" aria-hidden />}
          >
            Clear session
          </Button>
        ) : null}
        <p className="text-xs text-loam-500">{t.farmProfile.sampleNote}</p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t.farmProfile.whoTitle}</CardTitle>
            <CardDescription>{t.farmProfile.whoDescription}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t.farmProfile.farmerName}
            htmlFor="farmerName"
            required
            error={errors.farmerName}
            hint={t.farmProfile.farmerNameHint}
          >
            <Input
              id="farmerName"
              value={draft.farmerName}
              onChange={(e) => set("farmerName", e.target.value)}
              placeholder={t.farmProfile.farmerNamePlaceholder}
              aria-invalid={Boolean(errors.farmerName)}
            />
          </Field>
          <Field
            label={t.farmProfile.location}
            htmlFor="location"
            required
            error={errors.location}
            hint={t.farmProfile.locationHint}
          >
            <Input
              id="location"
              value={draft.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder={t.farmProfile.locationPlaceholder}
              aria-invalid={Boolean(errors.location)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t.farmProfile.landTitle}</CardTitle>
            <CardDescription>
              {t.farmProfile.landDescription}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t.farmProfile.farmSize}
            htmlFor="farmSizeAcres"
            required
            error={errors.farmSizeAcres}
            hint={t.farmProfile.farmSizeHint}
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
            label={t.farmProfile.irrigation}
            htmlFor="irrigation"
            hint={t.farmProfile.irrigationHint}
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
                  {t.farmProfile.irrigationOptions[o.value]}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label={t.farmProfile.soilType}
            htmlFor="soilType"
            hint={t.farmProfile.soilTypeHint}
          >
            <Select
              id="soilType"
              value={draft.soilType}
              onChange={(e) => set("soilType", e.target.value as SoilType)}
            >
              {SOIL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t.farmProfile.soilOptions[o.value]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.farmProfile.season} htmlFor="season" hint={t.farmProfile.seasonHint}>
            <Select
              id="season"
              value={draft.season}
              onChange={(e) => set("season", e.target.value as Season)}
            >
              {SEASON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t.farmProfile.seasonOptions[o.value]}
                </option>
              ))}
            </Select>
          </Field>
          {/* Current crop — aligned to the two-column grid (issue 8) */}
          <Field
            label={t.farmProfile.cropLabel}
            htmlFor="selectedCrop"
            hint={t.farmProfile.cropHint}
          >
            <Input
              id="selectedCrop"
              value={draft.selectedCrop ?? ""}
              onChange={(e) => set("selectedCrop", e.target.value || undefined)}
              placeholder={t.farmProfile.cropPlaceholder}
            />
          </Field>
        </CardContent>
      </Card>

      {/* Actions — primary (Save) rightmost; DOM order = visual order,
          so keyboard order and mobile stacking stay sensible. */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/dashboard" className="flex">
          <Button variant="secondary" className="w-full sm:w-auto">
            {t.farmProfile.cancel}
          </Button>
        </Link>
        <Button
          variant="accent"
          className="w-full sm:w-auto"
          leftIcon={<Save className="h-4 w-4" aria-hidden />}
          onClick={handleSave}
        >
          {t.farmProfile.save}
        </Button>
        {saved ? (
          <Link href="/crop-advisor" className="flex">
            <Button variant="primary" className="w-full sm:w-auto">
              {t.farmProfile.continueToAdvisor}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
