"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Leaf,
  UploadCloud,
  ImageIcon,
  CheckCircle2,
  X,
  Eye,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, DataSourceTag } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { prepareImage, type PreparedImage } from "@/lib/crop-health/client-image";
import type { NormalizedAnalysis } from "@/lib/crop-health/types";
import { useFarmProfile } from "@/lib/farm-context";
import { useTimeline } from "@/lib/timeline/timeline-context";
import { usePlanner } from "@/lib/planner/task-store";
import { CalendarPlus } from "lucide-react";

type Phase = "upload" | "analyzing" | "result";

/* ------------------------------------------------------------------ */
/* Client API call                                                     */
/* ------------------------------------------------------------------ */

/**
 * Posts the prepared image to the server route and returns the normalized
 * analysis. Any non-success server response resolves to provider-unavailable
 * (the server itself has already fallen back for provider failures).
 */
async function requestAnalysis(
  image: PreparedImage,
  farmContext: {
    selectedCrop?: string;
    season?: string;
    location?: string;
    irrigation?: string;
  }
): Promise<{ ok: true; analysis: NormalizedAnalysis } | { ok: false }> {
  const res = await fetch("/api/crop-health", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: image.base64,
      imageMimeType: image.mimeType,
      farmContext,
    }),
  });

  if (!res.ok) return { ok: false };

  const data = (await res.json()) as {
    status: string;
    analysis: NormalizedAnalysis;
  };
  if (data.status !== "success" || !data.analysis) return { ok: false };
  return { ok: true, analysis: data.analysis };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function CropHealthPage() {
  const { profile, setLatestHealthCheck } = useFarmProfile();
  const { emitEvent } = useTimeline();
  const { addTask } = usePlanner();
  const [followUpAdded, setFollowUpAdded] = useState(false);

  const [phase, setPhase] = useState<Phase>("upload");
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<NormalizedAnalysis | null>(null);
  const [showUnavailable, setShowUnavailable] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Revoke object URL on unmount to avoid leaks */
  useEffect(() => {
    return () => {
      if (image?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(image.previewUrl);
      }
    };
  }, [image]);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      setInputError(null);
      if (!file) return;

      const result = await prepareImage(file);
      if (result.status === "invalid") {
        setInputError(result.reason);
        return;
      }

      // Revoke the previous preview before replacing it.
      if (image?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(image.previewUrl);
      }
      setImage(result.image);
      setAnalysis(null);
      setPhase("upload");
      setFollowUpAdded(false);
    },
    [image]
  );

  const startAnalysis = useCallback(async () => {
    if (!image) return;
    setPhase("analyzing");
    setShowUnavailable(false);

    const outcome = await requestAnalysis(image, {
      selectedCrop: profile.selectedCrop,
      season: profile.season,
      location: profile.location,
      irrigation: profile.irrigation,
    });

    if (outcome.ok) {
      setAnalysis(outcome.analysis);
      setShowUnavailable(outcome.analysis.isFallback);

      // Lightweight summary for the Dashboard card (no image data).
      setLatestHealthCheck({
        crop:
          outcome.analysis.cropName ?? profile.selectedCrop ?? "Your crop",
        possibleCondition: outcome.analysis.possibleCondition,
        likelihood: outcome.analysis.likelihood,
        isFallback: outcome.analysis.isFallback,
        source: outcome.analysis.source,
        analyzedAt: outcome.analysis.analyzedAt,
      });
      // P1: actual action → timeline event (provenance-eligible).
      emitEvent({
        eventType: "HEALTH_CHECK",
        title: `Health check: ${
          outcome.analysis.cropName ?? profile.selectedCrop ?? "crop"
        }`,
        description: `Possible condition: ${outcome.analysis.possibleCondition} (visual likelihood: ${outcome.analysis.likelihood}).`,
        source: outcome.analysis.source,
        entityType: "health",
        entityId: outcome.analysis.analyzedAt,
      });
      setPhase("result");
    } else {
      // Request itself failed (network, etc.) — no fake results.
      setShowUnavailable(true);
      setPhase("upload");
    }
  }, [image, profile, setLatestHealthCheck]);

  const clearImage = useCallback(() => {
    if (image?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(image.previewUrl);
    }
    setImage(null);
    setAnalysis(null);
  }, [image]);

  const reset = useCallback(() => {
    clearImage();
    setInputError(null);
    setShowUnavailable(false);
    setPhase("upload");
  }, [clearImage]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        eyebrow="AI Crop Health Analysis — not a diagnosis"
        title="AI Crop Health Analysis"
        description="Upload a leaf photo for a cautious visual assessment. Always confirm with a qualified agriculture professional before treating."
      />

      {/* Trust/privacy note — technically true: nothing is persisted */}
      <Alert tone="info" title="How this works">
        Results are possible conditions with visual likelihood — never
        certainty. Uploaded images are used for this analysis flow and are not
        stored permanently.
      </Alert>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Leaf / crop image</CardTitle>
            <CardDescription>
              One clear, well-lit photo works best — JPEG, PNG or WEBP, up to
              5&nbsp;MB.
            </CardDescription>
          </div>
          {phase === "result" && analysis ? (
            <DataSourceTag source={analysis.source} />
          ) : null}
        </CardHeader>

        {/* ---------------- Upload / preview ---------------- */}
        {phase === "upload" ? (
          <CardContent>
            {!image ? (
              <>
                <label
                  htmlFor="leaf-upload"
                  className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-canopy-200 bg-canopy-50/40 px-6 py-10 text-center transition-colors hover:border-canopy-400 hover:bg-canopy-50"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-canopy-600 shadow-card">
                    <UploadCloud className="h-7 w-7" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-canopy-900">
                      Upload a clear leaf or crop image
                    </span>
                    <span className="mt-1 block text-xs text-loam-500">
                      Tap to choose an image — JPEG, PNG or WEBP
                    </span>
                  </span>
                </label>
                <input
                  ref={fileInputRef}
                  id="leaf-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    void handleFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                {inputError ? (
                  <Alert
                    tone="danger"
                    title="Image not usable"
                    className="mt-4"
                  >
                    {inputError}
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose another image
                      </Button>
                    </div>
                  </Alert>
                ) : null}
              </>
            ) : (
              <div className="flex flex-col gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.previewUrl}
                  alt={`Preview of selected crop image: ${image.fileName}`}
                  className="h-64 w-full rounded-xl border border-canopy-100 object-cover"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-canopy-100 bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-canopy-900">
                      {image.fileName}
                    </p>
                    <p className="text-xs text-loam-500">
                      {(image.fileSizeBytes / 1024).toFixed(0)} KB ·{" "}
                      {image.width}×{image.height}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="secondary" onClick={clearImage}>
                      <X className="h-4 w-4" aria-hidden />
                      Remove
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4" aria-hidden />
                      Replace
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="accent"
                    onClick={() => void startAnalysis()}
                    leftIcon={<Sparkles className="h-4 w-4" aria-hidden />}
                  >
                    Analyze image
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        ) : null}

        {/* ---------------- Analyzing ---------------- */}
        {phase === "analyzing" ? (
          <CardContent>
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col items-center gap-4 px-2 py-10 text-center"
            >
              <span
                className="h-10 w-10 animate-spin rounded-full border-2 border-canopy-200 border-t-canopy-700"
                aria-hidden
              />
              <div>
                <p className="text-sm font-semibold text-canopy-900">
                  Analyzing crop image…
                </p>
                <p className="mt-1 text-xs text-loam-500">
                  Usually takes a few seconds. You&apos;ll get a cautious
                  visual assessment.
                </p>
              </div>
            </div>
          </CardContent>
        ) : null}

        {/* ---------------- Result ---------------- */}
        {phase === "result" && analysis ? (
          <CardContent>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image?.previewUrl}
              alt={`Analyzed crop photo: ${image?.fileName ?? "leaf"}`}
              className="h-48 w-full rounded-xl border border-canopy-100 object-cover"
            />

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-loam-500">
                Possible condition
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-canopy-950">
                {analysis.possibleCondition}
              </p>
              {analysis.cropName ? (
                <p className="mt-1 text-sm text-loam-600">
                  Visual crop suggestion: {analysis.cropName}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="warning">
                  Visual likelihood: {analysis.likelihood}
                </Badge>
                {typeof analysis.confidence === "number" &&
                !analysis.isFallback ? (
                  <Badge tone="neutral">
                    Model confidence: {analysis.confidence.toFixed(2)} — not
                    agricultural certainty
                  </Badge>
                ) : null}
                {analysis.isFallback ? (
                  <Badge tone="warning">Fallback guidance</Badge>
                ) : null}
                {analysis.imageQualityInsufficient ? (
                  <Badge tone="warning">Image quality insufficient</Badge>
                ) : null}
              </div>
            </div>

            {/* Observations */}
            <section aria-label="What we observed" className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-loam-500">
                What we observed
              </p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {analysis.observations.map((o) => (
                  <li
                    key={o}
                    className="flex items-start gap-2 text-sm text-loam-700"
                  >
                    <Eye
                      className="mt-0.5 h-4 w-4 shrink-0 text-canopy-600"
                      aria-hidden
                    />
                    {o}
                  </li>
                ))}
              </ul>
            </section>

            {/* Actions */}
            <section aria-label="Recommended next steps" className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-loam-500">
                Recommended next steps
              </p>
              <ol className="mt-2 flex flex-col gap-1.5">
                {analysis.recommendedActions.map((a, i) => (
                  <li
                    key={a}
                    className="flex items-start gap-2 text-sm text-loam-700"
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-canopy-800 text-[10px] font-semibold text-white">
                      {i + 1}
                    </span>
                    {a}
                  </li>
                ))}
              </ol>
            </section>

            {/* Caveat / expert confirmation */}
            <Alert tone="warning" title="Important" className="mt-4">
              {analysis.caveat} This is an image-based screening aid, not a
              confirmed diagnosis. Confirm with a qualified agriculture
              professional.
            </Alert>

            {/* P1: health follow-up → Farm Plan (user-confirmed). */}
            {followUpAdded ? (
              <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-sprout-400/15 px-3 py-2 text-xs font-medium text-canopy-800">
                <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
                Follow-up added to your Farm Plan.
              </p>
            ) : (
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<CalendarPlus className="h-4 w-4" aria-hidden />}
                  onClick={() => {
                    addTask({
                      title: `Follow up: ${analysis.possibleCondition}`,
                      description: `Crop health check on ${
                        analysis.cropName ?? profile.selectedCrop ?? "your crop"
                      } indicated "${analysis.possibleCondition}" (visual likelihood: ${analysis.likelihood}). Re-inspect affected plants and confirm with a qualified agriculture professional before treatment.`,
                      category: "health-followup",
                      dueAt: new Date(Date.now() + 2 * 86400000)
                        .toISOString()
                        .slice(0, 10),
                      priority: analysis.likelihood === "likely" ? "high" : "medium",
                      source: "health",
                      sourceLabel: analysis.source,
                      isFallback: analysis.isFallback,
                      relatedHealthCheckId: analysis.analyzedAt,
                    });
                    setFollowUpAdded(true);
                  }}
                >
                  Add follow-up to Farm Plan
                </Button>
                {analysis.isFallback ? (
                  <p className="mt-1 text-[11px] text-loam-500">
                    Task will be labeled FALLBACK — derived from fallback guidance, not an AI model result.
                  </p>
                ) : null}
              </div>
            )}
          </CardContent>
        ) : null}

        {phase === "result" && analysis ? (
          <CardFooter>
            <p className="flex items-center gap-1.5 text-xs text-loam-500">
              <CheckCircle2
                className="h-3.5 w-3.5 text-sprout-500"
                aria-hidden
              />
              {analysis.isFallback
                ? "Fallback guidance — not an AI model result"
                : "AI model result"}
            </p>
            <Button size="sm" variant="secondary" onClick={reset}>
              <Leaf className="h-4 w-4" aria-hidden />
              Analyze another image
            </Button>
          </CardFooter>
        ) : null}
      </Card>

      {/* Fallback notice when the request itself failed */}
      {showUnavailable && phase === "upload" ? (
        <Alert
          tone="info"
          title="AI analysis is temporarily unavailable — showing fallback guidance"
        >
          The live model could not be reached, so conservative fallback
          guidance will be shown on the next successful analysis. You can
          retry at any time.
        </Alert>
      ) : null}
    </div>
  );
}
